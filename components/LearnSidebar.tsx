"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function LearnSidebar({ name }: { name?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo height={38} />
        </Link>
        <button onClick={() => setOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">✕</button>
      </div>

      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Student</p>
        <p className="text-white font-semibold text-sm truncate">{name || "Student"}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/learn"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            pathname === "/learn"
              ? "bg-amber-500 text-slate-900"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>🎓</span> My Courses
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/order"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <span>🛒</span> Enroll in More Courses
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 h-14 flex items-center justify-between px-4 shadow-lg">
        <Logo height={30} />
        <button onClick={() => setOpen(true)} className="text-slate-300 hover:text-white p-2" aria-label="Open menu">
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
          </div>
        </button>
      </div>

      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      <div className={`md:hidden fixed top-0 left-0 h-full w-72 bg-slate-900 z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </div>

      <aside className="hidden md:flex w-64 bg-slate-900 flex-col h-full flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
