import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { X } from "lucide-react";
import "./bottomSheet.css";

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
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const dragDistance = useRef(0);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    dragDistance.current = Math.max(0, event.touches[0].clientY - touchStartY.current);
    setDragOffset(dragDistance.current);
  };

  const onTouchEnd = () => {
    if (dragDistance.current > 80) onClose();
    setDragOffset(0);
    touchStartY.current = null;
    dragDistance.current = 0;
  };

  return (
    <>
      <div
        className={`sheet-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div
        className={`sheet ${isOpen ? "open" : ""}${dragOffset ? " dragging" : ""}`}
        style={isOpen && dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
      >
        <div
          className="sheet-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          aria-label="Потяните вниз, чтобы закрыть"
        />

        {title && (
          <div className="sheet-header">
            <h3 className="sheet-title">{title}</h3>
            <button type="button" className="sheet-close" onClick={onClose} aria-label="Закрыть">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="sheet-content">
          {children}
        </div>
      </div>
    </>
  );
}
