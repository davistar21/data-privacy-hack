// src/components/OrgHeader.tsx
import React from "react";
// If using shadcn/ui, import Card/Button. Fallback to simple elements if not installed.
let Card: any = ({ children }: any) => <div>{children}</div>;
let Button: any = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const shad = require("@/components/ui/card");
  if (shad) Card = shad.Card;
  // Similarly for Button — adjust path if your shadcn components differ
} catch (e) {
  // no shadcn available — use fallback tailwind
  Card = ({ children }: any) => (
    <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
      {children}
    </div>
  );
  Button = ({ children, className, ...props }: any) => (
    <button {...props} className={`px-3 py-1 rounded ${className || ""}`}>
      {children}
    </button>
  );
}

export const OrgHeader: React.FC<{
  orgName: string;
  orgId: string;
}> = ({ orgName, orgId }) => {
  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--text)]">
            {orgName}
          </h2>
          <div className="text-sm text-[color:var(--muted)]">
            Organization ID: {orgId}
          </div>
        </div>
      </div>
    </Card>
  );
};
