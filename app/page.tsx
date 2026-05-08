import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-slate-900 font-black text-sm">PT</span>
              </div>
              <span className="text-white font-bold text-lg">The Pulse Traders</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Affiliate Program — Now Open
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
            Earn <span className="text-amber-400">50% Commission</span>
            <br />on Every Sale You Refer
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Partner with The Pulse Traders and build a strong source of passive income online.
            Share your unique referral link and earn half of every successful purchase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
              Register as an Affiliate
            </Link>
            <Link href="/reviews" className="text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 font-semibold text-lg px-8 py-4 rounded-xl transition-all">
              See Client Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-amber-500 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "50%", label: "Commission Rate" },
            { value: "Unique", label: "Referral Link" },
            { value: "Live", label: "Dashboard Access" },
            { value: "Unlimited", label: "Earning Potential" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-slate-900 font-black text-2xl">{s.value}</div>
              <div className="text-slate-800 font-medium text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500 text-lg">Four simple steps to start earning</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Register", desc: "Fill in the affiliate registration form with your details." },
              { step: "02", title: "Get Your Link", desc: "Receive your unique referral link after account approval." },
              { step: "03", title: "Share", desc: "Share your link with your audience, clients, or social followers." },
              { step: "04", title: "Earn 50%", desc: "Earn 50% commission on every successful purchase through your link." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-amber-500 font-black text-4xl mb-3">{item.step}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Your Personal Affiliate Dashboard</h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Once approved, get instant access to a professional dashboard to monitor everything in real time.
              </p>
              <ul className="space-y-3">
                {[
                  "Total Sales Generated",
                  "Earned Commissions",
                  "Available Commission Balance",
                  "Withdrawn Commissions",
                  "My Clients & Their Purchases",
                  "Referral Performance Tracking",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-700">
                    <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 text-xs font-bold">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Total Sales", value: "$4,200" },
                  { label: "Earned", value: "$2,100" },
                  { label: "Available", value: "$850" },
                  { label: "Withdrawn", value: "$1,250" },
                ].map((card) => (
                  <div key={card.label} className="bg-slate-800 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">{card.label}</div>
                    <div className="text-amber-400 font-black text-xl">{card.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Recent Clients</div>
                {["Ahmed K. — $300 sale", "Sara M. — $150 sale", "John P. — $450 sale"].map((c) => (
                  <div key={c} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <span className="text-slate-300 text-sm">{c}</span>
                    <span className="text-green-400 text-xs font-bold">+50%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Why Join Our Affiliate Program?</h2>
          <p className="text-slate-400 text-lg mb-12">Everything you need for long-term passive income</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { icon: "💰", title: "High Commission Structure", desc: "Earn a full 50% on every sale — one of the highest rates available." },
              { icon: "🔗", title: "Unique Referral Link", desc: "Your personal link tracks every click and conversion automatically." },
              { icon: "📊", title: "Professional Dashboard", desc: "Monitor all your stats, clients, and earnings in one clean interface." },
              { icon: "♾️", title: "Unlimited Earning Potential", desc: "No cap on earnings — the more you refer, the more you make." },
              { icon: "🤝", title: "Long-Term Partnership", desc: "We invest in your success with ongoing support and resources." },
              { icon: "✅", title: "Trusted Platform", desc: "Backed by a professional trading education company with real results." },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-amber-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Ready to Start Earning?</h2>
          <p className="text-slate-800 text-lg mb-8">Join The Pulse Traders Affiliate Program today and start building your passive income.</p>
          <Link href="/register" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-black text-lg px-10 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl">
            Register Now — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-slate-900 font-black text-xs">PT</span>
            </div>
            <span className="text-white font-bold">The Pulse Traders</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/reviews" className="text-slate-400 hover:text-white text-sm transition-colors">Reviews</Link>
            <Link href="/register" className="text-slate-400 hover:text-white text-sm transition-colors">Register</Link>
            <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
          </div>
          <p className="text-slate-500 text-sm">© 2026 The Pulse Traders</p>
        </div>
      </footer>
    </div>
  );
}
