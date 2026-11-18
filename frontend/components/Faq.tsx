'use client';

import { useState } from 'react';
import type { Faq as FaqItem } from '@/lib/types';
import { Plus } from './Icons';

export default function Faq({ items, borderColor = '#C9DAEC' }: { items: FaqItem[]; borderColor?: string }) {
  const [open, setOpen] = useState<number | null>(items[0]?.id ?? null);
  if (!items.length) return <p className="muted">Frequently asked questions will appear here soon.</p>;
  return (
    <div className="faq" style={{ borderColor }}>
      {items.map((q) => {
        const expanded = open === q.id;
        return (
          <div className="faq-i" key={q.id} style={{ borderColor }}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                className="faq-q"
                id={`faq-b-${q.id}`}
                aria-expanded={expanded}
                aria-controls={`faq-p-${q.id}`}
                onClick={() => setOpen(expanded ? null : q.id)}
              >
                <span>{q.question}</span>
                <span className="faq-ic" aria-hidden="true"><Plus /></span>
              </button>
            </h3>
            <div className={`faq-a ${expanded ? 'open' : ''}`} id={`faq-p-${q.id}`} role="region" aria-labelledby={`faq-b-${q.id}`}>
              <div>
                <div className="in">
                  {q.isPlaceholder && <span className="ph">Answer awaiting approval</span>}
                  <p className={q.isPlaceholder ? 'phc' : 'muted'}>{q.answer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
