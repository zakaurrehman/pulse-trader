import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnSidebar from "@/components/LearnSidebar";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LearnSidebar name={session.user.name} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
