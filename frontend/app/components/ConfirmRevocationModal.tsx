// src/components/ConfirmRevocationModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { Consent } from "~/types";

type ConfirmRevocationModalProps = {
  open: boolean;
  onClose: () => void;
  consent: Consent;
  onConfirm: () => void;
};

const ConfirmRevocationModal: React.FC<ConfirmRevocationModalProps> = ({
  open,
  onClose,
  consent,
  onConfirm,
}) => {
  const sensitive = consent.fields.some((f) =>
    ["NIN", "biometrics"].includes(f)
  );
  const [text, setText] = useState("");

  const handleConfirm = () => {
    if (sensitive && text !== "REVOKE") return;
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Revocation</DialogTitle>
          <DialogDescription>
            You are about to revoke consent for{" "}
            <b>{consent.orgId.toLocaleUpperCase()}</b> for the purpose of{" "}
            <b>{consent.purpose}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p>Fields affected:</p>
          <ul className="list-disc ml-6">
            {consent.fields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {sensitive && (
            <div className="mt-3">
              <p className="text-red-400 text-xs mb-1">
                Sensitive fields detected — type “REVOKE” to proceed.
              </p>
              <Input value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={sensitive && text !== "REVOKE"}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default ConfirmRevocationModal;
