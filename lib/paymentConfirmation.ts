import type { PaymentRequest, Course, User } from "@/app/generated/prisma/client";

export type Logger = (event: string, data: Record<string, unknown>) => void;

export const noopLogger: Logger = () => {};

export class PaymentAlreadyProcessedError extends Error {
  constructor(paymentId: string) {
    super(`Payment ${paymentId} was already actioned by another request.`);
    this.name = "PaymentAlreadyProcessedError";
  }
}

export class InvalidReferralError extends Error {
  constructor(public readonly code: string) {
    super(`Referral code "${code}" is invalid or the affiliate is not approved.`);
    this.name = "InvalidReferralError";
  }
}

export class PaymentNotFoundError extends Error {
  constructor(paymentId: string) {
    super(`Payment ${paymentId} not found.`);
    this.name = "PaymentNotFoundError";
  }
}

export class PaymentNotConfirmedError extends Error {
  constructor(paymentId: string, status: string) {
    super(`Payment ${paymentId} has status ${status}; enrollment can only be reconciled for CONFIRMED payments.`);
    this.name = "PaymentNotConfirmedError";
  }
}

export type EnrollmentOutcome = {
  payment: PaymentRequest;
  enrolled: boolean;
  studentFound: boolean;
  courseResolved: boolean;
};

/**
 * Narrow, structural subset of PrismaClient (and Prisma.TransactionClient,
 * which satisfies the same shape) needed by this module. Keeping it minimal
 * lets tests supply a plain mock instead of the full generated client.
 */
export interface ConfirmationDb {
  paymentRequest: {
    findUnique(args: { where: { id: string } }): Promise<PaymentRequest | null>;
    updateMany(args: {
      where: { id: string; status: string };
      data: Record<string, unknown>;
    }): Promise<{ count: number }>;
  };
  user: {
    findFirst(args: unknown): Promise<User | null>;
    findUnique(args: unknown): Promise<User | null>;
  };
  course: {
    findFirst(args: unknown): Promise<Course | null>;
    findUnique(args: unknown): Promise<Course | null>;
  };
  sale: {
    create(args: unknown): Promise<{ id: string }>;
  };
  commission: {
    create(args: unknown): Promise<unknown>;
  };
  enrollment: {
    upsert(args: unknown): Promise<unknown>;
    findUnique(args: unknown): Promise<unknown | null>;
  };
}

export interface ConfirmationClient extends ConfirmationDb {
  $transaction<T>(fn: (tx: ConfirmationDb) => Promise<T>): Promise<T>;
}

/**
 * Resolve the course a payment is for. `courseId` (set at order time) is
 * authoritative and immune to the course being renamed afterwards. Falls
 * back to matching on the `service` name snapshot for legacy payment
 * requests created before `courseId` existed, or if the linked course row
 * was later deleted.
 */
async function resolveCourse(tx: ConfirmationDb, payment: PaymentRequest): Promise<Course | null> {
  if (payment.courseId) {
    const byId = await tx.course.findUnique({ where: { id: payment.courseId } });
    if (byId) return byId;
  }
  return tx.course.findFirst({ where: { name: payment.service } });
}

/**
 * Resolve the student account tied to a payment. Case-insensitive because
 * registration historically stored email exactly as typed while orders
 * always normalize to trim + lowercase (see app/api/order/route.ts) — an
 * exact match silently misses accounts whose casing differs.
 */
async function resolveStudent(tx: ConfirmationDb, payment: PaymentRequest): Promise<User | null> {
  return tx.user.findFirst({
    where: { email: { equals: payment.clientEmail, mode: "insensitive" }, role: "STUDENT" },
  });
}

async function grantEnrollmentIfPossible(
  tx: ConfirmationDb,
  payment: PaymentRequest,
  log: Logger,
  event: string
): Promise<{ enrolled: boolean; studentFound: boolean; courseResolved: boolean }> {
  const course = await resolveCourse(tx, payment);
  const student = await resolveStudent(tx, payment);

  log(`${event}.lookups`, {
    paymentId: payment.id,
    clientEmail: payment.clientEmail,
    service: payment.service,
    courseResolved: !!course,
    courseId: course?.id ?? null,
    studentFound: !!student,
    studentId: student?.id ?? null,
  });

  if (!student || !course) {
    log(`${event}.enrollment_skipped`, {
      paymentId: payment.id,
      reason: !student ? "student_account_not_found" : "course_not_resolved",
    });
    return { enrolled: false, studentFound: !!student, courseResolved: !!course };
  }

  // Idempotent: safe to call repeatedly (e.g. on retry) without creating
  // duplicate access records, since (studentId, courseId) is unique.
  await tx.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    update: {},
    create: { studentId: student.id, courseId: course.id, paymentRequestId: payment.id },
  });

  log(`${event}.enrolled`, { paymentId: payment.id, studentId: student.id, courseId: course.id });
  return { enrolled: true, studentFound: true, courseResolved: true };
}

/**
 * Confirms a PENDING payment request: atomically claims it (guarding
 * against a second concurrent confirm from creating a duplicate
 * Sale/Commission), logs the affiliate's sale + commission if a referral
 * code applies, and grants course enrollment if the course and student
 * account can both be resolved right now.
 *
 * Enrollment failure does NOT roll back the payment confirmation — the
 * payment genuinely was received. Callers must inspect `enrolled` and, if
 * false, surface it so an admin can retry via `reconcileEnrollment` once the
 * blocking condition (e.g. missing student account) is resolved.
 */
export async function confirmPaymentRequest(
  client: ConfirmationClient,
  paymentId: string,
  log: Logger = noopLogger
): Promise<EnrollmentOutcome> {
  return client.$transaction(async (tx) => {
    // Atomic claim: only the request that flips PENDING -> CONFIRMED
    // proceeds. A second concurrent/duplicate confirm request (double
    // click, retried network request) sees count === 0 and bails out
    // instead of creating a second Sale/Commission for the same payment.
    const claim = await tx.paymentRequest.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "CONFIRMED" },
    });
    if (claim.count === 0) {
      log("confirm.already_processed", { paymentId });
      throw new PaymentAlreadyProcessedError(paymentId);
    }

    const payment = await tx.paymentRequest.findUnique({ where: { id: paymentId } });
    if (!payment) throw new PaymentNotFoundError(paymentId);
    log("confirm.claimed", { paymentId, clientEmail: payment.clientEmail, service: payment.service });

    if (payment.referralCode) {
      const affiliate = await tx.user.findUnique({ where: { referralCode: payment.referralCode } });
      if (!affiliate || affiliate.status !== "APPROVED") {
        throw new InvalidReferralError(payment.referralCode);
      }
      const sale = await tx.sale.create({
        data: {
          affiliateId: affiliate.id,
          clientName: payment.clientName,
          clientEmail: payment.clientEmail,
          amount: payment.amount,
          description: payment.service,
        },
      });
      await tx.commission.create({
        data: { saleId: sale.id, affiliateId: affiliate.id, amount: payment.amount * 0.5 },
      });
      log("confirm.commission_created", { paymentId, affiliateId: affiliate.id, saleId: sale.id });
    }

    const { enrolled, studentFound, courseResolved } = await grantEnrollmentIfPossible(tx, payment, log, "confirm");
    return { payment, enrolled, studentFound, courseResolved };
  });
}

/** Rejects a PENDING payment request. Atomic + idempotent like confirm. */
export async function rejectPaymentRequest(
  client: ConfirmationClient,
  paymentId: string,
  rejectedNote: string | null,
  log: Logger = noopLogger
): Promise<PaymentRequest> {
  const claim = await client.paymentRequest.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "REJECTED", rejectedNote },
  });
  if (claim.count === 0) {
    log("reject.already_processed", { paymentId });
    throw new PaymentAlreadyProcessedError(paymentId);
  }
  const payment = await client.paymentRequest.findUnique({ where: { id: paymentId } });
  if (!payment) throw new PaymentNotFoundError(paymentId);
  log("reject.done", { paymentId });
  return payment;
}

/**
 * Re-attempts enrollment for a payment that is already CONFIRMED but never
 * got an access record (e.g. the client hadn't registered a student account
 * yet, or their account email differed in case at the time). This is the
 * supported "fix it" path — it replaces resubmitting a brand new order,
 * which is what was silently forcing clients to "confirm" repeatedly.
 */
export async function reconcileEnrollment(
  client: ConfirmationClient,
  paymentId: string,
  log: Logger = noopLogger
): Promise<EnrollmentOutcome> {
  return client.$transaction(async (tx) => {
    const payment = await tx.paymentRequest.findUnique({ where: { id: paymentId } });
    if (!payment) throw new PaymentNotFoundError(paymentId);
    if (payment.status !== "CONFIRMED") {
      throw new PaymentNotConfirmedError(paymentId, payment.status);
    }

    const { enrolled, studentFound, courseResolved } = await grantEnrollmentIfPossible(tx, payment, log, "reconcile");
    return { payment, enrolled, studentFound, courseResolved };
  });
}

/**
 * Derives, on read, whether a CONFIRMED payment currently has a matching
 * enrollment. Used to surface "confirmed but not enrolled" payments in the
 * admin UI instead of that state being invisible after the initial confirm.
 */
export async function isPaymentEnrolled(client: ConfirmationDb, payment: PaymentRequest): Promise<boolean> {
  const course = await resolveCourse(client, payment);
  if (!course) return false;
  const student = await resolveStudent(client, payment);
  if (!student) return false;
  const enrollment = await client.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
  });
  return !!enrollment;
}
