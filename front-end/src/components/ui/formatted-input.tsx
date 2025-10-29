import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input as BaseInput } from "./input";
import { useRTL } from "@/hooks/useRTL";

interface FormattedInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  className?: string;
  format?: 'card' | 'date' | 'cvv' | 'phone' | 'none';
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

// Formatting functions
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

const formatDate = (value: string) => {
  const v = value.replace(/\D/g, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

const formatCVV = (value: string) => {
  return value.replace(/\D/g, '').substring(0, 4);
};

const formatPhone = (value: string) => {
  const v = value.replace(/\D/g, '');
  if (v.length >= 4) {
    return v.substring(0, 3) + '-' + v.substring(3, 7) + '-' + v.substring(7, 11);
  } else if (v.length >= 3) {
    return v.substring(0, 3) + '-' + v.substring(3);
  }
  return v;
};

export const FormattedInput = React.forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ className, label, error, format = 'none', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [formattedValue, setFormattedValue] = React.useState('');
    const { isRTL } = useRTL();

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let formatted = e.target.value;
      
      switch (format) {
        case 'card':
          formatted = formatCardNumber(e.target.value);
          break;
        case 'date':
          formatted = formatDate(e.target.value);
          break;
        case 'cvv':
          formatted = formatCVV(e.target.value);
          break;
        case 'phone':
          formatted = formatPhone(e.target.value);
          break;
        default:
          formatted = e.target.value;
      }
      
      setFormattedValue(formatted);
      setHasValue(!!formatted);
      
      // Create a new event with the formatted value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted
        }
      };
      
      if (props.onChange) {
        props.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
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
            value={formattedValue}
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

FormattedInput.displayName = "FormattedInput";
