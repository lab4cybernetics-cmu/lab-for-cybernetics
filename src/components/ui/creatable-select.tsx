"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    name: string;
    id?: string;
    required?: boolean;
    className?: string;
}

export function CreatableSelect({
    options,
    value,
    onChange,
    placeholder = "Select or type to add...",
    name,
    id,
    required,
    className,
}: CreatableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on input
    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Check if the typed value is a new entry
    const isNewEntry =
        inputValue.trim() !== "" &&
        !options.some((opt) => opt.toLowerCase() === inputValue.toLowerCase());

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setInputValue("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(selectedValue: string) {
        onChange(selectedValue);
        setIsOpen(false);
        setInputValue("");
    }

    function handleAddNew() {
        if (inputValue.trim()) {
            onChange(inputValue.trim());
            setIsOpen(false);
            setInputValue("");
        }
    }

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation();
        onChange("");
        setInputValue("");
    }

    function handleInputKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (isNewEntry) {
                handleAddNew();
            } else if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setInputValue("");
        }
    }

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={value} />

            <div
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    "cursor-pointer"
                )}
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
            >
                {value ? (
                    <div className="flex items-center justify-between w-full">
                        <span className="truncate">{value}</span>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="ml-2 p-0.5 hover:bg-neutral-100 rounded"
                        >
                            <X className="h-3.5 w-3.5 text-neutral-400" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <span className="text-muted-foreground">{placeholder}</span>
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-lg">
                    <div className="p-2 border-b border-neutral-100">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Type to search or add..."
                            className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300"
                            autoComplete="off"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.map((opt) => (
                            <button
                                type="button"
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={cn(
                                    "w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors",
                                    opt === value && "bg-neutral-100 font-medium"
                                )}
                            >
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
                                Add "{inputValue.trim()}"
                            </button>
                        )}
                        {filteredOptions.length === 0 && !isNewEntry && (
                            <div className="px-3 py-2 text-sm text-neutral-400">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* For form validation */}
            {required && !value && (
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
