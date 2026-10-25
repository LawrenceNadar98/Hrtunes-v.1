import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";
import { COURSES as defaultCourses, PRICING as defaultPlans, INSTRUMENTS as defaultInstruments } from "@/lib/mock";
import { seedInitialGuitarCurriculum } from "./curriculumService";
import { toPublicCatalogData } from "@/lib/publicCatalog";

const PLANS_KEY = "hrtunes_plans";
const COURSES_KEY = "hrtunes_courses";
const INSTRUMENTS_KEY = "hrtunes_instruments";

// Initialize local store with production plans, courses, and instruments
function initLocalStore() {
    try {
        const storedPlans = localStorage.getItem(PLANS_KEY);
        if (!storedPlans) {
            localStorage.setItem(PLANS_KEY, JSON.stringify(defaultPlans));
        }

        const storedCourses = localStorage.getItem(COURSES_KEY);
        if (!storedCourses) {
            localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses.map(toPublicCatalogData)));
        }

        const storedInstruments = localStorage.getItem(INSTRUMENTS_KEY);
        if (!storedInstruments) {
            localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(defaultInstruments || []));
        }
    } catch {
        localStorage.setItem(PLANS_KEY, JSON.stringify(defaultPlans));
        localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses.map(toPublicCatalogData)));
        localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(defaultInstruments || []));
    }
}
initLocalStore();

/**
 * Seeds default production plans, courses, and curriculum into Firebase Firestore idempotently
 */
export async function seedDatabaseToFirebase() {
    if (!isFirebaseConfigured || !db) {
        console.info("Firebase not configured. Production plans and curriculum active in local storage.");
        await seedInitialGuitarCurriculum();
        return { success: true, mode: "local", message: "Data active in local storage." };
    }

    try {
        console.log("💳 Seeding production Plans into Firestore...");
        for (const plan of defaultPlans) {
            const planRef = doc(db, "plans", plan.id);
            const existingPlan = await getDoc(planRef);
            if (!existingPlan.exists()) {
                await setDoc(planRef, plan);
            }
        }

        console.log("📚 Seeding Courses into Firestore...");
        for (const course of defaultCourses) {
            const courseRef = doc(db, "courses", course.id);
            const existingCourse = await getDoc(courseRef);
            if (!existingCourse.exists()) {
                await setDoc(courseRef, course);
            }
        }

        console.log("🎸 Seeding Instruments into Firestore...");
        for (const inst of defaultInstruments) {
            const instrumentRef = doc(db, "instruments", inst.id);
            const existingInstrument = await getDoc(instrumentRef);
            if (!existingInstrument.exists()) {
                await setDoc(instrumentRef, inst);
            }
        }

        await seedInitialGuitarCurriculum();

        return { success: true, mode: "firestore", message: "Cloud database seeded successfully with production plans & curriculum!" };
    } catch (err) {
        console.error("Failed to seed database to Firestore:", err);
        return { success: false, error: err.message };
    }
}

/* ==================== PLANS ==================== */
export async function getPlans() {
    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        const snap = await getDocs(collection(db, "plans"));
        const plans = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
        return plans;
    }
    try {
        const stored = localStorage.getItem(PLANS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    return defaultPlans;
}

export async function getPublishedPlans() {
    const plans = await getPlans();
    return plans.filter((plan) => plan.published !== false);
}

export async function savePlan(plan) {
    const planId = plan.id || "plan-" + Date.now();
    const updatedPlan = { ...plan, id: planId };

    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        await setDoc(doc(db, "plans", planId), updatedPlan, { merge: true });
    }

    const plans = await getPlans();
    const idx = plans.findIndex((p) => p.id === planId);
    if (idx >= 0) {
        plans[idx] = updatedPlan;
    } else {
        plans.push(updatedPlan);
    }
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    return {
        plan: updatedPlan,
        persistence: isFirebaseConfigured ? "firestore" : "local"
    };
}

export async function deletePlan(planId) {
    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        await deleteDoc(doc(db, "plans", planId));
    }

    const plans = await getPlans();
    const filtered = plans.filter((p) => p.id !== planId);
    localStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
    return true;
}

/* ==================== INSTRUMENTS ==================== */
export async function getInstruments() {
    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDocs(collection(db, "instruments"));
            if (!snap.empty) {
                const insts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(insts));
                return insts;
            }
        } catch (err) {
            console.warn("Firestore getInstruments failed, using local fallback:", err);
        }
    }
    try {
        const stored = localStorage.getItem(INSTRUMENTS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    return defaultInstruments || [];
}

export async function saveInstrument(instrument) {
    const instId = instrument.id || (instrument.name ? instrument.name.toLowerCase().replace(/\s+/g, "-") : "inst-" + Date.now());
    const updated = { ...instrument, id: instId };

    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        await setDoc(doc(db, "instruments", instId), updated, { merge: true });
    }

    const insts = await getInstruments();
    const idx = insts.findIndex((i) => i.id === instId || i.name?.toLowerCase() === updated.name?.toLowerCase());
    if (idx >= 0) {
        insts[idx] = updated;
    } else {
        insts.push(updated);
    }
    localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(insts));
    return updated;
}

export async function deleteInstrument(instrumentId) {
    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        await deleteDoc(doc(db, "instruments", instrumentId));
    }

    const insts = await getInstruments();
    const filtered = insts.filter((i) => i.id !== instrumentId);
    localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(filtered));
    return true;
}

/* ==================== COURSES ==================== */
export async function getCourses() {
    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        let isAdmin = false;
        if (auth?.currentUser) {
            const profile = await getDoc(doc(db, "users", auth.currentUser.uid));
            isAdmin = ["admin", "instructor"].includes(profile.data()?.role);
        }
        const collectionName = isAdmin ? "courses" : "publicCourses";
        const snap = await getDocs(collection(db, collectionName));
        const courses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isAdmin) {
            await syncPublicCourses(courses);
        }
        localStorage.setItem(COURSES_KEY, JSON.stringify(courses.map(toPublicCatalogData)));
        return courses;
    }
    try {
        const stored = localStorage.getItem(COURSES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const publicCourses = parsed.map(toPublicCatalogData);
                localStorage.setItem(COURSES_KEY, JSON.stringify(publicCourses));
                return publicCourses;
            }
        }
        return defaultCourses.map(toPublicCatalogData);
    } catch {
        return defaultCourses.map(toPublicCatalogData);
    }
}

async function syncPublicCourses(courses) {
    const publicCoursesSnapshot = await getDocs(collection(db, "publicCourses"));
    const publicIds = new Set(publicCoursesSnapshot.docs.map((course) => course.id));
    const privateIds = new Set(courses.map((course) => course.id));

    for (const course of courses) {
        await setDoc(doc(db, "publicCourses", course.id), toPublicCatalogData(course));
    }
    for (const course of publicCoursesSnapshot.docs) {
        if (!privateIds.has(course.id)) {
            await deleteDoc(doc(db, "publicCourses", course.id));
        }
    }
}

export async function getCourseById(courseId) {
    const courses = await getCourses();
    return courses.find((c) => c.id === courseId) || null;
}

export async function saveCourse(course) {
    const courseId = course.id || "course-" + Date.now();
    const updatedCourse = { ...course, id: courseId };

    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        await setDoc(doc(db, "courses", courseId), updatedCourse, { merge: true });
        await setDoc(doc(db, "publicCourses", courseId), toPublicCatalogData(updatedCourse));
    }

    const courses = await getCourses();
    const idx = courses.findIndex((c) => c.id === courseId);
    if (idx >= 0) {
        courses[idx] = updatedCourse;
    } else {
        courses.push(updatedCourse);
    }
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses.map(toPublicCatalogData)));
    return updatedCourse;
}

export async function deleteCourse(courseId) {
    if (isFirebaseConfigured && !db) {
        throw new Error("Firebase is configured, but Firestore is unavailable.");
    }
    if (isFirebaseConfigured) {
        await deleteDoc(doc(db, "publicCourses", courseId));
        await deleteDoc(doc(db, "courses", courseId));
    }

    const courses = await getCourses();
    const filtered = courses.filter((c) => c.id !== courseId);
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered.map(toPublicCatalogData)));
    return true;
}
