import { useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { createEnquiryWhatsAppUrl, normalizeMobileNumber } from "@/lib/whatsapp";
import { BRAND } from "@/lib/mock";

export default function EnquiryDialog({ plan, onClose }) {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        batch: "",
        message: ""
    });
    const [phoneError, setPhoneError] = useState("");
    const [configError, setConfigError] = useState("");
    const submitted = useRef(false);

    const submitEnquiry = (event) => {
        event.preventDefault();
        if (submitted.current) return;
        const mobile = normalizeMobileNumber(form.phone);
        if (!mobile) {
            setPhoneError("Enter a valid mobile number with country code (8–15 digits).");
            return;
        }
        setPhoneError("");

        let url;
        try {
            url = createEnquiryWhatsAppUrl({
                plan,
                form,
                businessNumber: process.env.REACT_APP_INSTRUCTOR_WHATSAPP || BRAND.phone
            });
        } catch (error) {
            setConfigError(error.message);
            return;
        }

        submitted.current = true;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
    };

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
        if (event.target.name === "phone") setPhoneError("");
        setConfigError("");
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="enquiry-title"
                className="card-hr max-h-[90vh] w-full max-w-xl overflow-y-auto border-primary/40 bg-background p-6 sm:p-8"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="eyebrow text-primary mb-2">Course enquiry</div>
                        <h2 id="enquiry-title" className="text-heading text-2xl font-bold">Tell us about yourself</h2>
                        <p className="mt-1 text-sm text-white/70">Selected plan: <strong className="text-white">{plan.name}</strong></p>
                    </div>
                    <button type="button" onClick={onClose} className="text-muted-foreground hover:text-white" aria-label="Close enquiry form">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submitEnquiry} className="space-y-4">
                    <label className="block">
                        <span className="eyebrow mb-2 block">Full name *</span>
                        <input
                            required
                            minLength={2}
                            maxLength={100}
                            pattern=".*\S.*"
                            name="name"
                            value={form.name}
                            onChange={updateField}
                            autoComplete="name"
                            className="form-input"
                        />
                    </label>
                    <label className="block">
                        <span className="eyebrow mb-2 block">WhatsApp / mobile number *</span>
                        <input
                            required
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={updateField}
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            className="form-input"
                            aria-describedby={phoneError ? "enquiry-phone-error" : undefined}
                            aria-invalid={Boolean(phoneError)}
                        />
                        {phoneError && <span id="enquiry-phone-error" className="mt-1 block text-xs text-red-400">{phoneError}</span>}
                    </label>
                    <label className="block">
                        <span className="eyebrow mb-2 block">Email (optional)</span>
                        <input
                            type="email"
                            maxLength={254}
                            name="email"
                            value={form.email}
                            onChange={updateField}
                            autoComplete="email"
                            className="form-input"
                        />
                    </label>
                    <label className="block">
                        <span className="eyebrow mb-2 block">Student&apos;s experience level (optional)</span>
                        <select
                            name="experience"
                            value={form.experience || ""}
                            onChange={updateField}
                            className="form-input"
                        >
                            <option value="">Select experience level</option>
                            <option value="Complete beginner">Complete beginner</option>
                            <option value="Some experience">Some experience</option>
                            <option value="Intermediate">Intermediate</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="eyebrow mb-2 block">Preferred batch or schedule (optional)</span>
                        <input
                            maxLength={120}
                            name="batch"
                            value={form.batch}
                            onChange={updateField}
                            className="form-input"
                        />
                    </label>
                    <label className="block">
                        <span className="eyebrow mb-2 block">Additional message (optional)</span>
                        <textarea
                            rows={3}
                            maxLength={1000}
                            name="message"
                            value={form.message}
                            onChange={updateField}
                            className="form-input"
                        />
                    </label>

                    <p className="border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs leading-relaxed text-white/80">
                        WhatsApp will open with your enquiry prepared. Please press <strong>Send</strong> in WhatsApp to contact the academy; the message is not sent automatically.
                    </p>
                    {configError && <p role="alert" className="text-xs text-red-400">{configError}</p>}
                    <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2">
                        <MessageCircle size={16} /> Send enquiry on WhatsApp
                    </button>
                </form>
            </section>
        </div>
    );
}
