import React, { useEffect } from "react";

interface Props {
  message: string;
  onUndo: () => void;
  onExpire: () => void;
  duration?: number;
}

export const UndoToast: React.FC<Props> = ({
  message,
  onUndo,
  onExpire,
  duration = 8000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onExpire, duration);
    return () => clearTimeout(timer);
  }, [duration, onExpire]);

  return (
    <div className="fixed bottom-6 right-6 bg-[color:var(--card)] shadow-lg rounded-lg p-4 flex items-center gap-3 border border-[color:var(--muted)]/20 z-50">
      <span className="text-sm text-[color:var(--text)]">{message}</span>
      <button
        onClick={onUndo}
        className="text-sm font-semibold text-blue-400 hover:text-blue-300"
      >
        Undo
      </button>
    </div>
  );
};
