"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/referral", label: "My Referral Link", icon: "🔗" },
  { href: "/dashboard/clients", label: "My Clients", icon: "👥" },
  { href: "/dashboard/commissions", label: "Commissions", icon: "💰" },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: "💸" },
];

export default function DashboardSidebar({ name }: { name?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-900 font-black text-sm">PT</span>
          </div>
          <span className="text-white font-bold text-sm leading-tight">The Pulse Traders</span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          ✕
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Affiliate</p>
        <p className="text-white font-semibold text-sm truncate">{name || "Affiliate"}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 h-14 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center">
            <span className="text-slate-900 font-black text-xs">PT</span>
          </div>
          <span className="text-white font-bold text-sm">The Pulse Traders</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-300 hover:text-white p-2"
          aria-label="Open menu"
        >
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
          </div>
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-slate-900 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 flex-col h-full flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
