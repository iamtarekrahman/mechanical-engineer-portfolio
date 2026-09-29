"use client";

import { ReactNode, useEffect, useId, useRef } from "react";

/** Native modal dialogs keep keyboard focus inside and make the page inert. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();

  useEffect(() => {
    const node = dialog.current;
    if (!node || !open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={`archive-modal ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close.current();
      }}
    >
      <div className="modal-panel">
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={() => close.current()}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        {open ? children : null}
      </div>
    </dialog>
  );
}
