"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface SketchButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

const SketchButton = forwardRef<HTMLButtonElement, SketchButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    // Base styles
                    "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    // Sketch border effect
                    "before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-current before:transition-transform before:duration-200",
                    "after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-current after:transition-transform after:duration-200",
                    "hover:before:translate-x-0.5 hover:before:translate-y-0.5",
                    "hover:after:-translate-x-0.5 hover:after:-translate-y-0.5",
                    "active:before:translate-x-0 active:before:translate-y-0",
                    "active:after:translate-x-0 active:after:translate-y-0",

                    // Variants
                    variant === "default" &&
                        "bg-linear-to-r from-blue-600 to-purple-600 text-white border-2 border-transparent hover:from-blue-700 hover:to-purple-700 before:opacity-0 after:opacity-0",
                    variant === "outline" &&
                        "bg-transparent border-2 border-current text-current hover:bg-gray-50 dark:hover:bg-gray-900",
                    variant === "ghost" &&
                        "bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-800 before:opacity-0 after:opacity-0",

                    // Sizes
                    size === "default" && "h-10 px-4 py-2 text-sm rounded-lg",
                    size === "sm" && "h-9 px-3 text-xs rounded-md",
                    size === "lg" && "h-12 px-8 text-base rounded-xl",
                    size === "icon" && "h-10 w-10 rounded-lg",

                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

SketchButton.displayName = "SketchButton";

export { SketchButton };
