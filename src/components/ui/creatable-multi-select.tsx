"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Pastel colors with good contrast for dark text
const TAG_COLORS = [
    "bg-rose-100 text-rose-800",
    "bg-amber-100 text-amber-800",
    "bg-lime-100 text-lime-800",
    "bg-emerald-100 text-emerald-800",
    "bg-teal-100 text-teal-800",
    "bg-cyan-100 text-cyan-800",
    "bg-sky-100 text-sky-800",
    "bg-blue-100 text-blue-800",
    "bg-indigo-100 text-indigo-800",
    "bg-violet-100 text-violet-800",
    "bg-purple-100 text-purple-800",
    "bg-fuchsia-100 text-fuchsia-800",
    "bg-pink-100 text-pink-800",
    "bg-orange-100 text-orange-800",
];

// Generate a consistent color based on the tag string
function getTagColor(tag: string): string {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

interface CreatableMultiSelectProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    name: string;
    id?: string;
    required?: boolean;
    className?: string;
}

export function CreatableMultiSelect({
    options,
    value,
    onChange,
    placeholder = "Type to search or add...",
    name,
    id,
    required,
    className,
}: CreatableMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on input (exclude already selected)
    const filteredOptions = options.filter(
        (opt) =>
            opt.toLowerCase().includes(inputValue.toLowerCase()) &&
            !value.includes(opt)
    );

    // Check if the typed value is a new entry
    const isNewEntry =
        inputValue.trim() !== "" &&
        !options.some((opt) => opt.toLowerCase() === inputValue.toLowerCase()) &&
        !value.some((v) => v.toLowerCase() === inputValue.toLowerCase());

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(selectedValue: string) {
        if (!value.includes(selectedValue)) {
            onChange([...value, selectedValue]);
        }
        setInputValue("");
        inputRef.current?.focus();
    }

    function handleAddNew() {
        if (inputValue.trim() && !value.includes(inputValue.trim())) {
            onChange([...value, inputValue.trim()]);
            setInputValue("");
            inputRef.current?.focus();
        }
    }

    function handleRemove(itemToRemove: string) {
        onChange(value.filter((v) => v !== itemToRemove));
    }

    function handleInputKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (isNewEntry) {
                handleAddNew();
            } else if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            // Remove last tag on backspace if input is empty
            onChange(value.slice(0, -1));
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    }

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={value.join(",")} />

            <div
                className={cn(
                    "flex flex-wrap gap-1.5 min-h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                )}
                onClick={() => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
            >
                {/* Selected tags */}
                {value.map((tag) => (
                    <span
                        key={tag}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-sm font-medium",
                            getTagColor(tag)
                        )}
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(tag);
                            }}
                            className="hover:opacity-70 rounded-sm p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                {/* Input field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={value.length === 0 ? placeholder : "Add more..."}
                    className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
                    autoComplete="off"
                />
            </div>

            {isOpen && (filteredOptions.length > 0 || isNewEntry) && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-lg">
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.slice(0, 10).map((opt) => (
                            <button
                                type="button"
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors flex items-center gap-2"
                            >
                                <span className={cn("w-3 h-3 rounded-sm", getTagColor(opt).split(" ")[0])} />
                                {opt}
                            </button>
                        ))}
                        {isNewEntry && (
                            <button
                                type="button"
                                onClick={handleAddNew}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 border-t border-neutral-100 flex items-center gap-2"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add &quot;{inputValue.trim()}&quot;
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* For form validation */}
            {required && value.length === 0 && (
                <input
                    type="text"
                    required
                    value=""
                    onChange={() => { }}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
