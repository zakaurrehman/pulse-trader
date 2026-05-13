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
              <a href="#home" className="text-slate-300 hover:text-yellow-400 text-sm font-medium transition-colors">Home</a>
              <a href="#courses" className="text-slate-300 hover:text-yellow-400 text-sm font-medium transition-colors">Courses</a>
              <a href="#about" className="text-slate-300 hover:text-yellow-400 text-sm font-medium transition-colors">About</a>
              <a href="#testimonials" className="text-slate-300 hover:text-yellow-400 text-sm font-medium transition-colors">Testimonials</a>
              <a href="#faq" className="text-slate-300 hover:text-yellow-400 text-sm font-medium transition-colors">FAQ</a>
              <a href="#contact" className="text-slate-300 hover:text-yellow-400 text-sm font-medium transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors hidden sm:block">
                Login
              </Link>
              <Link href="/order" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Professional Trading Course &nbsp;·&nbsp; Enrollment Open
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
            Learn Professional Trading<br />
            <span className="text-yellow-400">From Scratch</span>
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Learn practical trading strategies, risk management, psychology, and live market analysis
            through structured mentorship and real-world lessons.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/order" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
              Enroll Now
            </Link>
            <a href="#courses" className="text-slate-300 hover:text-white border border-slate-600 hover:border-yellow-500/50 font-semibold text-lg px-8 py-4 rounded-xl transition-all">
              View Curriculum
            </a>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-yellow-500 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Students Trained" },
            { value: "6", label: "Professional Courses" },
            { value: "Live", label: "Mentorship Sessions" },
            { value: "Lifetime", label: "Course Access" },
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
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Start Learning in 4 Simple Steps</h2>
            <p className="text-slate-500 text-lg">No experience needed — just choose a course and begin learning</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "📚", num: "01", title: "Browse Courses", desc: "Explore all available trading courses and choose the one that fits your learning goals." },
              { step: "🔍", num: "02", title: "Select Course", desc: "Open the course details to check syllabus, level, and what you will learn." },
              { step: "💳", num: "03", title: "Buy & Enroll", desc: "Click the Enroll button and complete payment to get instant access." },
              { step: "🎓", num: "04", title: "Start Learning", desc: "Get access to the course and start learning at your own pace with mentor support." },
            ].map((item) => (
              <div key={item.num} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="text-3xl mb-2">{item.step}</div>
                <div className="text-yellow-500 font-black text-2xl mb-2">{item.num}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses / Pricing */}
      <section id="courses" className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Our Courses
            </div>
            <h2 className="text-4xl font-black text-white mb-3">Choose Your Learning Path</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every course is built around real market experience. Pick the level that matches your goals and start today.
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
                features: ["Forex fundamentals", "Chart reading basics", "Risk management guide", "Community access", "Email support"],
                cta: "Enroll Now",
              },
              {
                name: "Advanced Trading Strategies",
                original: "$128.70",
                price: "$102.96",
                period: "one-time",
                badge: "Most Popular",
                popular: true,
                disabled: false,
                features: ["All Basic content", "Advanced technical analysis", "Entry & exit strategies", "Weekly live sessions", "Priority support", "Strategy playbooks"],
                cta: "Enroll Now",
              },
              {
                name: "Mastery Bundle",
                original: "$154.70",
                price: "$123.76",
                period: "one-time",
                badge: "Best Value",
                popular: false,
                disabled: false,
                features: ["Full course library", "Exclusive masterclasses", "Trade review sessions", "Lifetime updates", "1-on-1 onboarding call"],
                cta: "Enroll Now",
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
                features: ["Full Mastery Bundle", "4 private mentorship calls", "Personalized trade plan", "Psychology coaching", "Direct mentor access"],
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
                    ? "bg-yellow-500 border-yellow-400 shadow-2xl shadow-yellow-500/20"
                    : pkg.disabled
                    ? "bg-slate-800/50 border-slate-700/50 opacity-75"
                    : "bg-slate-800 border-slate-700 hover:border-yellow-500/30"
                }`}
              >
                {pkg.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap ${
                    pkg.popular
                      ? "bg-slate-900 text-yellow-400"
                      : pkg.disabled
                      ? "bg-slate-700 text-slate-300"
                      : "bg-yellow-500 text-slate-900"
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
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pkg.popular ? "bg-slate-900/20 text-slate-900" : "bg-yellow-500/20 text-yellow-400"}`}>
                        20% OFF
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-3xl font-black ${pkg.popular ? "text-slate-900" : pkg.disabled ? "text-slate-400" : "text-yellow-400"}`}>
                      {pkg.price}
                    </span>
                    <span className={`text-sm ml-1 ${pkg.popular ? "text-slate-800" : "text-slate-500"}`}>/{pkg.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        pkg.popular ? "bg-slate-900/20 text-slate-900" : "bg-yellow-500/20 text-yellow-400"
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
                      : "bg-yellow-500 hover:bg-yellow-400 text-slate-900"
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Signal Performance */}
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
              <div key={stat.pair} className="bg-slate-900 rounded-2xl p-5 border border-slate-700 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-black text-lg">{stat.pair}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    stat.winRate >= 90 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
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
                      className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
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
                        className="flex-1 bg-yellow-500/60 rounded-sm hover:bg-yellow-500 transition-colors"
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

      {/* Student Dashboard Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                Student Dashboard
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Your Personal Learning Dashboard</h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Access your dashboard to track your learning progress and manage your enrolled courses in real time.
              </p>
              <ul className="space-y-3">
                {[
                  "My Enrolled Courses",
                  "Learning Progress Tracker",
                  "Completed Lessons & Topics",
                  "Saved Courses for Later",
                  "Live Session Schedule",
                  "Account & Profile Settings",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-700">
                    <span className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-600 text-xs font-bold">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-bold text-sm">My Learning</p>
                <span className="text-xs text-yellow-400 font-semibold bg-yellow-500/10 px-2 py-1 rounded-full">3 Active</span>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { name: "Advanced Trading Strategies", progress: 68 },
                  { name: "Premium Signals", progress: 100 },
                  { name: "Basic Training", progress: 100 },
                ].map((c) => (
                  <div key={c.name} className="bg-slate-800 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 text-xs font-medium truncate mr-2">{c.name}</span>
                      <span className="text-yellow-400 text-xs font-bold flex-shrink-0">{c.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Next Live Session</div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-bold">XAU/USD Live Analysis</p>
                    <p className="text-slate-400 text-xs mt-0.5">Today · 8:00 PM PKT</p>
                  </div>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Why Choose Us
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Built for Serious Traders</h2>
            <p className="text-slate-500 text-lg">What sets The Pulse Traders apart from every other course</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏆", title: "Experienced Mentors", desc: "Our mentors have years of live trading experience across forex, commodities, and indices — not just theory." },
              { icon: "🎯", title: "Practical Teaching", desc: "We focus on real-world trade setups you can execute immediately, not concepts you have to figure out alone." },
              { icon: "🧭", title: "Trade Independently", desc: "We teach you to read the market yourself so you are never dependent on anyone for your trading decisions." },
              { icon: "📐", title: "Structured Curriculum", desc: "Disciplined curriculum, clear risk management rules, and consistent strategy — designed professionally." },
              { icon: "🌱", title: "Beginner Friendly", desc: "Start from absolute zero. Our foundation courses are built for complete beginners with no prior experience." },
              { icon: "🤝", title: "Ongoing Support", desc: "Get access to our community, live sessions, and mentor support even after completing your course." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-2xl mb-4">{item.icon}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Student Reviews
            </div>
            <h2 className="text-4xl font-black mb-3">What Our Students Say</h2>
            <p className="text-slate-400 text-lg">Real results from real people in our community</p>
          </div>

          {approvedReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No reviews yet — be the first to share your experience.</p>
              <Link href="/reviews" className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                Submit a Review →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedReviews.map((review, i) => (
                  <div key={review.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-500/20 transition-all flex flex-col">
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
                        <span key={j} className="text-yellow-400 text-sm">★</span>
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
                <Link href="/reviews" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
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
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              FAQ
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know before you enroll</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How does the learning platform work?",
                a: "Browse our available trading courses, select the one that suits your level, complete the payment, and get instant access to start learning.",
              },
              {
                q: "When do I get access after purchasing a course?",
                a: "You get access as soon as your payment is confirmed by our team — usually within a few hours. You will be contacted directly with your access details.",
              },
              {
                q: "Is there a refund policy?",
                a: "There is no minimum purchase limit. Refund terms depend on the specific course. Please contact us via WhatsApp before purchasing if you have any questions.",
              },
              {
                q: "How long does it take to complete a course?",
                a: "It depends on the course and your pace. Most students complete foundation courses in 2–4 weeks with consistent daily study.",
              },
              {
                q: "Can I enroll in multiple courses?",
                a: "Yes — you can enroll in as many courses as you want and learn at your own pace. The Mastery Bundle gives you access to the full course library.",
              },
              {
                q: "Do you offer live sessions?",
                a: "Yes. Selected courses include weekly live market analysis sessions with our mentors. Schedules are shared after enrollment.",
              },
            ].map((item) => (
              <details key={item.q} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-900">{item.q}</span>
                  <span className="text-yellow-500 font-bold text-xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
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
      <section id="contact" className="py-20 px-4 bg-yellow-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Start Your Trading Journey Today</h2>
          <p className="text-slate-800 text-lg mb-8">Join hundreds of students already learning professional trading with The Pulse Traders.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/order" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-black text-lg px-10 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl">
              Enroll Now — Get Started
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
              <p className="text-slate-400 text-sm leading-relaxed">Professional forex trading education with live mentorship, structured courses, and real-world market training.</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-3">Quick Links</p>
              <div className="space-y-2">
                {[
                  { href: "#home", label: "Home" },
                  { href: "#courses", label: "Courses" },
                  { href: "#about", label: "About" },
                  { href: "#testimonials", label: "Testimonials" },
                  { href: "#faq", label: "FAQ" },
                ].map((l) => (
                  <a key={l.label} href={l.href} className="block text-slate-400 hover:text-yellow-400 text-sm transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-3">Account</p>
              <div className="space-y-2">
                <Link href="/order" className="block text-slate-400 hover:text-yellow-400 text-sm transition-colors">Enroll Now</Link>
                <Link href="/login" className="block text-slate-400 hover:text-yellow-400 text-sm transition-colors">Login</Link>
                <Link href="/reviews" className="block text-slate-400 hover:text-yellow-400 text-sm transition-colors">Reviews</Link>
                <Link href="/register" className="block text-slate-400 hover:text-yellow-400 text-sm transition-colors">Affiliate Program</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-sm">© 2026 The Pulse Traders. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/reviews" className="text-slate-400 hover:text-white text-sm transition-colors">Reviews</Link>
              <Link href="/order" className="text-slate-400 hover:text-white text-sm transition-colors">Enroll</Link>
              <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
