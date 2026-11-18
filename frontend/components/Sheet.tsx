'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Close } from './Icons';

/** Accessible side sheet (modal dialog): focus moves in, Tab is trapped, Escape/scrim closes, focus returns. */
export default function Sheet({
  labelledBy,
  onClose,
  header,
  children,
  closeLabel = 'Close',
}: {
  labelledBy: string;
  onClose: () => void;
  header?: ReactNode;
  children: ReactNode;
  closeLabel?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <button type="button" className="scrim" tabIndex={-1} aria-label={closeLabel} onClick={onClose} />
      <div className="panel" ref={panel}>
        <div className="sheet-h">
          <div>{header}</div>
          <button ref={closeBtn} type="button" className="icon-btn" aria-label={closeLabel} onClick={onClose}>
            <Close />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
