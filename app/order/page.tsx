import { cookies } from "next/headers";
import OrderForm from "@/components/OrderForm";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const cookieStore = await cookies();
  const refCode = cookieStore.get("ref_code")?.value ?? "";
  const { service } = await searchParams;

  return <OrderForm defaultRefCode={refCode} defaultService={service ?? ""} />;
}
