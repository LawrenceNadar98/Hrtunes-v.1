const PRIVATE_MEETING_URL = /https?:\/\/[^\s"'<>]*(?:zoom\.us|meet\.google\.com)[^\s"'<>]*/gi;
const PRIVATE_LINK_FIELD = /(?:zoom|meeting|join).*(?:url|link)|(?:url|link).*(?:zoom|meeting|join)/;

function isPrivateLinkField(name) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return PRIVATE_LINK_FIELD.test(normalized);
}

export function toPublicCatalogData(value) {
    if (Array.isArray(value)) {
        return value.map(toPublicCatalogData);
    }
    if (typeof value === "string") {
        return value.replace(PRIVATE_MEETING_URL, "").trim();
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    if (value instanceof Date || typeof value.toDate === "function") {
        return value;
    }

    return Object.entries(value).reduce((publicValue, [key, fieldValue]) => {
        if (!isPrivateLinkField(key)) {
            publicValue[key] = toPublicCatalogData(fieldValue);
        }
        return publicValue;
    }, {});
}
