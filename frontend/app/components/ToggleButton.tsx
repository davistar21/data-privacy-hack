// src/components/ToggleButton.tsx
import * as React from "react";
import { Switch } from "./ui/switch";

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
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
    />
  );
};
