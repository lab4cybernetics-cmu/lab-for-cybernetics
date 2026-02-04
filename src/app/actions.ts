"use server";

import { createMatchingItem } from "@/lib/notion";
import { revalidatePath } from "next/cache";

export async function submitMatchingApplication(formData: FormData) {
    const rawKeywords = formData.get("keywords") as string;
    const keywords = rawKeywords ? rawKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0) : [];

    const userType = formData.get("userType") as string;

    // For Practitioners, default to "not a scholar" since they don't see the question
    const practitionerStatus = userType === "Practitioner"
        ? "not a scholar"
        : (formData.get("practitionerStatus") as string) || "";

    const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string,
        domain: formData.get("domain") as string,
        whyImportant: formData.get("whyImportant") as string,
        committedTo: formData.get("committedTo") as string,
        whatToConserve: formData.get("whatToConserve") as string,
        about: formData.get("about") as string,
        effectiveCollaboration: formData.get("effectiveCollaboration") as string,
        userType: userType,
        organization: formData.get("organization") as string,
        practitionerStatus: practitionerStatus,
        timeCommitment: formData.get("timeCommitment") as string,
        surveyFeedback: formData.get("surveyFeedback") as string,
        keywords: keywords,
    };

    const success = await createMatchingItem(data);

    if (success) {
        revalidatePath("/matching");
        return { success: true };
    } else {
        return { success: false, error: "Failed to submit application. Please try again." };
    }
}
