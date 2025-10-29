import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input as BaseInput } from "./input";
import { useRTL } from "@/hooks/useRTL";

interface AnimatedInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  className?: string;
}

const inputVariants: Variants = {
  focus: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const labelVariants: Variants = {
  initial: {
    y: 0,
    fontSize: "1rem",
  },
  focus: {
    y: -24,
    fontSize: "0.875rem",
    color: "var(--primary)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const { isRTL } = useRTL();

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="relative pt-6">
        {label && (
          <motion.label
            initial="initial"
            animate={isFocused || hasValue ? "focus" : "initial"}
            variants={labelVariants}
            className={cn(
              "absolute top-8 text-gray-500 cursor-text pointer-events-none z-10",
              isRTL ? "right-0" : "left-0"
            )}
          >
            {label}
          </motion.label>
        )}
        <motion.div
          whileFocus="focus"
          variants={inputVariants}
        >
          <BaseInput
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              "transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20",
              error && "border-red-500 focus:ring-red-500/20",
              isRTL && "text-right",
              className
            )}
            style={{
              textAlign: isRTL ? 'right' : 'left',
              direction: isRTL ? 'rtl' : 'ltr',
              paddingRight: isRTL ? '2.5rem' : undefined,
              paddingLeft: isRTL ? '0.75rem' : '2.5rem'
            }}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "text-sm text-red-500 mt-1",
              isRTL && "text-right"
            )}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";