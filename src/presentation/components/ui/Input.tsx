import * as React from "react";
import { cn } from "@/presentation/styles/utils";
import { LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, rightElement, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
        )}
        <input
          type={type}
          className={cn(
            "flex h-15 w-full rounded-xl border border-gray-100 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 px-4 py-2 text-md transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-50 focus-visible:outline-none focus-visible:bg-white dark:focus-visible:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-black/5 dark:focus-visible:ring-white/5 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
            Icon && "pl-11",
            rightElement && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
