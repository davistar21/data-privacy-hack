import { Toaster } from "sonner";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function CustomToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      toastOptions={{
        className:
          "rounded-lg shadow-md border border-[var(--color-border)] font-medium text-sm",

        classNames: {
          success:
            "bg-[var(--sea-dark-500)] text-[var(--sea-dark-50)] border-[var(--sea-dark-400)]",
          error:
            "bg-[var(--color-destructive)] text-white border-[var(--sea-dark-700)]",
          info: "bg-[var(--sea-dark-400)] text-[var(--sea-dark-900)] border-[var(--sea-dark-300)]",
        },

        icons: {
          success: (
            <CheckCircle2 className="w-5 h-5 text-[var(--sea-dark-50)]" />
          ),
          error: <AlertTriangle className="w-5 h-5 text-white" />,
          info: <Info className="w-5 h-5 text-[var(--sea-dark-900)]" />,
        },
      }}
    />
  );
}
