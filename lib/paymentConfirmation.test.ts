import { describe, it, expect, vi } from "vitest";
import {
  confirmPaymentRequest,
  reconcileEnrollment,
  isPaymentEnrolled,
  PaymentAlreadyProcessedError,
  InvalidReferralError,
  PaymentNotConfirmedError,
  type ConfirmationClient,
} from "./paymentConfirmation";

/**
 * A minimal in-memory fake that mimics just enough Postgres/Prisma behavior
 * for these tests to be meaningful:
 *
 *  - `paymentRequest.updateMany` is a synchronous check-then-set with no
 *    internal await, which faithfully reproduces the atomicity a real
 *    single-row `UPDATE ... WHERE status = 'PENDING'` gets from Postgres row
 *    locking — two "concurrent" calls via Promise.all will still only let
 *    one of them win the claim.
 *  - `$transaction` gives each call its own undo log and only unwinds that
 *    transaction's own writes on a thrown error (mirroring real transaction
 *    isolation) rather than restoring a single shared snapshot, which would
 *    incorrectly clobber a concurrently-committing transaction's writes.
 */
function makeFakeDb() {
  const state = {
    payments: new Map<string, any>(),
    users: new Map<string, any>(),
    courses: new Map<string, any>(),
    sales: [] as any[],
    commissions: [] as any[],
    enrollments: new Map<string, any>(),
  };

  function enrollmentKey(studentId: string, courseId: string) {
    return `${studentId}:${courseId}`;
  }

  function readOnlyOps() {
    return {
      paymentRequest: {
        async findUnique({ where: { id } }: any) {
          return state.payments.get(id) ?? null;
        },
      },
      user: {
        async findFirst({ where }: any) {
          const emailFilter = where.email;
          const target = typeof emailFilter === "string" ? emailFilter : emailFilter.equals;
          const insensitive = typeof emailFilter === "object" && emailFilter.mode === "insensitive";
          for (const u of state.users.values()) {
            const matches = insensitive
              ? u.email.toLowerCase() === target.toLowerCase()
              : u.email === target;
            if (matches && (!where.role || u.role === where.role)) return u;
          }
          return null;
        },
        async findUnique({ where }: any) {
          if (where.referralCode) {
            for (const u of state.users.values()) {
              if (u.referralCode === where.referralCode) return u;
            }
          }
          return null;
        },
      },
      course: {
        async findFirst({ where }: any) {
          for (const c of state.courses.values()) if (c.name === where.name) return c;
          return null;
        },
        async findUnique({ where }: any) {
          return state.courses.get(where.id) ?? null;
        },
      },
    };
  }

  function makeTx(undo: Array<() => void>): ConfirmationClient {
    const ro = readOnlyOps();
    return {
      ...ro,
      paymentRequest: {
        ...ro.paymentRequest,
        async updateMany({ where, data }: any) {
          const p = state.payments.get(where.id);
          if (!p || p.status !== where.status) return { count: 0 };
          const prev = { ...p };
          Object.assign(p, data);
          undo.push(() => Object.assign(p, prev));
          return { count: 1 };
        },
      },
      sale: {
        async create({ data }: any) {
          const sale = { id: `sale_${state.sales.length + 1}`, ...data };
          state.sales.push(sale);
          undo.push(() => {
            const idx = state.sales.indexOf(sale);
            if (idx >= 0) state.sales.splice(idx, 1);
          });
          return sale;
        },
      },
      commission: {
        async create({ data }: any) {
          state.commissions.push(data);
          undo.push(() => {
            const idx = state.commissions.indexOf(data);
            if (idx >= 0) state.commissions.splice(idx, 1);
          });
          return data;
        },
      },
      enrollment: {
        async upsert({ where, create }: any) {
          const key = enrollmentKey(where.studentId_courseId.studentId, where.studentId_courseId.courseId);
          const existed = state.enrollments.has(key);
          if (!existed) {
            state.enrollments.set(key, { id: key, ...create });
            undo.push(() => state.enrollments.delete(key));
          }
          return state.enrollments.get(key);
        },
        async findUnique({ where }: any) {
          const key = enrollmentKey(where.studentId_courseId.studentId, where.studentId_courseId.courseId);
          return state.enrollments.get(key) ?? null;
        },
      },
      async $transaction(fn: any) {
        // Nested transactions (reconcileEnrollment calling within an
        // already-open tx) just extend the same undo log.
        return fn(makeTx(undo));
      },
    };
  }

  const db: ConfirmationClient = {
    ...makeTx([]),
    async $transaction(fn: any) {
      const undo: Array<() => void> = [];
      try {
        return await fn(makeTx(undo));
      } catch (err) {
        for (let i = undo.length - 1; i >= 0; i--) undo[i]();
        throw err;
      }
    },
  };

  return { db, state };
}

function seedCourse(state: ReturnType<typeof makeFakeDb>["state"], overrides: Partial<any> = {}) {
  const course = { id: "course_1", name: "Advanced Trading Strategies", ...overrides };
  state.courses.set(course.id, course);
  return course;
}

function seedStudent(state: ReturnType<typeof makeFakeDb>["state"], overrides: Partial<any> = {}) {
  const user = { id: "student_1", email: "john@example.com", role: "STUDENT", ...overrides };
  state.users.set(user.id, user);
  return user;
}

function seedPayment(state: ReturnType<typeof makeFakeDb>["state"], overrides: Partial<any> = {}) {
  const payment = {
    id: "payment_1",
    clientName: "John Smith",
    clientEmail: "john@example.com",
    service: "Advanced Trading Strategies",
    courseId: null,
    amount: 100,
    referralCode: null,
    status: "PENDING",
    rejectedNote: null,
    ...overrides,
  };
  state.payments.set(payment.id, payment);
  return payment;
}

describe("confirmPaymentRequest", () => {
  it("grants enrollment on first-time confirmation when student + course both resolve", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedStudent(state);
    seedPayment(state, { courseId: course.id });

    const result = await confirmPaymentRequest(db, "payment_1");

    expect(result.payment.status).toBe("CONFIRMED");
    expect(result.enrolled).toBe(true);
    expect(result.studentFound).toBe(true);
    expect(state.enrollments.size).toBe(1);
  });

  it("rejects a repeated confirmation on an already-CONFIRMED payment, without duplicating side effects", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedStudent(state);
    seedPayment(state, {
      courseId: course.id,
      referralCode: "AFF1",
    });
    state.users.set("aff_1", { id: "aff_1", referralCode: "AFF1", status: "APPROVED" });

    await confirmPaymentRequest(db, "payment_1");
    expect(state.sales.length).toBe(1);
    expect(state.commissions.length).toBe(1);
    expect(state.enrollments.size).toBe(1);

    await expect(confirmPaymentRequest(db, "payment_1")).rejects.toBeInstanceOf(PaymentAlreadyProcessedError);

    // No duplicate commission or enrollment from the second, rejected attempt.
    expect(state.sales.length).toBe(1);
    expect(state.commissions.length).toBe(1);
    expect(state.enrollments.size).toBe(1);
  });

  it("lets only one of two concurrent confirm calls succeed (no double commission)", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedStudent(state);
    seedPayment(state, { courseId: course.id, referralCode: "AFF1" });
    state.users.set("aff_1", { id: "aff_1", referralCode: "AFF1", status: "APPROVED" });

    const results = await Promise.allSettled([
      confirmPaymentRequest(db, "payment_1"),
      confirmPaymentRequest(db, "payment_1"),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(PaymentAlreadyProcessedError);

    // Exactly one Sale/Commission/Enrollment — the race did not double-pay
    // the affiliate or attempt a second enrollment.
    expect(state.sales.length).toBe(1);
    expect(state.commissions.length).toBe(1);
    expect(state.enrollments.size).toBe(1);
  });

  it("resolves the course by courseId even after the course was renamed post-order", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state, { name: "Advanced Trading Strategies" });
    seedStudent(state);
    // Order snapshot captured the name at order time; course was renamed
    // before the admin got around to confirming (a multi-day manual review
    // window is normal for this business).
    seedPayment(state, { courseId: course.id, service: "Advanced Trading Strategies" });
    course.name = "Advanced Trading Strategies (2026 Edition)";

    const result = await confirmPaymentRequest(db, "payment_1");

    expect(result.enrolled).toBe(true);
    expect(state.enrollments.get("student_1:course_1")).toBeTruthy();
  });

  it("falls back to name-matching for legacy payments with no courseId", async () => {
    const { db, state } = makeFakeDb();
    seedCourse(state, { id: "course_legacy", name: "Basic Training" });
    seedStudent(state);
    seedPayment(state, { courseId: null, service: "Basic Training" });

    const result = await confirmPaymentRequest(db, "payment_1");

    expect(result.enrolled).toBe(true);
    expect(state.enrollments.has("student_1:course_legacy")).toBe(true);
  });

  it("matches the student account case-insensitively", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    // Order route always normalizes to lowercase; simulate a legacy account
    // registered before email normalization was added at registration.
    seedStudent(state, { email: "John@Example.com" });
    seedPayment(state, { courseId: course.id, clientEmail: "john@example.com" });

    const result = await confirmPaymentRequest(db, "payment_1");

    expect(result.studentFound).toBe(true);
    expect(result.enrolled).toBe(true);
  });

  it("confirms the payment even when no student account exists yet, without enrolling", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedPayment(state, { courseId: course.id }); // no student seeded

    const result = await confirmPaymentRequest(db, "payment_1");

    expect(result.payment.status).toBe("CONFIRMED");
    expect(result.enrolled).toBe(false);
    expect(result.studentFound).toBe(false);
    expect(state.enrollments.size).toBe(0);
  });

  it("rolls back the CONFIRMED status if the referral code is invalid", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedStudent(state);
    seedPayment(state, { courseId: course.id, referralCode: "BOGUS" });

    await expect(confirmPaymentRequest(db, "payment_1")).rejects.toBeInstanceOf(InvalidReferralError);

    // Transaction rollback: payment must still be PENDING, not stuck CONFIRMED
    // with no sale/commission ever recorded.
    expect(state.payments.get("payment_1").status).toBe("PENDING");
    expect(state.sales.length).toBe(0);
  });

  it("handles multiple different clients/orders independently", async () => {
    const { db, state } = makeFakeDb();
    const courseA = seedCourse(state, { id: "course_a", name: "Basic Training" });
    const courseB = seedCourse(state, { id: "course_b", name: "Mastery Bundle" });
    seedStudent(state, { id: "student_a", email: "a@example.com" });
    seedStudent(state, { id: "student_b", email: "b@example.com" });
    seedPayment(state, { id: "payment_a", courseId: courseA.id, clientEmail: "a@example.com" });
    seedPayment(state, { id: "payment_b", courseId: courseB.id, clientEmail: "b@example.com" });

    const [resultA, resultB] = await Promise.all([
      confirmPaymentRequest(db, "payment_a"),
      confirmPaymentRequest(db, "payment_b"),
    ]);

    expect(resultA.enrolled).toBe(true);
    expect(resultB.enrolled).toBe(true);
    expect(state.enrollments.has("student_a:course_a")).toBe(true);
    expect(state.enrollments.has("student_b:course_b")).toBe(true);
    expect(state.enrollments.size).toBe(2);
  });
});

describe("reconcileEnrollment", () => {
  it("grants access after the student registers later, without needing a new order", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedPayment(state, { courseId: course.id }); // confirmed below with no student yet

    const first = await confirmPaymentRequest(db, "payment_1");
    expect(first.enrolled).toBe(false);

    // Client registers afterwards.
    seedStudent(state);

    const retried = await reconcileEnrollment(db, "payment_1");
    expect(retried.enrolled).toBe(true);
    expect(state.enrollments.size).toBe(1);
  });

  it("is idempotent — retrying an already-enrolled payment does not duplicate the enrollment", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedStudent(state);
    seedPayment(state, { courseId: course.id });

    await confirmPaymentRequest(db, "payment_1");
    await reconcileEnrollment(db, "payment_1");
    await reconcileEnrollment(db, "payment_1");

    expect(state.enrollments.size).toBe(1);
  });

  it("refuses to reconcile a payment that was never confirmed", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedStudent(state);
    seedPayment(state, { courseId: course.id, status: "PENDING" });

    await expect(reconcileEnrollment(db, "payment_1")).rejects.toBeInstanceOf(PaymentNotConfirmedError);
  });
});

describe("isPaymentEnrolled", () => {
  it("reflects the live enrollment state on read, not a stale snapshot from confirm time", async () => {
    const { db, state } = makeFakeDb();
    const course = seedCourse(state);
    seedPayment(state, { courseId: course.id, status: "CONFIRMED" });
    const payment = state.payments.get("payment_1");

    expect(await isPaymentEnrolled(db, payment)).toBe(false);

    seedStudent(state);
    await reconcileEnrollment(db, "payment_1");

    expect(await isPaymentEnrolled(db, payment)).toBe(true);
  });
});
