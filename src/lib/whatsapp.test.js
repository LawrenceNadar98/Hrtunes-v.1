import { createEnquiryWhatsAppUrl, normalizeMobileNumber } from "./whatsapp";

describe("normalizeMobileNumber", () => {
    test("removes formatting while preserving the country code digits", () => {
        expect(normalizeMobileNumber(" +91 (98765) 43210 ")).toBe("919876543210");
    });

    test("rejects numbers outside the supported international length", () => {
        expect(normalizeMobileNumber("1234567")).toBeNull();
        expect(normalizeMobileNumber("1234567890123456")).toBeNull();
        expect(normalizeMobileNumber("0123456789")).toBeNull();
        expect(normalizeMobileNumber("not a phone 12345678")).toBeNull();
    });
});

describe("createEnquiryWhatsAppUrl", () => {
    const form = {
        name: "Asha & Ravi",
        phone: "+91 98765 43210",
        email: "asha@example.com",
        experience: "Complete beginner",
        batch: "Evenings",
        message: "Interested in the beginner plan"
    };
    const plan = { name: "3-Month Guitar Foundation" };

    test("encodes the plan and enquiry fields into a click-to-chat URL", () => {
        const url = new URL(createEnquiryWhatsAppUrl({
            plan,
            form,
            businessNumber: "+1 (234) 567-8901"
        }));

        expect(url.origin + url.pathname).toBe("https://wa.me/12345678901");
        expect(url.searchParams.get("text")).toContain("Name: Asha & Ravi");
        expect(url.searchParams.get("text")).toContain("Mobile: 919876543210");
        expect(url.searchParams.get("text")).toContain(`Selected Plan: ${plan.name}`);
        expect(url.searchParams.get("text")).toContain("Experience Level: Complete beginner");
        expect(url.searchParams.get("text")).toContain("Preferred Batch: Evenings");
        expect(url.searchParams.get("text")).toContain("Message: Interested in the beginner plan");
    });

    test("omits optional fields when they are empty", () => {
        const url = new URL(createEnquiryWhatsAppUrl({
            plan,
            form: { ...form, email: "", batch: "", message: "" },
            businessNumber: "1234567890"
        }));

        expect(url.searchParams.get("text")).not.toContain("Email:");
        expect(url.searchParams.get("text")).not.toContain("Preferred Batch:");
        expect(url.searchParams.get("text")).not.toContain("Message:");
    });

    test("rejects an unconfigured business WhatsApp number", () => {
        expect(() => createEnquiryWhatsAppUrl({
            plan,
            form,
            businessNumber: ""
        })).toThrow("WhatsApp enquiries are not configured.");
    });
});
