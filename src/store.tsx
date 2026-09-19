import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { availableUnits, blockingStatuses, createSeedData, dateOffset, defaultSearch, paidAmount, totalCapacity, uid, type Booking, type DemoData, type SearchState } from './data';

type Toast = { id: string; message: string; kind: 'success' | 'error' | 'info' };
interface AppContextType {
  data: DemoData; setData: React.Dispatch<React.SetStateAction<DemoData>>;
  search: SearchState; setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
  lang: 'id' | 'en'; setLang: (lang: 'id' | 'en') => void; t: (id: string, en: string) => string;
  dark: boolean; setDark: (dark: boolean) => void; isAdmin: boolean; setIsAdmin: (value: boolean) => void;
  notify: (message: string, kind?: Toast['kind']) => void;
  saveBooking: (booking: Booking) => { ok: boolean; error?: string; booking?: Booking };
  resetDemo: () => void;
}
const AppContext = createContext<AppContextType | null>(null);
function readStorage<T>(key: string, fallback: () => T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback(); } catch { return fallback(); }
}
function readSearch(): SearchState {
  const saved = readStorage('nusaride-search', () => defaultSearch);
  const today = dateOffset();
  const start = saved.start && saved.start >= today ? saved.start : today;
  const end = saved.end && saved.end >= start ? saved.end : start;
  return { ...defaultSearch, ...saved, start, end };
}
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => readStorage('nusaride-data-v1', createSeedData));
  const [search, setSearch] = useState<SearchState>(readSearch);
  const [lang, setLang] = useState<'id' | 'en'>(() => readStorage('nusaride-lang', () => 'id'));
  const [dark, setDark] = useState<boolean>(() => readStorage('nusaride-dark', () => false));
  const [isAdmin, setIsAdmin] = useState(() => { try { return sessionStorage.getItem('nusaride-admin') === 'true'; } catch { return false; } });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const t = (id: string, en: string) => lang === 'id' ? id : en;
  useEffect(() => { try { localStorage.setItem('nusaride-data-v1', JSON.stringify(data)); } catch { /* The demo remains usable when browser storage is unavailable. */ } }, [data]);
  useEffect(() => {
    const syncData = (event: StorageEvent) => {
      if (event.key !== 'nusaride-data-v1' || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue) as DemoData;
        setData(current => JSON.stringify(current) === event.newValue ? current : incoming);
      } catch { /* Ignore invalid data from another tab. */ }
    };
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, []);
  useEffect(() => { try { localStorage.setItem('nusaride-search', JSON.stringify(search)); } catch { /* Use in-memory state. */ } }, [search]);
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('nusaride-lang', JSON.stringify(lang)); } catch { /* Use in-memory state. */ } }, [lang]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; try { localStorage.setItem('nusaride-dark', JSON.stringify(dark)); } catch { /* Use in-memory state. */ } }, [dark]);
  useEffect(() => { try { sessionStorage.setItem('nusaride-admin', String(isAdmin)); } catch { /* Session access is optional in the frontend demo. */ } }, [isAdmin]);
  function notify(message: string, kind: Toast['kind'] = 'success') {
    const id = uid('toast'); setToasts(prev => [...prev.slice(-3), { id, message, kind }]);
    window.setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4800);
  }
  function saveBooking(input: Booking) {
    const booking: Booking = { ...input, items: input.items.map(item => ({ ...item, unitIds: [...item.unitIds] })) };
    if (booking.status === 'Cancelled') {
      booking.items = booking.items.map(item => ({ ...item, unitIds: [] }));
      setData(previous => ({ ...previous, bookings: previous.bookings.some(b => b.id === booking.id) ? previous.bookings.map(b => b.id === booking.id ? booking : b) : [booking, ...previous.bookings] }));
      return { ok: true, booking };
    }
    if (!Number.isInteger(booking.passengers) || booking.passengers < 1) return { ok: false, error: t('Jumlah penumpang harus berupa angka bulat minimal 1.', 'The passenger count must be a positive integer.') };
    if (!Number.isFinite(booking.total) || booking.total < 0 || !Number.isFinite(booking.discount) || booking.discount < 0) return { ok: false, error: t('Harga dan diskon harus berupa angka positif.', 'Price and discount must be valid non-negative numbers.') };
    if (booking.total < paidAmount(data, booking.id)) return { ok: false, error: t('Total booking lebih kecil dari pembayaran masuk. Catat refund terlebih dahulu.', 'The booking total is below the amount paid. Record a refund first.') };
    if (booking.customerType === 'Personal') booking.company = '';
    if (!booking.start || !booking.end || booking.end < booking.start) return { ok: false, error: t('Tanggal selesai tidak boleh sebelum tanggal mulai.', 'End date must not precede start date.') };
    if (!booking.items.length || booking.items.some(item => item.quantity < 1 || !Number.isInteger(item.quantity))) return { ok: false, error: t('Pilih minimal satu unit armada.', 'Select at least one vehicle.') };
    if (totalCapacity(data, booking.items) < booking.passengers) return { ok: false, error: t('Kapasitas armada belum mencukupi jumlah penumpang.', 'Vehicle capacity is below the passenger count.') };
    const allocated = new Set<string>();
    for (const item of booking.items) {
      const fleet = data.fleet.find(f => f.id === item.fleetId);
      if (!fleet || !fleet.active) return { ok: false, error: t('Armada sudah tidak aktif.', 'This vehicle is no longer active.') };
      if (!fleet.selfDrive) item.mode = 'driver';
      if (blockingStatuses.includes(booking.status)) {
        const ready = availableUnits(data, item.fleetId, booking.start, booking.end, booking.id).filter(unit => !allocated.has(unit.id));
        if (item.unitIds.some(id => !ready.some(unit => unit.id === id))) return { ok: false, error: t('Unit bentrok dengan booking atau maintenance. Pilih ulang unit yang tersedia.', 'A unit conflicts with another booking or maintenance. Reassign available units.') };
        if (ready.length < item.quantity) return { ok: false, error: `${fleet.name}: ${t('hanya', 'only')} ${ready.length} ${t('unit tersedia pada tanggal ini.', 'units available on these dates.')}` };
        item.unitIds = [...item.unitIds.slice(0, item.quantity), ...ready.filter(unit => !item.unitIds.includes(unit.id)).slice(0, Math.max(0, item.quantity - item.unitIds.length)).map(unit => unit.id)];
        item.unitIds.forEach(id => allocated.add(id));
      } else if (booking.status !== 'Completed') item.unitIds = [];
    }
    setData(prev => {
      const exists = prev.bookings.some(b => b.id === booking.id);
      const customerExists = prev.customers.some(c => c.whatsapp === booking.whatsapp);
      const orgExists = !booking.company || prev.organizations.some(o => o.name.toLowerCase() === booking.company.toLowerCase());
      return { ...prev, bookings: exists ? prev.bookings.map(b => b.id === booking.id ? booking : b) : [booking, ...prev.bookings],
        customers: customerExists ? prev.customers : [...prev.customers, { id: uid('c'), name: booking.name, whatsapp: booking.whatsapp, email: booking.email, notes: '' }],
        organizations: orgExists ? prev.organizations : [...prev.organizations, { id: uid('o'), name: booking.company, pic: booking.name, whatsapp: booking.whatsapp, email: booking.email, address: '', npwp: '', notes: booking.notes }],
      };
    });
    return { ok: true, booking };
  }
  function resetDemo() { const tomorrow = dateOffset(1); setData(createSeedData()); setSearch({ ...defaultSearch, start: tomorrow, end: tomorrow }); notify(t('Data demo berhasil direset.', 'Demo data has been reset.')); }
  return <AppContext.Provider value={{ data, setData, search, setSearch, lang, setLang, t, dark, setDark, isAdmin, setIsAdmin, notify, saveBooking, resetDemo }}>
    {children}
    <div className="toast-stack" aria-live="polite" aria-atomic="false"><AnimatePresence>{toasts.map(toast => <motion.div key={toast.id} className={`toast toast-${toast.kind}`} initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 30 }} role={toast.kind === 'error' ? 'alert' : 'status'}><i className={`fi fi-rr-${toast.kind === 'error' ? 'exclamation' : toast.kind === 'info' ? 'info' : 'check-circle'}`} /><span>{toast.message}</span><button aria-label={t('Tutup notifikasi', 'Dismiss notification')} onClick={() => setToasts(prev => prev.filter(item => item.id !== toast.id))}><i className="fi fi-rr-cross-small" /></button></motion.div>)}</AnimatePresence></div>
  </AppContext.Provider>;
}
export function useApp() { const context = useContext(AppContext); if (!context) throw new Error('AppProvider is required'); return context; }
