import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center border px-2.5 py-0.5 text-xs font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80",
                secondary:
                    "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
                outline: "text-neutral-950 border-neutral-200",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
