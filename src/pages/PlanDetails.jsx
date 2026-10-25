import { useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Calendar,
    Users,
    Sparkles,
    AlertCircle,
    BookOpen,
    ArrowRight,
} from "lucide-react";
import { PRICING } from "@/lib/mock";
import { ALL_SEED_CURRICULUMS } from "@/services/curriculumService";
import EnquiryDialog from "@/components/EnquiryDialog";

export default function PlanDetails() {
    const { planId: paramPlanId } = useParams();
    const [searchParams] = useSearchParams();
    const planId = paramPlanId || searchParams.get("plan") || "guitar-foundation-3m";
    const navigate = useNavigate();

    const [showEnquiry, setShowEnquiry] = useState(false);
    const plan = PRICING.find((item) => item.id === planId && item.published !== false);
    const curriculums = ALL_SEED_CURRICULUMS.filter(
        (curriculum) => curriculum.status === "published" && curriculum.assignedPlanIds?.includes(planId)
    );

    if (!plan) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <header className="border-b border-white/10 bg-card/60">
                    <div className="container-hr h-16 flex items-center"><Link to="/" className="text-heading font-bold">HR Tunes</Link></div>
                </header>
                <main className="container-hr flex-1 py-20">
                    <div role="alert" className="card-hr max-w-2xl p-8">
                        <h1 className="text-heading text-2xl font-bold">Plan unavailable</h1>
                        <p className="mt-3 text-white/70">This course plan could not be found.</p>
                        <Link to="/plans" className="btn-primary mt-6 inline-flex">Browse Course Plans</Link>
                    </div>
                </main>
            </div>
        );
    }

    const policies = plan.policies || [];

    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="plan-details-page">
            {/* Header */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-30">
                <div className="container-hr h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-xs text-muted-foreground hover:text-white transition-colors">
                            Back to Home
                        </Link>
                        <Link to="/plans" className="btn-outline !py-1.5 !px-3 !text-xs">
                            Browse Course Plans
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container-hr py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="eyebrow flex items-center gap-2 mb-8 hover:text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft size={13} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Plan syllabus, features, policies */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* Header Banner */}
                        <div className="border border-white/15 bg-gradient-to-br from-card to-background p-8 relative overflow-hidden">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                                <Sparkles size={13} /> Official HRTunes Curriculum
                            </div>
                            <h1 className="text-display text-4xl sm:text-5xl mb-3">{plan.name}</h1>
                            <p className="text-white/80 text-base leading-relaxed max-w-xl">
                                {plan.tagline || plan.positioning || plan.description || plan.targetAudience || "Contact us to discuss this course plan."}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar size={13} className="text-primary" /> Cadence
                                    </div>
                                    <div className="text-heading font-bold text-base mt-1 capitalize">
                                        {plan.duration || plan.cadence?.replace("/", "") || "Contact us for details"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={13} className="text-primary" /> Session Length
                                    </div>
                                    <div className="text-heading font-bold text-base mt-1">{plan.sessionDuration || "Details on enquiry"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Users size={13} className="text-primary" /> Format
                                    </div>
                                    <div className="text-heading font-bold text-base mt-1">
                                        {plan.format || "Ask us about available batches"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What you will learn */}
                        <section className="card-hr p-8">
                            <div className="eyebrow text-primary mb-3">Learning Outcomes</div>
                            <h2 className="text-heading font-bold text-2xl mb-4">What you will master</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(plan.learningObjectives || []).map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-white/85">
                                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            {(!plan.learningObjectives || plan.learningObjectives.length === 0) && (
                                <p className="text-sm text-white/60">Learning outcomes will be discussed with the instructor.</p>
                            )}
                        </section>

                        {/* Included Curriculum Overview */}
                        <section className="card-hr p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="eyebrow text-primary">Syllabus Breakdown</div>
                                    <h2 className="text-heading font-bold text-2xl">Accessible Curriculum</h2>
                                </div>
                                <BookOpen size={20} className="text-muted-foreground" />
                            </div>

                            {plan.modules?.length > 0 && (
                                <ul className="mb-4 space-y-2">
                                    {plan.modules.map((module, index) => (
                                        <li key={`${module}-${index}`} className="border border-white/10 bg-card p-4 text-sm text-white/80">{module}</li>
                                    ))}
                                </ul>
                            )}
                            {curriculums.map((c) => (
                                <div key={c.id} className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded">
                                        <div className="font-bold text-base text-white">{c.title}</div>
                                        <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                                    </div>

                                    <div className="space-y-2">
                                        {c.levels?.map((lvl) => (
                                            <div key={lvl.id} className="p-4 bg-card border border-white/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm text-primary">{lvl.title}</span>
                                                    <span className="text-[11px] text-muted-foreground font-mono">
                                                        {lvl.modules?.length || 0} Modules · {lvl.modules?.reduce((acc, m) => acc + (m.sessions?.length || 0), 0) || 0} Lessons
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs text-white/70">
                                                    {lvl.modules?.map((m) => m.title).join(" · ")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {(!plan.modules || plan.modules.length === 0) && curriculums.length === 0 && (
                                <p className="text-sm text-white/60">Curriculum details are being prepared. Contact us for the current syllabus.</p>
                            )}
                        </section>

                        {/* Important Policies */}
                        {policies.length > 0 && <section className="card-hr p-8 border-amber-500/30 bg-amber-500/5">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle size={18} className="text-amber-400" />
                                <div className="eyebrow text-amber-400">Important Plan Policies</div>
                            </div>
                            <h2 className="text-heading font-bold text-xl mb-4 text-white">Enrollment & Attendance Terms</h2>
                            <div className="space-y-4">
                                {policies.map((p) => (
                                    <div key={p.id} className="border-l-2 border-amber-500/50 pl-4">
                                        <h4 className="font-bold text-sm text-amber-200">{p.title}</h4>
                                        <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{p.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>}
                    </div>

                    {/* Right Column: Pricing Summary, Terms Checkbox, Proceed CTA */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                        <div className="card-hr p-8 border-primary/30">
                            <div className="eyebrow text-primary mb-3">Course Plan</div>
                            <div className="flex items-baseline justify-between mb-1">
                                <h3 className="text-heading font-bold text-2xl">{plan.name}</h3>
                            </div>
                            <div className="text-xs text-muted-foreground">{plan.duration || plan.cadence?.replace("/", "") || "Duration details available on enquiry"}</div>

                            <div className="divider-dashed my-6" />

                            <p className="text-sm leading-relaxed text-white/70">
                                {plan.positioning || plan.description || plan.targetAudience || "Ask us about this course plan and its next available batch."}
                            </p>
                            <p className="mt-5 text-display text-3xl font-black text-primary">
                                {Number(plan.price) === 0 ? "Free" : `₹${Number(plan.price || 0).toLocaleString("en-IN")}`}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Payment is discussed and handled manually with the academy.</p>

                            <button
                                type="button"
                                onClick={() => setShowEnquiry(true)}
                                className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-4 font-display text-lg uppercase tracking-wider"
                                data-testid="enquire-now-btn"
                            >
                                Enquire Now
                                <ArrowRight size={18} />
                            </button>

                            <p className="mt-4 text-center text-xs text-muted-foreground">No student account or online payment required.</p>
                        </div>
                    </aside>
                </div>
            </main>
            {showEnquiry && <EnquiryDialog plan={plan} onClose={() => setShowEnquiry(false)} />}
        </div>
    );
}
