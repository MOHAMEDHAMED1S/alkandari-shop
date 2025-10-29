import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button as BaseButton, ButtonProps as BaseButtonProps } from "./button";

interface AnimatedButtonProps extends BaseButtonProps {
  children: React.ReactNode;
  className?: string;
}

const buttonVariants: Variants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.98,
  },
};

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        <BaseButton
          ref={ref}
          className={cn(
            "relative overflow-hidden transition-colors",
            "after:absolute after:inset-0 after:z-10 after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0 after:opacity-0 after:transition-opacity hover:after:opacity-100",
            className
          )}
          {...props}
        >
          {children}
        </BaseButton>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";