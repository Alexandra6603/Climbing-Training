import type { ReactNode } from "react";
import "./BottomSheet.css";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <>
      <div
        className={`sheet-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`sheet ${isOpen ? "open" : ""}`}>
        <div className="sheet-handle" />

        {title && <h3 className="sheet-title">{title}</h3>}

        <div className="sheet-content">
          {children}
        </div>
      </div>
    </>
  );
}