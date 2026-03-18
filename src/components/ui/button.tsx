"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap border-2",
    "rounded-none text-[0.6875rem] font-medium uppercase tracking-[0.24em]",
    "transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background disabled:pointer-events-none",
    "disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        default:
          "border-foreground bg-foreground text-background hover:bg-muted",
        ghost: "border-border bg-transparent text-foreground hover:bg-accent",
        inverted:
          "border-background bg-background text-foreground hover:bg-muted/90",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-9 px-3 py-1.5",
        lg: "min-h-12 px-5 py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function Button({ className, size, variant, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}
