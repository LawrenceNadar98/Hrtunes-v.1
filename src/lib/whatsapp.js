export function normalizeMobileNumber(value) {
    const formattedNumber = String(value || "").trim();
    if (!/^\+?[\d\s().-]+$/.test(formattedNumber)) return null;
    let digits = formattedNumber.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) return null;
    return digits;
}

export function createEnquiryWhatsAppUrl({ plan, form, businessNumber }) {
    const destination = normalizeMobileNumber(businessNumber);
    if (!destination) {
        throw new Error("WhatsApp enquiries are not configured.");
    }

    const mobile = normalizeMobileNumber(form.phone);
    if (!mobile) throw new Error("Enter a valid mobile number with country code (8–15 digits).");

    const message = [
        "Hello, I am interested in enrolling in a course.",
        "",
        `Name: ${form.name.trim()}`,
        `Mobile: ${mobile}`,
        form.email.trim() ? `Email: ${form.email.trim()}` : null,
        `Selected Plan: ${plan.name}`,
        form.experience && form.experience.trim() ? `Experience Level: ${form.experience.trim()}` : null,
        form.batch.trim() ? `Preferred Batch: ${form.batch.trim()}` : null,
        form.message.trim() ? `Message: ${form.message.trim()}` : null
    ].filter(Boolean).join("\n");

    return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
}
