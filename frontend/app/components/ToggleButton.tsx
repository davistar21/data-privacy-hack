// src/components/ToggleButton.tsx
import React from "react";
import { motion } from "framer-motion";

type Props = {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
};

export const ToggleButton: React.FC<Props> = ({
  checked,
  onChange,
  disabled,
}) => {
  return (
    <button
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex items-center h-7 w-14 rounded-full p-1 transition focus:outline-none ${checked ? "bg-green-500" : "bg-gray-400"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <motion.span
        layout
        initial={false}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="block h-5 w-5 bg-white rounded-full shadow"
      />
    </button>
  );
};
