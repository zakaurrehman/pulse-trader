import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";

const AVATAR_COLORS = [
  "bg-amber-500", "bg-blue-500", "bg-green-500",
  "bg-purple-500", "bg-rose-500", "bg-teal-500",
];

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default async function LandingPage() {
  const [dbSignalStats, approvedReviews] = await Promise.all([
    prisma.signalStat.findMany({ orderBy: { pair: "asc" } }).catch(() => []),
    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }).catch(() => []),
  ]);

  const signalStats = dbSignalStats.map((s) => ({
    ...s,
    bars: s.barValues.split(",").map(Number),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo height={42} />
            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors">Home</a>
              <a href="#about" className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors">About</a>
              <a href="#services" className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors">Services</a>
              <a href="#faq" className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors">FAQ</a>
              <a href="#contact" className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors hidden sm:block">
                Login
              </Link>
              <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
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
            <a href="#services" className="text-slate-300 hover:text-white border border-slate-600 hover:border-amber-500/50 font-semibold text-lg px-8 py-4 rounded-xl transition-all">
              View Our Services
            </a>
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
      <section id="about" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Start Earning in 4 Simple Steps</h2>
            <p className="text-slate-500 text-lg">No experience needed — just share and earn</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Register", desc: "Fill in the affiliate registration form with your details." },
              { step: "02", title: "Get Your Link", desc: "Receive your unique referral link after account approval." },
              { step: "03", title: "Share", desc: "Share your link with your audience, clients, or social followers." },
              { step: "04", title: "Earn 50%", desc: "Earn 50% commission on every successful purchase through your link." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="text-amber-500 font-black text-4xl mb-3">{item.step}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services / Pricing */}
      <section id="services" className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Our Services
            </div>
            <h2 className="text-4xl font-black text-white mb-3">Choose Your Trading Package</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Select the plan that fits your trading journey. All packages include access to our expert community and resources.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Basic Training",
                original: "$37.70",
                price: "$30.16",
                period: "one-time",
                badge: null,
                popular: false,
                disabled: false,
                features: ["Forex fundamentals course", "Chart reading basics", "Risk management guide", "Community access", "Email support"],
                cta: "Get Started",
              },
              {
                name: "Advanced Trading Strategies",
                original: "$128.70",
                price: "$102.96",
                period: "one-time",
                badge: "Most Popular",
                popular: true,
                disabled: false,
                features: ["All Basic features", "Advanced technical analysis", "Entry & exit strategies", "Weekly live sessions", "Priority support", "Strategy playbooks"],
                cta: "Get Started",
              },
              {
                name: "Mastery Bundle",
                original: "$154.70",
                price: "$123.76",
                period: "one-time",
                badge: "Best Value",
                popular: false,
                disabled: false,
                features: ["All Advanced features", "Full course library access", "Exclusive masterclasses", "Trade review sessions", "Lifetime updates", "1-on-1 onboarding call"],
                cta: "Get Started",
              },
              {
                name: "Premium Signals",
                original: "$63.70",
                price: "$50.96",
                period: "per month",
                badge: null,
                popular: false,
                disabled: false,
                features: ["Daily forex signals", "XAU/USD & major pairs", "Entry, TP & SL included", "Telegram delivery", "Win rate tracking"],
                cta: "Subscribe",
              },
              {
                name: "Personal Mentorship",
                original: "$258.70",
                price: "$206.96",
                period: "one-time",
                badge: null,
                popular: false,
                disabled: false,
                features: ["All Mastery Bundle features", "4 private mentorship calls", "Personalized trade plan", "Psychology coaching", "Direct mentor access", "Portfolio review"],
                cta: "Apply Now",
              },
              {
                name: "Trading Bot",
                original: null,
                price: "TBA",
                period: "coming soon",
                badge: "Coming Soon",
                popular: false,
                disabled: true,
                features: ["Automated trade execution", "Custom strategy config", "Risk management built-in", "Performance analytics", "24/7 market monitoring"],
                cta: "Notify Me",
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-6 flex flex-col border transition-all hover:-translate-y-1 ${
                  pkg.popular
                    ? "bg-amber-500 border-amber-400 shadow-2xl shadow-amber-500/20"
                    : pkg.disabled
                    ? "bg-slate-800/50 border-slate-700/50 opacity-75"
                    : "bg-slate-800 border-slate-700 hover:border-amber-500/30"
                }`}
              >
                {pkg.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap ${
                    pkg.popular
                      ? "bg-slate-900 text-amber-400"
                      : pkg.disabled
                      ? "bg-slate-700 text-slate-300"
                      : "bg-amber-500 text-slate-900"
                  }`}>
                    {pkg.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className={`font-bold text-lg mb-3 ${pkg.popular ? "text-slate-900" : "text-white"}`}>{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {pkg.original && (
                      <span className={`text-sm line-through ${pkg.popular ? "text-slate-700" : "text-slate-500"}`}>{pkg.original}</span>
                    )}
                    {pkg.original && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pkg.popular ? "bg-slate-900/20 text-slate-900" : "bg-amber-500/20 text-amber-400"}`}>
                        20% OFF
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-3xl font-black ${pkg.popular ? "text-slate-900" : pkg.disabled ? "text-slate-400" : "text-amber-400"}`}>
                      {pkg.price}
                    </span>
                    <span className={`text-sm ml-1 ${pkg.popular ? "text-slate-800" : "text-slate-500"}`}>/{pkg.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        pkg.popular ? "bg-slate-900/20 text-slate-900" : "bg-amber-500/20 text-amber-400"
                      }`}>✓</span>
                      <span className={`text-sm ${pkg.popular ? "text-slate-800" : "text-slate-400"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={pkg.disabled ? "#" : `/order?service=${encodeURIComponent(pkg.name)}`}
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    pkg.popular
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : pkg.disabled
                      ? "bg-slate-700/50 text-slate-500 cursor-not-allowed pointer-events-none"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-900"
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Signal Performance — data from DB */}
      <section className="py-20 px-4 bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live Performance
            </div>
            <h2 className="text-4xl font-black text-white mb-3">Signal Performance Stats</h2>
            <p className="text-slate-400 text-lg">Transparent, real-time tracking across our active signal pairs</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {signalStats.map((stat) => (
              <div key={stat.pair} className="bg-slate-900 rounded-2xl p-5 border border-slate-700 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-black text-lg">{stat.pair}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    stat.winRate >= 90 ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {stat.winRate}% win
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Win Rate</span>
                    <span className="text-green-400 font-bold">{stat.winRate}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                      style={{ width: `${stat.winRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Total Signals</div>
                    <div className="text-white font-bold">{stat.totalSignals}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Profit (Pips)</div>
                    <div className="text-green-400 font-bold">{stat.profitPips}</div>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-2">Recent Performance</div>
                  <div className="flex items-end gap-1 h-8">
                    {stat.bars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-amber-500/60 rounded-sm hover:bg-amber-500 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
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
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                Affiliate Dashboard
              </div>
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

      {/* Why choose us */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Why Choose Us
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Built for Serious Traders &amp; Affiliates</h2>
            <p className="text-slate-500 text-lg">What sets The Pulse Traders apart from the rest</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏆", title: "Experienced Team", desc: "Our mentors have years of live trading experience across forex, commodities, and indices — not just theoretical knowledge." },
              { icon: "🎯", title: "Practical Teaching", desc: "We focus on real-world trade setups you can execute immediately, not just concepts you have to figure out on your own." },
              { icon: "🧭", title: "Independent Focus", desc: "We teach you to trade independently and read the market yourself — no lifelong dependency on signals." },
              { icon: "📐", title: "Professional Approach", desc: "Structured curriculum, disciplined risk management, and consistent strategy — built the professional way." },
              { icon: "🌱", title: "Beginner Friendly", desc: "Start from zero. Our step-by-step foundation courses are designed for complete beginners with no prior experience." },
              { icon: "💰", title: "High Commission Rate", desc: "Earn 50% on every sale you refer — one of the most generous affiliate structures in the trading education space." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl mb-4">{item.icon}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — real approved reviews from DB */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Student Reviews
            </div>
            <h2 className="text-4xl font-black mb-3">What Our Students Say</h2>
            <p className="text-slate-400 text-lg">Real results from real people in our community</p>
          </div>

          {approvedReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No reviews yet — be the first to share your experience.</p>
              <Link href="/reviews" className="inline-block mt-4 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Submit a Review →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedReviews.map((review, i) => (
                  <div key={review.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-amber-500/20 transition-all flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-black text-sm">{getInitials(review.clientName)}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{review.clientName}</p>
                        <p className="text-slate-500 text-xs">Verified Student</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <span key={j} className="text-amber-400 text-sm">★</span>
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, j) => (
                        <span key={j} className="text-slate-600 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic flex-1">&ldquo;{review.content}&rdquo;</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/reviews" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  See all reviews →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              FAQ
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know about our affiliate program</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How does the affiliate program work?",
                a: "Register as an affiliate, get approved, and receive your unique referral link. Share it with your audience. Every time someone purchases a service through your link, you earn 50% of the sale value.",
              },
              {
                q: "When and how do I get paid?",
                a: "Commissions are tracked in real time on your dashboard. Once you accumulate a balance, you can request a withdrawal through your affiliate dashboard. Payments are processed manually by our admin team.",
              },
              {
                q: "Is there a minimum withdrawal amount?",
                a: "Yes, there is a minimum threshold for withdrawals. This ensures efficient processing. The exact amount is shown on your withdrawal page once your account is approved.",
              },
              {
                q: "How long does account approval take?",
                a: "Applications are typically reviewed within 24–48 hours. You will be notified once your account is approved and your referral link is activated.",
              },
              {
                q: "Can I promote multiple services?",
                a: "Yes — your single referral link applies to all services and packages. Any purchase made through your link, regardless of which package, earns you 50% commission.",
              },
            ].map((item) => (
              <details key={item.q} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-900">{item.q}</span>
                  <span className="text-amber-500 font-bold text-xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 px-4 bg-amber-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Ready to Start Earning?</h2>
          <p className="text-slate-800 text-lg mb-8">Join The Pulse Traders Affiliate Program today and start building your passive income stream.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-black text-lg px-10 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl">
              Register Now — It&apos;s Free
            </Link>
            <Link href="/login" className="inline-block bg-transparent border-2 border-slate-900 text-slate-900 font-bold text-lg px-10 py-4 rounded-xl transition-all hover:bg-slate-900 hover:text-white">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-3">
                <Logo height={32} />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Professional trading education and affiliate program with industry-leading 50% commissions.</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-3">Quick Links</p>
              <div className="space-y-2">
                {[
                  { href: "#home", label: "Home" },
                  { href: "#about", label: "About" },
                  { href: "#services", label: "Services" },
                  { href: "#faq", label: "FAQ" },
                ].map((l) => (
                  <a key={l.label} href={l.href} className="block text-slate-400 hover:text-amber-400 text-sm transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-3">Affiliate</p>
              <div className="space-y-2">
                <Link href="/register" className="block text-slate-400 hover:text-amber-400 text-sm transition-colors">Register</Link>
                <Link href="/login" className="block text-slate-400 hover:text-amber-400 text-sm transition-colors">Login</Link>
                <Link href="/reviews" className="block text-slate-400 hover:text-amber-400 text-sm transition-colors">Reviews</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-sm">© 2026 The Pulse Traders. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/reviews" className="text-slate-400 hover:text-white text-sm transition-colors">Reviews</Link>
              <Link href="/register" className="text-slate-400 hover:text-white text-sm transition-colors">Register</Link>
              <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
