import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

const formVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const formItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const AnimatedForm = React.forwardRef<HTMLFormElement, AnimatedFormProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.form
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className={cn("space-y-6", className)}
        {...(props as any)}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={formItemVariants}
            className="form-item"
          >
            {child}
          </motion.div>
        ))}
      </motion.form>
    );
  }
);

AnimatedForm.displayName = "AnimatedForm";