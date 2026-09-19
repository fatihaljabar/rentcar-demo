import { useEffect, useId, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store';

export function Icon({ name, className = '', external = false }: { name: string; className?: string; external?: boolean }) {
  const resolvedName = name === 'arrow-up-right' && !external ? 'arrow-right' : name;
  return <i aria-hidden="true" className={`fi fi-rr-${resolvedName} ${className}`} />;
}
export function Button({ children, variant = 'primary', loading, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'danger' | 'blue'; loading?: boolean }) {
  return <button type="button" className={`btn btn-${variant} ${className}`} {...props} disabled={props.disabled || loading} aria-busy={loading || undefined}>{loading ? <span className="spinner" /> : null}{children}</button>;
}
export function Field({ label, children, hint, required, className = '' }: { label: string; children: ReactNode; hint?: string; required?: boolean; className?: string }) {
  return <label className={`field ${className}`}><span className="field-label">{label}{required && <span className="required"> *</span>}</span>{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}
export interface SelectOption { value: string; label: string; icon?: string; description?: string }
const optionTranslations: Record<string, string> = {
  'Pilih': 'Select', 'Sekolah / Kampus': 'School / University', 'Instansi': 'Institution',
  'Dalam kota': 'Within the city', 'Luar kota': 'Out of town', 'Pulang Pergi': 'Round Trip',
  'Telepon': 'Phone', 'Tunai': 'Cash', 'Belum bayar': 'Unpaid', 'Lunas': 'Fully paid',
  'Servis berkala': 'Scheduled service', 'Penggantian ban': 'Tire replacement',
  'Perbaikan mesin': 'Engine repair', 'Perbaikan bodi': 'Body repair', 'Pemeriksaan AC': 'AC inspection',
  'Lainnya': 'Other', 'Bensin': 'Petrol', 'Chat customer': 'Chat with customer',
  'Konfirmasi booking': 'Booking confirmation', 'Konfirmasi DP': 'Deposit confirmation',
  'Kirim quotation': 'Send quotation', 'Kirim invoice': 'Send invoice',
  'Reminder pembayaran': 'Payment reminder', 'Reminder keberangkatan': 'Departure reminder',
};
export function Select({ value, onChange, options, placeholder = 'Pilih', className = '', disabled = false, ariaLabel }: { value: string; onChange: (value: string) => void; options: (string | SelectOption)[]; placeholder?: string; className?: string; disabled?: boolean; ariaLabel?: string }) {
  const { lang, t } = useApp();
  const [open, setOpen] = useState(false); const [focused, setFocused] = useState(0); const [alignRight, setAlignRight] = useState(false); const [openUp, setOpenUp] = useState(false); const ref = useRef<HTMLDivElement>(null); const buttonRef = useRef<HTMLButtonElement>(null); const id = useId();
  const translate = (label: string) => lang === 'en' ? optionTranslations[label] || label : label;
  const normalized = options.map(option => typeof option === 'string' ? { value: option, label: translate(option) } : { ...option, label: translate(option.label) });
  const current = normalized.find(option => option.value === value);
  useEffect(() => { if (!open) return; const handler = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }, [open]);
  useEffect(() => {
    if (!open) return;
    const bounds = buttonRef.current?.getBoundingClientRect();
    if (bounds) { setAlignRight(bounds.left + Math.max(270, bounds.width) > window.innerWidth - 15); setOpenUp(bounds.bottom + 260 > window.innerHeight && bounds.top > 280); }
  }, [open]);
  function choose(next: string) { onChange(next); setOpen(false); buttonRef.current?.focus(); }
  return <div ref={ref} className={`custom-select ${className} ${open ? 'is-open' : ''} ${alignRight ? 'select-align-right' : ''} ${openUp ? 'select-open-up' : ''}`} onKeyDown={event => {
    if (disabled) return;
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); buttonRef.current?.focus(); }
    if (event.key === 'Tab') setOpen(false);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setFocused(previous => { const next = Math.max(0, Math.min(normalized.length - 1, previous + (event.key === 'ArrowDown' ? 1 : -1))); window.setTimeout(() => document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: 'nearest' }), 0); return next; }); }
    if (open && event.key === 'Enter') { event.preventDefault(); if (normalized[focused]) choose(normalized[focused].value); }
  }}>
    <button type="button" ref={buttonRef} role="combobox" className="select-trigger" disabled={disabled} aria-label={ariaLabel || translate(placeholder)} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-activedescendant={open ? `${id}-${focused}` : undefined} onClick={() => { setOpen(!open); setFocused(Math.max(0, normalized.findIndex(option => option.value === value))); }}><span>{current?.icon && <Icon name={current.icon} />}{current?.label || translate(placeholder)}</span><Icon name="angle-small-down" /></button>
    <AnimatePresence>{open && <motion.div id={id} className="select-options" role="listbox" aria-label={ariaLabel || translate(placeholder)} initial={{ opacity: 0, y: openUp ? 5 : -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: openUp ? 5 : -5 }} transition={{ duration: .15 }}>{normalized.length ? normalized.map((option, index) => <button type="button" id={`${id}-${index}`} key={option.value} role="option" aria-selected={option.value === value} className={`${value === option.value ? 'selected' : ''} ${index === focused ? 'focused' : ''}`} onMouseEnter={() => setFocused(index)} onClick={() => choose(option.value)}>{option.icon && <Icon name={option.icon} />}<span>{option.label}{option.description && <small>{option.description}</small>}</span>{value === option.value && <Icon name="check" />}</button>) : <div className="select-empty">{t('Tidak ada pilihan', 'No options available')}</div>}</motion.div>}</AnimatePresence>
  </div>;
}
export function Modal({ open, onClose, title, description, children, wide = false }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null); const closeRef = useRef(onClose); closeRef.current = onClose; const titleId = useId(); const { t } = useApp();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement; const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('input, button, textarea, [tabindex="0"]')?.focus(), 80);
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const elements = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea, select, [tabindex="0"]');
        if (!elements?.length) return; const first = elements[0]; const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler); return () => { clearTimeout(timer); document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', handler); previous?.focus(); };
  }, [open]);
  return createPortal(<AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><motion.div ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .98 }} transition={{ duration: .2 }}><header className="modal-header"><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" aria-label={t('Tutup modal', 'Close dialog')} onClick={onClose}><Icon name="cross" /></button></header><div className="modal-body">{children}</div></motion.div></motion.div>}</AnimatePresence>, document.body);
}
export function ConfirmDialog({ open, onClose, onConfirm, title, description, danger = true }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; danger?: boolean }) {
  const { t } = useApp(); return <Modal open={open} onClose={onClose} title={title}><p className="muted">{description}</p><div className="modal-actions"><Button variant="secondary" onClick={onClose}>{t('Batal', 'Cancel')}</Button><Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{t('Ya, lanjutkan', 'Yes, continue')}</Button></div></Modal>;
}
export function Tabs({ value, onChange, items, className = '' }: { value: string; onChange: (value: string) => void; items: (string | { value: string; label: string; count?: number; icon?: string })[]; className?: string }) {
  const options = items.map(item => typeof item === 'string' ? { value: item, label: item } : item);
  const change = (next: string) => {
    const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => void };
    const animatedTabs = className.includes('package-page-tabs') || className.includes('category-tabs') || options.some(option => option.value === 'overview');
    if (animatedTabs && transitionDocument.startViewTransition) { transitionDocument.startViewTransition(() => flushSync(() => onChange(next))); return; }
    onChange(next);
  };
  return <div className={`tabs ${className}`} role="tablist" onKeyDown={event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !options.length) return;
    event.preventDefault(); const current = options.findIndex(option => option.value === value);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    change(options[next].value); event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }}>{options.map(option => <button type="button" role="tab" tabIndex={value === option.value ? 0 : -1} aria-selected={value === option.value} key={option.value} className={value === option.value ? 'active' : ''} onClick={() => change(option.value)}>{option.icon && <Icon name={option.icon} />}{option.label}{option.count !== undefined && <span className="tab-count">{option.count}</span>}</button>)}</div>;
}
export function Badge({ children, status = '' }: { children: ReactNode; status?: string }) { const positive = ['Available', 'Completed', 'Lunas', 'Paid', 'Active', 'Accepted', 'Ready'].includes(status); const warning = ['Inquiry', 'Waiting DP', 'Reserved', 'Partial Payment', 'Draft', 'Maintenance', 'Waiting Vendor Assignment'].includes(status); const negative = ['Cancelled', 'Inactive', 'Refund', 'Rejected', 'Expired'].includes(status); return <span className={`badge ${positive ? 'badge-positive' : warning ? 'badge-warning' : negative ? 'badge-negative' : 'badge-blue'}`}>{children}</span>; }
export function Tooltip({ text, children }: { text: string; children: ReactNode }) { return <span className="tooltip-wrap">{children}<span className="tooltip" role="tooltip">{text}</span></span>; }
export function EmptyState({ title, description, action, icon = 'search' }: { title: string; description: string; action?: ReactNode; icon?: string }) { return <div className="empty-state"><div className="empty-icon"><Icon name={icon} /></div><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function Pagination({ page, pages, total, onChange }: { page: number; pages: number; total: number; onChange: (page: number) => void }) {
  const { t } = useApp(); return <div className="pagination"><span>{total} {t('data', 'results')}<span className="pagination-extra"> &middot; {t('Halaman', 'Page')} {page} {t('dari', 'of')} {Math.max(1, pages)}</span></span><div><button className="icon-button" disabled={page <= 1} aria-label={t('Halaman sebelumnya', 'Previous page')} onClick={() => onChange(page - 1)}><Icon name="angle-left" /></button>{Array.from({ length: Math.max(1, pages) }, (_, index) => index + 1).filter(p => p === 1 || p === pages || Math.abs(p - page) < 2).map(p => <button key={p} className={`page-number ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>)}<button className="icon-button" disabled={page >= pages} aria-label={t('Halaman berikutnya', 'Next page')} onClick={() => onChange(page + 1)}><Icon name="angle-right" /></button></div></div>;
}
export function Skeleton({ count = 3 }: { count?: number }) { return <div className="fleet-grid" aria-busy="true" aria-label="Loading">{Array.from({ length: count }, (_, index) => <div className="skeleton-item" key={index}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /><div className="skeleton skeleton-text" /></div>)}</div>; }
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) { return <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-35px' }} transition={{ duration: .65, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>; }
