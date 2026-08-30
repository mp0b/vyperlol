import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[0_1fr] has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] gap-x-3 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        info: "border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 text-foreground",
        success: "border-[var(--success)]/30 bg-[var(--success)]/10 text-foreground",
        warning: "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-foreground [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("col-start-2 font-medium leading-none tracking-tight mb-1", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("col-start-2 text-sm text-muted-foreground [&_p]:leading-relaxed", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
