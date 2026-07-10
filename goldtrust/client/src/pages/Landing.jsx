import { Link } from "react-router-dom";
import { Coins, ShieldCheck, PiggyBank, TrendingUp, Users, ArrowRight } from "lucide-react";
import SavingsRing from "../components/SavingsRing";

const features = [
  {
    icon: PiggyBank,
    title: "Daily, weekly or monthly savings",
    body: "Set a target and a rhythm. A field agent collects your contribution, or you fund it yourself — either way, it's tracked to the naira.",
  },
  {
    icon: TrendingUp,
    title: "Credit built from your habit",
    body: "Every deposit strengthens your score. Consistent savers unlock larger loans, faster, without paperwork trips to a branch.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed, then approved",
    body: "Every loan is checked by a staff officer before a manager signs off — a second pair of eyes on every disbursement.",
  },
  {
    icon: Users,
    title: "One platform, five desks",
    body: "Clients, field staff, front desk, IT and management all work from the same live ledger — nobody reconciles spreadsheets by hand.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-forest-600 text-white p-1.5">
            <Coins size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl text-ink">GoldTrust</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-ink/70 hover:text-ink px-4 py-2">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Open an account
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-4">
            Microfinance, made for daily life
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-ink">
            Save daily.
            <br />
            Borrow smart.
          </h1>
          <p className="mt-5 text-ink/60 text-base md:text-lg max-w-md">
            GoldTrust turns small, regular savings into real credit history — so when
            you need a loan, your track record does the talking.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-primary">
              Start saving today <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost">
              I'm a staff member
            </Link>
          </div>
        </div>

        <div className="card p-8 flex items-center gap-8 justify-center">
          <SavingsRing value={135000} target={200000} size={168} />
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/40">Savings goal</p>
              <p className="stat-num text-xl text-ink">₦200,000</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/40">Saved so far</p>
              <p className="stat-num text-xl text-forest-600">₦135,000</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/40">Credit score</p>
              <p className="stat-num text-xl text-gold-600">712 · LOW risk</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-forest-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <h2 className="font-display text-2xl md:text-3xl text-ink max-w-lg">
            Everything a savings-and-loan business runs on, in one place.
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="rounded-full bg-forest-50 text-forest-600 p-2.5 w-fit mb-4">
                  <f.icon size={18} />
                </div>
                <h3 className="font-semibold text-ink">{f.title}</h3>
                <p className="text-sm text-ink/55 mt-1.5 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 md:px-10 py-10 text-sm text-ink/40 flex items-center justify-between">
        <span>© {new Date().getFullYear()} GoldTrust Microfinance</span>
        <span>Built for savers and field teams</span>
      </footer>
    </div>
  );
}
