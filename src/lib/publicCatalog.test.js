import { toPublicCatalogData } from "./publicCatalog";

describe("toPublicCatalogData", () => {
    test("removes meeting links from nested public catalog data", () => {
        const source = {
            title: "Guitar course",
            meetingUrl: "https://zoom.us/j/123456?pwd=secret",
            modules: [{
                title: "Live lesson",
                zoom_link: "https://zoom.us/j/654321",
                description: "Join here: https://meet.google.com/abc-defg-hij"
            }]
        };

        expect(toPublicCatalogData(source)).toEqual({
            title: "Guitar course",
            modules: [{
                title: "Live lesson",
                description: "Join here:"
            }]
        });
        expect(source.meetingUrl).toContain("secret");
    });

    test("preserves date and Firestore timestamp values", () => {
        const date = new Date("2025-01-01T00:00:00.000Z");
        const timestamp = { toDate: () => date };
        const sanitized = toPublicCatalogData({ date, timestamp });

        expect(sanitized.date).toBe(date);
        expect(sanitized.timestamp).toBe(timestamp);
    });
});
