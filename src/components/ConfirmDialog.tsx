"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "אישור",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-xl bg-surface border border-surface-border p-6 max-w-sm w-full animate-in">
        <h3 className="text-foreground font-medium mb-2">{title}</h3>
        <p className="text-foreground-mid text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-negative px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground-mid hover:text-foreground transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
