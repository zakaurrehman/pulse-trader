import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import OrderForm from "@/components/OrderForm";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const cookieStore = await cookies();
  const refCode = cookieStore.get("ref_code")?.value ?? "";
  const { service } = await searchParams;

  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <OrderForm
      defaultRefCode={refCode}
      defaultService={service ?? ""}
      courses={courses}
    />
  );
}
