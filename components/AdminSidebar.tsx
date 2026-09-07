"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/Logo";

const links = [
  { href: "/admin", label: "Overview", icon: "📈" },
  { href: "/admin/affiliates", label: "Affiliates", icon: "👤" },
  { href: "/admin/payments", label: "Payments", icon: "💳" },
  { href: "/admin/courses", label: "Courses", icon: "🎓" },
  { href: "/admin/sales", label: "Log a Sale", icon: "🖊️" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "💸" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/signals", label: "Signal Stats", icon: "📡" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-hairline flex items-center justify-between">
        <Link href="/admin" onClick={() => setOpen(false)}>
          <Logo height={38} />
        </Link>
        <button onClick={() => setOpen(false)} className="md:hidden text-mist hover:text-ink p-1">
          ✕
        </button>
      </div>

      <div className="px-5 py-4 border-b border-hairline">
        <span className="inline-flex items-center gap-1.5 bg-gold-500/10 text-gold-highlight text-xs font-bold px-2.5 py-1 rounded-full border border-hairline">
          <span className="w-1.5 h-1.5 bg-gold-highlight rounded-full" />
          ADMIN PANEL
        </span>
      </div>

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
                  ? "bg-gold-500 text-void"
                  : "text-mist hover:bg-panel hover:text-ink"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-hairline">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-mist hover:bg-panel hover:text-ink transition-all"
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-abyss border-b border-hairline h-14 flex items-center justify-between px-4 shadow-lg">
        <Logo height={30} />
        <button
          onClick={() => setOpen(true)}
          className="text-mist hover:text-ink p-2"
          aria-label="Open menu"
        >
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-abyss border-r border-hairline z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </div>

      <aside className="hidden md:flex w-64 bg-abyss border-r border-hairline flex-col h-full flex-shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
