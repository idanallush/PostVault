"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="glass-panel p-6 max-w-sm w-[90%] animate-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-[13px] text-foreground-mid mb-5 leading-relaxed">{message}</p>
        <div className="flex items-center gap-2 justify-end">
          <button onClick={onCancel} className="btn-ghost text-[13px]">ביטול</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full text-[13px] font-medium bg-negative text-white hover:opacity-90 transition-opacity">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
