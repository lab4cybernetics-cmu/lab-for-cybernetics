"use server";

import { createMatchingItem, getVerificationData, storeVerificationCode, incrementResendCount, updateMatchingItem, setResendCount } from "@/lib/notion";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";



/**
 * Next.js Server Action to submit a new entry to the Matching database.
 * Invoked by the main application form on the frontend.
 * 
 * @param {FormData} formData The raw form data sent from the browser.
 * @returns {Promise<{ success: boolean; error?: string }>} True if successful, otherwise contains an error message.
 */
export async function submitMatchingApplication(formData: FormData) {
    // ... existing code ...

    const rawKeywords = formData.get("keywords") as string;
    const keywords = rawKeywords ? rawKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0) : [];

    const userType = formData.get("userType") as string;

    // For Practitioners, default to "not a scholar" since they don't see the question
    const practitionerStatus = userType === "Practitioner"
        ? "Not a Scholar"
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

    const result = await createMatchingItem(data);

    if (result.success) {
        revalidatePath("/matching");
        return { success: true };
    } else {
        return { success: false, error: result.message || "Failed to submit application. Please try again." };
    }
}

/**
 * Next.js Server Action to update an existing entry in the Matching database.
 * Used when an applicant edits their own details after email verification.
 * 
 * @param {string} id The Notion page ID belonging to the user.
 * @param {FormData} formData The raw form data sent from the browser.
 * @returns {Promise<{ success: boolean; error?: string }>} True if successful, otherwise contains an error message.
 */
export async function updateMatchingApplication(id: string, formData: FormData) {
    const rawKeywords = formData.get("keywords") as string;
    const keywords = rawKeywords ? rawKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0) : [];

    const userType = formData.get("userType") as string;

    const practitionerStatus = userType === "Practitioner"
        ? "Not a Scholar"
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

    const result = await updateMatchingItem(id, data);

    if (result.success) {
        revalidatePath("/matching");
        return { success: true };
    } else {
        return { success: false, error: result.message || "Failed to update application. Please try again." };
    }
}

/**
 * Generates and sends a 6-digit verification code to the user's email.
 * This effectively logs the user in if they want to edit their submitted application.
 * Utilizes Nodemailer and a lab Gmail account, while storing the active code in the Notion row itself.
 * 
 * @param {string} id The Notion page ID representing the user's submission.
 * @returns {Promise<{ success: boolean; error?: string }>} Status of the email dispatch and code generation.
 */
export async function sendVerificationCode(id: string) {
    console.log(`[sendVerificationCode] Starting for ID: ${id}`);

    // Check for GMAIL credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("[sendVerificationCode] GMAIL_USER or GMAIL_APP_PASSWORD missing in environment variables.");
        return { success: false, error: "Server configuration error: Missing email credentials." };
    }

    const data = await getVerificationData(id);
    if (!data) {
        console.error(`[sendVerificationCode] Entry not found for ID: ${id}`);
        return { success: false, error: "Entry not found" };
    }

    const { email, resendCount, expiresAt } = data;
    console.log(`[sendVerificationCode] Found entry for email: ${email}, Resend Count: ${resendCount}`);

    let currentResendCount = resendCount;
    const now = new Date();
    const expiry = expiresAt ? new Date(expiresAt) : null;
    const isExpired = !expiry || expiry < now;

    // Reset resend count if the previous code expired (treating as a new session)
    if (isExpired) {
        console.log("[sendVerificationCode] Code expired or not present. Resetting resend count to 0.");
        currentResendCount = 0;
        await setResendCount(id, 0);
    }

    if (currentResendCount >= 2 && !isExpired) {
        console.warn(`[sendVerificationCode] Max resend attempts reached for ID: ${id}`);
        return { success: false, error: "Maximum resend attempts reached. Please reach out to the lab at lab4cybernetics@andrew.cmu.edu for assistance" };
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    console.log(`[sendVerificationCode] Generated code: ${code} (Expires: ${newExpiresAt.toISOString()})`);

    // Store code and expiry
    const stored = await storeVerificationCode(id, code, newExpiresAt);
    if (!stored) {
        console.error("[sendVerificationCode] Failed to store verification code in Notion.");
        return { success: false, error: "Failed to generate code. Please try again." };
    }

    // Increment resend count if it's a retry (not a fresh session)
    if (!isExpired) {
        await incrementResendCount(id, currentResendCount);
    }

    try {
        console.log(`[sendVerificationCode] Attempting to send email via Gmail to: ${email}`);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Lab for Cybernetics" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code - Lab for Cybernetics",
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 15 minutes.</p>`,
        });

        console.log("[sendVerificationCode] Email sent successfully via Gmail.");
        return { success: true };

    } catch (e) {
        console.error("[sendVerificationCode] Exception sending email:", e);
        return { success: false, error: "Failed to send email. Please try again." };
    }
}

/**
 * Next.js Server Action that checks if the submitted code matches the code stored in Notion.
 * Automatically checks for code expiration and returns validation errors.
 *
 * @param {string} id The Notion page ID to verify against.
 * @param {string} code The 6-digit code entered by the user.
 * @returns {Promise<{ success: boolean; error?: string }>} True if the code matches and is not expired.
 */
export async function verifyCode(id: string, code: string) {
    const data = await getVerificationData(id);
    if (!data) return { success: false, error: "Entry not found" };

    const { code: storedCode, expiresAt } = data;

    if (!storedCode || !expiresAt) return { success: false, error: "No verification code found. Please request a new one." };

    if (new Date(expiresAt) < new Date()) {
        return { success: false, error: "Code expired. Please request a new one." };
    }

    if (storedCode.trim() !== code.trim()) {
        return { success: false, error: "Invalid code. Please try again." };
    }

    return { success: true };
}
