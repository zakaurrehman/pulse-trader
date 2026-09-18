import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  confirmPaymentRequest,
  rejectPaymentRequest,
  reconcileEnrollment,
  isPaymentEnrolled,
  PaymentAlreadyProcessedError,
  InvalidReferralError,
  PaymentNotFoundError,
  PaymentNotConfirmedError,
  type ConfirmationClient,
  type Logger,
} from "@/lib/paymentConfirmation";

// Cast is safe: PrismaClient (and the Prisma.TransactionClient passed into
// its $transaction callback) structurally implements everything
// ConfirmationClient declares — see lib/paymentConfirmation.ts.
const db = prisma as unknown as ConfirmationClient;

const log: Logger = (event, data) => {
  console.log(`[PAYMENT_CONFIRM] ${event}`, JSON.stringify(data));
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const codes = requests.map((r) => r.referralCode).filter(Boolean) as string[];
  const affiliates = codes.length
    ? await prisma.user.findMany({
        where: { referralCode: { in: codes } },
        select: { referralCode: true, fullName: true, username: true },
      })
    : [];

  const affiliateMap = Object.fromEntries(
    affiliates.map((a) => [a.referralCode!, { fullName: a.fullName, username: a.username }])
  );

  // Surface, per confirmed payment, whether it actually has a matching
  // enrollment right now — this used to be a one-time snapshot returned
  // only at confirm time and then forgotten. Making it a live, derived
  // value lets the admin see and fix a stuck payment instead of the
  // failure being invisible.
  const confirmed = requests.filter((r) => r.status === "CONFIRMED");
  const enrolledMap = new Map<string, boolean>();
  for (const payment of confirmed) {
    enrolledMap.set(payment.id, await isPaymentEnrolled(db, payment));
  }

  return NextResponse.json(
    requests.map((r) => ({
      ...r,
      affiliate: r.referralCode ? (affiliateMap[r.referralCode] ?? null) : null,
      enrolled: r.status === "CONFIRMED" ? (enrolledMap.get(r.id) ?? false) : null,
    }))
  );
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, action, rejectedNote } = body;

  if (!id || !["confirm", "reject", "retryEnrollment"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (action === "reject") {
      const updated = await rejectPaymentRequest(db, id, rejectedNote?.trim() || null, log);
      return NextResponse.json(updated);
    }

    if (action === "retryEnrollment") {
      const result = await reconcileEnrollment(db, id, log);
      return NextResponse.json({
        payment: result.payment,
        enrolled: result.enrolled,
        studentFound: result.studentFound,
        courseResolved: result.courseResolved,
      });
    }

    // action === "confirm"
    const result = await confirmPaymentRequest(db, id, log);
    return NextResponse.json({
      payment: result.payment,
      enrolled: result.enrolled,
      studentFound: result.studentFound,
      courseResolved: result.courseResolved,
    });
  } catch (err) {
    if (err instanceof PaymentNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (err instanceof PaymentAlreadyProcessedError) {
      return NextResponse.json({ error: "Already actioned" }, { status: 409 });
    }
    if (err instanceof InvalidReferralError) {
      return NextResponse.json(
        { error: "Referral code is invalid or affiliate is not approved." },
        { status: 400 }
      );
    }
    if (err instanceof PaymentNotConfirmedError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("[PAYMENT_CONFIRM] unhandled_error", { id, action, error: String(err) });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
