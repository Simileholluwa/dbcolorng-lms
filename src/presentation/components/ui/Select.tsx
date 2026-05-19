import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/presentation/styles/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  darkBg?: boolean;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = "Select...", className, darkBg = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="relative w-full" ref={ref}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-3 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-extrabold text-neutral-800 dark:text-white focus:outline-none focus:border-neutral-400 flex items-center justify-between cursor-pointer transition-all",
            darkBg
              ? "bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              : "bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            className
          )}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown
            className="w-4 h-4 text-neutral-400 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-full bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg shadow-xl py-1.5 z-50 focus:outline-none"
              >
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-xs font-bold transition-all",
                      value === opt.value
                        ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                        : "text-neutral-655 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = "Select";
