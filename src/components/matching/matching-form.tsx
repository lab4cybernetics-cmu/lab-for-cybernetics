"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { CreatableMultiSelect } from "@/components/ui/creatable-multi-select";
import { submitMatchingApplication, updateMatchingApplication } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { MatchingItem } from "@/lib/notion-types";

interface MatchingFormProps {
    type: "Scholar" | "Practitioner";
    organizationOptions: string[];
    keywordOptions: string[];
    timeCommitmentOptions: string[];
    practitionerStatusOptions: string[];
    initialData?: MatchingItem;
    itemId?: string;
    onCancel?: () => void;
}

export function MatchingForm({
    type,
    organizationOptions,
    keywordOptions,
    timeCommitmentOptions,
    practitionerStatusOptions,
    initialData,
    itemId,
    onCancel
}: MatchingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // State for creatable selects and controlled inputs
    const [organization, setOrganization] = useState(initialData?.organization || "");
    const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);

    // Default values for other fields if editing
    // We can just rely on defaultValue for uncontrolled inputs, but for "Scholar" specific logic...
    // Actually simple defaultValue works for inputs.

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError("");

        // Append user type and controlled fields
        formData.append("userType", type);
        formData.set("organization", organization);
        formData.set("keywords", keywords.join(","));

        let result;
        if (itemId) {
            result = await updateMatchingApplication(itemId, formData);
        } else {
            result = await submitMatchingApplication(formData);
        }

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
                <h3 className="text-xl font-medium mb-2">{itemId ? "Entry Updated!" : "Application Received!"}</h3>
                <p>
                    {itemId
                        ? "Your entry has been successfully updated."
                        : `Thank you for joining the network as a ${type}. Your profile will be reviewed and listed shortly.`
                    }
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    {itemId && onCancel ? (
                        <Button variant="outline" className="border-green-600 text-green-700" onClick={onCancel}>
                            Close
                        </Button>
                    ) : (
                        <a href="/matching">
                            <Button variant="outline" className="border-green-600 text-green-700">Return to Directory</Button>
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-2xl mx-auto py-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-medium">{itemId ? "Edit Entry" : `Join as ${type}`}</h2>
                {!itemId && <p className="text-neutral-500 text-sm">Please fill out the details below to be listed in the directory.</p>}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* 1. Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name: *</Label>
                        <Input id="name" name="name" required defaultValue={initialData?.name} />
                    </div>

                    {/* 2. Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" required defaultValue={initialData?.email} />
                    </div>
                </div>

                {/* 3. Website */}
                <div className="space-y-2">
                    <Label htmlFor="website">Website (if applicable):</Label>
                    <Input id="website" name="website" type="url" placeholder="https://" defaultValue={initialData?.website} />
                </div>

                {/* 4. About / Core Domain - same question for both */}
                <div className="space-y-2">
                    <Label htmlFor="about">What domain is at the core of your research, academic pursuits, or in-world practice? *</Label>
                    <Textarea
                        id="about"
                        name="about"
                        required
                        className="min-h-[100px]"
                        defaultValue={initialData?.about}
                    />
                    <p className="text-xs text-neutral-400">
                        Short phrases or keywords are best. You might connect to the United Nations&apos; 17 Sustainable Development Goals, though please add specifics — for example, manufactured materials threatening ocean sustainability; the social policies
                    </p>
                </div>

                {/* 5. Keywords - same for both */}
                <div className="space-y-2">
                    <Label htmlFor="keywords">What are some keywords that invoke your domain? *</Label>
                    <CreatableMultiSelect
                        id="keywords"
                        name="keywords"
                        options={keywordOptions}
                        value={keywords}
                        onChange={setKeywords}
                        placeholder="Type to search or add keywords..."
                        required
                    />
                    <p className="text-xs text-neutral-400">Add your response as #keywords</p>
                </div>

                {/* 6. Committed To - different question per type */}
                <div className="space-y-2">
                    <Label htmlFor="committedTo">
                        {type === "Practitioner"
                            ? "What are you committed to changing in this domain? *"
                            : "Why is this domain important to you? Why or how are you emotionally invested in this particular domain? In other words, what is the nature of your concern for it? *"
                        }
                    </Label>
                    <Textarea
                        id="committedTo"
                        name="committedTo"
                        required
                        className="min-h-[80px]"
                        defaultValue={initialData?.committedTo}
                    />
                    <p className="text-xs text-neutral-400">Short phrases are best.</p>
                </div>

                {/* 7. What to Conserve - same for both */}
                <div className="space-y-2">
                    <Label htmlFor="whatToConserve">While bringing about the change you want, what do you want to conserve even as change takes place? *</Label>
                    <Textarea
                        id="whatToConserve"
                        name="whatToConserve"
                        required
                        className="min-h-[80px]"
                        defaultValue={initialData?.whatToConserve}
                    />
                </div>

                {/* 8. Organization - different question per type */}
                <div className="space-y-2">
                    <Label htmlFor="organization">
                        {type === "Practitioner"
                            ? "Are you a member of an organization relevant to your domain? If so, could you please name it and offer something you would like to share about it?"
                            : "What is your university and school/program affiliation? Are you part of any research groups, labs, or organizations relevant to your domain? If so, please share what draws you to their work."
                        }
                    </Label>
                    <CreatableSelect
                        id="organization"
                        name="organization"
                        options={organizationOptions}
                        value={organization}
                        onChange={setOrganization}
                        placeholder="Select or type to add..."
                    />
                </div>

                {/* 9. Why Important - same for both */}
                <div className="space-y-2">
                    <Label htmlFor="whyImportant">What is important to share about yourself, your work, your community, or network? *</Label>
                    <Textarea
                        id="whyImportant"
                        name="whyImportant"
                        required
                        className="min-h-[100px]"
                        defaultValue={initialData?.whyImportant}
                    />
                </div>

                {/* 10. Effective Collaboration - different per type */}
                <div className="space-y-2">
                    <Label htmlFor="effectiveCollaboration">
                        {type === "Practitioner"
                            ? "What makes for a good collaborative relationship? How do you imagine collaborating with a student / scholar? *"
                            : "What makes for a good collaborative relationship? What do you need? *"
                        }
                    </Label>
                    <Textarea
                        id="effectiveCollaboration"
                        name="effectiveCollaboration"
                        required
                        className="min-h-[80px]"
                        defaultValue={initialData?.effectiveCollaboration}
                    />
                </div>

                {/* 11. Practitioner Status (Scholar only) */}
                {type === "Scholar" && (
                    <div className="space-y-2">
                        <Label htmlFor="practitionerStatus">Have you identified potential collaborator(s) or are you still seeking names of individuals to contact?</Label>
                        <select
                            id="practitionerStatus"
                            name="practitionerStatus"
                            className="flex h-11 w-full appearance-none items-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat"
                            defaultValue={initialData?.practitionerStatus}
                        >
                            <option value="">Select...</option>
                            {practitionerStatusOptions
                                .filter((status) => status.toLowerCase() !== "not a scholar")
                                .map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                        </select>
                    </div>
                )}

                {/* 12. Time Commitment - same for both */}
                <div className="space-y-2">
                    <Label htmlFor="timeCommitment">How much time would you have available for spending in collaboration? This of course can be renegotiated along the way. *</Label>
                    <select
                        id="timeCommitment"
                        name="timeCommitment"
                        className="flex h-11 w-full appearance-none items-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat"
                        required
                        defaultValue={initialData?.timeCommitment}
                    >
                        <option value="">Select...</option>
                        {timeCommitmentOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* 13. Survey Feedback - same for both */}
                <div className="space-y-2">
                    <Label htmlFor="surveyFeedback">Do you have any suggestions for this survey, what is not clear, what it&apos;s missing?</Label>
                    <Textarea
                        id="surveyFeedback"
                        name="surveyFeedback"
                        className="min-h-[60px]"
                        defaultValue={initialData?.surveyFeedback}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                {onCancel && (
                    <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
                )}
                <Button
                    type="submit"
                    className="flex-1 h-12 text-base font-medium text-white bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 active:scale-[0.99] transition-all duration-150"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {itemId ? "Updating..." : "Submitting..."}
                        </>
                    ) : (
                        itemId ? "Save Changes" : "Submit Application"
                    )}
                </Button>
            </div>
        </form>
    );
}
