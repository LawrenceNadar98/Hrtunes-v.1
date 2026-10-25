import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { PRICING } from "@/lib/mock";

export default function PlansCatalog() {
    const plans = PRICING.filter((plan) => plan.published !== false);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <SiteHeader />
            <main className="container-hr flex-1 py-16 md:py-24">
                <div className="mb-10">
                    <div className="eyebrow mb-3">Course plans</div>
                    <h1 className="text-display text-5xl md:text-6xl">Find your <span className="text-primary">next step</span>.</h1>
                    <p className="mt-4 max-w-2xl text-white/70">Explore our course plans, compare the details, and send an enquiry directly to the academy on WhatsApp.</p>
                </div>

                {plans.length === 0 ? (
                    <div className="card-hr p-10 text-center text-white/70">There are no published course plans at the moment. Please check back soon.</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <article key={plan.id} className={`card-hr flex flex-col p-7 ${plan.featured ? "border-primary" : ""}`}>
                                <div className="eyebrow text-primary">{plan.tagline || "Course plan"}</div>
                                <h2 className="mt-2 text-heading text-2xl font-bold">{plan.name}</h2>
                                <p className="mt-3 min-h-12 text-sm leading-relaxed text-white/70">{plan.positioning || plan.description || plan.targetAudience || "A structured learning plan with instructor guidance."}</p>
                                <div className="mt-5 flex items-baseline gap-2">
                                    <span className="text-display text-4xl font-black text-primary">
                                        {Number(plan.price) === 0 ? "Free" : `₹${Number(plan.price).toLocaleString("en-IN")}`}
                                    </span>
                                    {plan.cadence && <span className="text-xs text-white/60">{plan.cadence}</span>}
                                </div>
                                {plan.duration && <div className="mt-3 flex items-center gap-2 text-sm text-white/70"><Clock size={14} /> {plan.duration}</div>}
                                <ul className="mt-6 flex-1 space-y-2">
                                    {(plan.features || []).slice(0, 6).map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                                            <Check size={15} className="mt-0.5 shrink-0 text-primary" /> {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link to={`/plans/${plan.id}`} className="btn-primary mt-7 flex items-center justify-center gap-2">
                                    View Curriculum <ArrowRight size={15} />
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
}
