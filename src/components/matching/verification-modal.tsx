"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { sendVerificationCode, verifyCode } from "@/app/actions";



interface VerificationModalProps {
    itemId: string;
    email: string;
    onVerified: () => void;
}

export function VerificationModal({ itemId, email, onVerified }: VerificationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"confirm" | "code">("confirm");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendStatus, setResendStatus] = useState("");

    const maskedEmail = email // Or full email as requested? "Show the full email address (don't hide it)"
        ? email
        : "the registered email";

    async function handleSendCode() {
        setIsLoading(true);
        setError("");
        setResendStatus("");

        const result = await sendVerificationCode(itemId);

        setIsLoading(false);
        if (result.success) {
            setStep("code");
        } else {
            setError(result.error || "Failed to send code.");
        }
    }

    async function handleVerify(inputCode: string) {
        // Auto-verify when 6 digits
        if (inputCode.length !== 6) return;

        setIsLoading(true);
        setError("");

        const result = await verifyCode(itemId, inputCode);

        setIsLoading(false);
        if (result.success) {
            setIsOpen(false);
            onVerified();
        } else {
            setError(result.error || "Verification failed");
        }
    }

    async function handleResend() {
        setIsLoading(true);
        setError("");
        setResendStatus("");

        const result = await sendVerificationCode(itemId);

        setIsLoading(false);
        if (result.success) {
            setResendStatus("Code resent!");
        } else {
            setError(result.error || "Failed to resend.");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogTitle>Verify Ownership</DialogTitle>
                <DialogDescription>
                    {step === "confirm"
                        ? `Is this your entry? We'll send a verification code to ${maskedEmail} to confirm.`
                        : "Enter the 6-digit code sent to your email."}
                </DialogDescription>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {resendStatus && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                            {resendStatus}
                        </div>
                    )}

                    {step === "confirm" ? (
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button onClick={handleSendCode} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                Yes, send code
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <Input
                                    className="text-center text-2xl tracking-widest w-40 h-12"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setCode(val);
                                        if (val.length === 6) handleVerify(val);
                                    }}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex justify-between items-center text-sm text-neutral-500 pt-2">
                                <Button variant="link" className="p-0 h-auto text-neutral-500" onClick={handleResend} disabled={isLoading}>
                                    Resend Code
                                </Button>
                            </div>

                            <p className="text-xs text-center text-neutral-400 mt-4 border-t pt-4">
                                Having trouble? Please reach out to the lab at <a href="mailto:lab4cybernetics@andrew.cmu.edu" className="underline hover:text-neutral-600">lab4cybernetics@andrew.cmu.edu</a> for assistance.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
