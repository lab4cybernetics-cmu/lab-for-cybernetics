"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitMatchingApplication } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MatchingFormProps {
    type: "Scholar" | "Practitioner";
}

export function MatchingForm({ type }: MatchingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError("");

        // Append user type automatically
        formData.append("userType", type);

        const result = await submitMatchingApplication(formData);

        setIsSubmitting(false);
        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error || "Something went wrong");
        }
    }

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-sm text-center">
                <h3 className="text-xl font-medium mb-2">Application Received!</h3>
                <p>Thank you for joining the network as a {type}. Your profile will be reviewed and listed shortly.</p>
                <div className="mt-6">
                    <a href="/matching">
                        <Button variant="outline" className="border-green-600 text-green-700">Return to Directory</Button>
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-2xl mx-auto py-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-medium">Join as {type}</h2>
                <p className="text-neutral-500 text-sm">Please fill out the details below to be listed in the directory.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" name="name" required placeholder="e.g. Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website / Related Work</Label>
                    <Input id="website" name="website" type="url" placeholder="https://" />
                </div>

                {type === "Practitioner" && (
                    <div className="space-y-2">
                        <Label htmlFor="organization">Organization Membership</Label>
                        <Input id="organization" name="organization" placeholder="Current organization or affiliation" />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="domain">Core Domain of Research/Practice *</Label>
                    <Input id="domain" name="domain" required placeholder="e.g. Second-order Cybernetics, Design Systems" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (comma separated) *</Label>
                    <Input id="keywords" name="keywords" required placeholder="e.g. conversation, feedback loops, ethics" />
                    <p className="text-[10px] text-neutral-400">These help others find you in the search.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whyImportant">Why is this domain important to you? *</Label>
                    <Textarea id="whyImportant" name="whyImportant" required className="min-h-[100px]" placeholder="Share your emotional investment or motivation..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="committedTo">What are you committed to improving/changing? *</Label>
                    <Textarea id="committedTo" name="committedTo" required className="min-h-[80px]" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatToConserve">What do you want to conserve? *</Label>
                    <Textarea id="whatToConserve" name="whatToConserve" required className="min-h-[80px]" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="about">Important to share about yourself/work/community *</Label>
                    <Textarea id="about" name="about" required className="min-h-[120px]" placeholder="Bio or general context..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="effectiveCollaboration">What makes for good collaboration? *</Label>
                    <Textarea id="effectiveCollaboration" name="effectiveCollaboration" required className="min-h-[80px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="timeCommitment">Time Commitment Available *</Label>
                        <select
                            id="timeCommitment"
                            name="timeCommitment"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="">Select...</option>
                            <option value="as-needed">As Needed</option>
                            <option value="2+ conversations without email follow-up">2+ conversations</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="One-off">One-off Conversation</option>
                        </select>
                    </div>

                    {type === "Scholar" && (
                        <div className="space-y-2">
                            <Label htmlFor="practitionerStatus">Practitioner Status</Label>
                            <select
                                id="practitionerStatus"
                                name="practitionerStatus"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select status...</option>
                                <option value="Still exploring options">Still exploring options</option>
                                <option value="Seeking Practitioner">Seeking Practitioner</option>
                                <option value="Open to Connection">Open to Connection</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="surveyFeedback">Survey Feedback (Optional)</Label>
                    <Textarea id="surveyFeedback" name="surveyFeedback" placeholder="Any thoughts on this form or process?" />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Application"
                )}
            </Button>
        </form>
    );
}
