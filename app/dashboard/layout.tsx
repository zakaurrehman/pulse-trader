import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AFFILIATE") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar name={session.user.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
