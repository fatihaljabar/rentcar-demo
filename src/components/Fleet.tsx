import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store';
import { availableUnits, categories, customerTypes, dateOffset, money, rentalDays, totalCapacity, totalUnits, type BookingItem, type CustomerType, type Fleet, type SearchState } from '../data';
import { Button, Field, Icon, Select, Tabs } from './ui';

export function SearchForm({ compact = false, onSearch }: { compact?: boolean; onSearch?: () => void }) {
  const { search, setSearch, t, notify } = useApp(); const [expanded, setExpanded] = useState(compact); const [tab, setTab] = useState(search.serviceMode || 'self'); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  const update = <K extends keyof SearchState>(key: K, value: SearchState[K]) => setSearch(previous => ({ ...previous, [key]: value, ...(key === 'start' && String(value) > previous.end ? { end: String(value) } : {}) }));
  function submit(event: FormEvent) {
    event.preventDefault();
    if (search.end < search.start) return notify(t('Tanggal selesai harus setelah tanggal mulai.', 'End date must be on or after start date.'), 'error');
    if (search.passengers < 1) return notify(t('Jumlah penumpang minimal satu orang.', 'At least one passenger is required.'), 'error');
    setLoading(true); window.setTimeout(() => { setLoading(false); if (onSearch) onSearch(); else navigate('/armada?search=1'); }, 550);
  }
  return <form className={`search-form ${compact ? 'search-compact' : ''}`} onSubmit={submit} id="cari-armada">
    <div className="search-top"><Tabs value={tab} onChange={value => { setTab(value as 'self' | 'driver' | 'transfer'); setSearch(previous => ({ ...previous, serviceMode: value as 'self' | 'driver' | 'transfer', tripType: value === 'transfer' ? 'One Way' : 'Pulang Pergi' })); if (value === 'transfer') setExpanded(true); }} items={[{ value: 'self', label: t('Lepas kunci', 'Self-drive'), icon: 'key' }, { value: 'driver', label: t('Dengan driver', 'With a driver'), icon: 'steering-wheel' }, { value: 'transfer', label: t('Antar-jemput', 'Transfers'), icon: 'route' }]} /><span className="search-reassurance"><Icon name="shield-check" />{t('Unit terawat, harga terlihat di awal.', 'Maintained vehicles, upfront estimate.')}</span></div>
    <div className="search-main"><Field label={t('Lokasi penjemputan', 'Pickup location')}><div className="search-input-wrap"><Icon name="marker" /><Select value={search.pickup} onChange={value => update('pickup', value)} options={['Jakarta', 'Bandung', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Yogyakarta', 'Surabaya', 'Bali']} ariaLabel={t('Lokasi penjemputan', 'Pickup location')} /></div></Field><Field label={t('Tanggal mulai', 'Start date')}><div className="search-input-wrap"><Icon name="calendar" /><input aria-label={t('Tanggal mulai', 'Start date')} type="date" required min={dateOffset()} value={search.start} onChange={event => update('start', event.target.value)} /></div></Field><Field label={t('Tanggal selesai', 'End date')}><div className="search-input-wrap"><Icon name="calendar" /><input aria-label={t('Tanggal selesai', 'End date')} type="date" required min={search.start} value={search.end} onChange={event => update('end', event.target.value)} /></div></Field><Field label={t('Jumlah penumpang', 'Passengers')}><div className="search-input-wrap"><Icon name="users" /><input aria-label={t('Jumlah penumpang', 'Passengers')} type="number" min="1" max="500" required value={search.passengers} onChange={event => update('passengers', Number(event.target.value))} /><span className="input-suffix">{t('orang', 'people')}</span></div></Field><Button type="submit" loading={loading} className="search-submit"><Icon name="search" />{t('Cari armada', 'Find a vehicle')}</Button></div>
    <AnimatePresence>{expanded && <motion.div className="search-advanced" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Field label={t('Jam keberangkatan', 'Departure time')}><input type="time" value={search.time} required onChange={event => update('time', event.target.value)} /></Field><Field label={t('Tujuan perjalanan', 'Destination')}><input value={search.destination} onChange={event => update('destination', event.target.value)} placeholder={t('Mau ke mana?', 'Where are you heading?')} /></Field><Field label={t('Tipe customer', 'Customer type')}><Select value={search.customerType} onChange={value => update('customerType', value as CustomerType)} options={customerTypes} ariaLabel="Customer type" /></Field><Field label={t('Area perjalanan', 'Travel area')}><Select value={search.area} onChange={value => update('area', value)} options={[{ value: 'Dalam kota', label: t('Dalam kota', 'Within the city') }, { value: 'Luar kota', label: t('Luar kota', 'Out of town') }]} /></Field><Field label={t('Tipe perjalanan', 'Trip type')}><Select value={search.tripType} onChange={value => update('tripType', value)} options={[{ value: 'One Way', label: 'One Way' }, { value: 'Pulang Pergi', label: t('Pulang Pergi', 'Round Trip') }, { value: 'Multi Day', label: 'Multi Day' }]} /></Field></motion.div>}</AnimatePresence>
    <div className="search-bottom"><button type="button" className="text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><Icon name="settings-sliders" />{expanded ? t('Sembunyikan detail perjalanan', 'Hide trip details') : t('Tambahkan detail perjalanan', 'Add trip details')}<Icon name={expanded ? 'angle-small-up' : 'angle-small-down'} /></button><span>{t('Harga transparan. Pilihan fleksibel.', 'Transparent prices. Flexible options.')}</span></div>
  </form>;
}

function dateAfter(start: string, days: number) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function HeroSearchForm() {
  const { search, setSearch, t, notify } = useApp();
  const navigate = useNavigate();
  const [service, setService] = useState<'self' | 'driver' | 'transfer'>(search.serviceMode || 'self');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = <K extends keyof SearchState>(key: K, value: SearchState[K]) => setSearch(previous => ({ ...previous, [key]: value }));
  function chooseService(value: string) {
    const next = value as 'self' | 'driver' | 'transfer';
    setService(next);
    setSearch(previous => ({ ...previous, serviceMode: next, tripType: next === 'transfer' ? 'One Way' : 'Pulang Pergi' }));
    if (next === 'transfer') setExpanded(true);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (search.passengers < 1) return notify(t('Jumlah penumpang minimal satu orang.', 'At least one passenger is required.'), 'error');
    if (service === 'transfer' && !search.destination.trim()) return notify(t('Isi tujuan untuk layanan antar-jemput.', 'Enter a destination for your transfer.'), 'error');
    setSearch(previous => ({ ...previous, serviceMode: service }));
    setLoading(true);
    window.setTimeout(() => { setLoading(false); navigate('/armada?search=1'); }, 350);
  }
  return <form className="search-form hero-search-form" id="cari-armada" onSubmit={submit}>
    <div className="hero-search-top">
      <Tabs value={service} onChange={chooseService} items={[
        { value: 'self', label: t('Lepas kunci', 'Self-drive'), icon: 'key' },
        { value: 'driver', label: t('Dengan driver', 'With a driver'), icon: 'steering-wheel' },
        { value: 'transfer', label: t('Antar-jemput', 'Transfers'), icon: 'route' },
      ]} />
      <div className="hero-trust" aria-label={t('Informasi layanan', 'Service information')}>
        <span><Icon name="check-circle" />{t('Unit terawat', 'Maintained vehicles')}</span>
        <span><Icon name="check-circle" />{t('Estimasi di awal', 'Upfront estimate')}</span>
        <span><Icon name="check-circle" />{t('Bantuan 07.00 - 22.00 WIB', 'Support 07:00 - 22:00 WIB')}</span>
      </div>
    </div>
    <div className="hero-search-fields">
      <Field label={t('Kota penjemputan', 'Pickup city')}><div className="search-input-wrap"><Icon name="marker" /><Select value={search.pickup} onChange={value => update('pickup', value)} options={['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Bandung', 'Yogyakarta', 'Surabaya', 'Bali']} ariaLabel={t('Kota penjemputan', 'Pickup city')} /></div></Field>
      <Field label={t('Tanggal & jam ambil', 'Pickup date & time')}><div className="hero-date-time"><input aria-label={t('Tanggal ambil', 'Pickup date')} type="date" required min={dateOffset()} value={search.start} onChange={event => setSearch(previous => ({ ...previous, start: event.target.value, end: dateAfter(event.target.value, Math.max(0, rentalDays(previous.start, previous.end) - 1)) }))} /><input aria-label={t('Jam ambil', 'Pickup time')} type="time" required value={search.time} onChange={event => update('time', event.target.value)} /></div></Field>
      <Field label={t('Tanggal selesai', 'Return date')}><input aria-label={t('Tanggal selesai', 'Return date')} type="date" required min={search.start} value={search.end} onChange={event => update('end', event.target.value)} /></Field>
      <Field label={t('Penumpang', 'Passengers')}><div className="search-input-wrap"><Icon name="users" /><input aria-label={t('Jumlah penumpang', 'Number of passengers')} type="number" min="1" max="500" required value={search.passengers} onChange={event => update('passengers', Number(event.target.value))} /><span className="input-suffix">{t('orang', 'people')}</span></div></Field>
      <Button type="submit" loading={loading} className="hero-search-submit"><Icon name="search" />{t('Cari armada', 'Find vehicles')}<Icon name="arrow-right" /></Button>
    </div>
    <div className="hero-search-footer"><button type="button" className="text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><Icon name="settings-sliders" />{expanded ? t('Sembunyikan detail rute', 'Hide route details') : t('Tambahkan tujuan & detail rute', 'Add destination & route details')}<Icon name={expanded ? 'angle-small-up' : 'angle-small-down'} /></button><span>{t('Harga demo dihitung per hari kalender. Jadwal akhir dikonfirmasi admin.', 'Demo pricing is per calendar day. The final schedule is confirmed by an admin.')}</span></div>
    <AnimatePresence>{expanded && <motion.div className="hero-search-extra" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Field label={t('Tujuan perjalanan', 'Destination')}><input value={search.destination} onChange={event => update('destination', event.target.value)} placeholder={t('Contoh: Bandara Soekarno-Hatta', 'Example: Soekarno-Hatta Airport')} /></Field><Field label={t('Area perjalanan', 'Travel area')}><Select value={search.area} onChange={value => update('area', value)} options={[{ value: 'Dalam kota', label: t('Dalam kota', 'Within the city') }, { value: 'Luar kota', label: t('Luar kota', 'Out of town') }]} /></Field></motion.div>}</AnimatePresence>
  </form>;
}

export function VehicleCard({ fleet, onAdd, selected = 0 }: { fleet: Fleet; onAdd?: (fleet: Fleet) => void; selected?: number }) {
  const { data, search, t } = useApp(); const ready = availableUnits(data, fleet.id, search.start, search.end).length;
  return <article className={`vehicle-card ${selected > 0 ? 'vehicle-selected' : ''}`}><Link className="vehicle-image" to={`/armada/${fleet.id}`}><img src={fleet.image} alt={fleet.name} loading="lazy" /><span className="vehicle-category">{fleet.category}</span>{fleet.id === 'innova' && <span className="vehicle-popular"><Icon name="star" />{t('Favorit', 'Popular')}</span>}</Link><div className="vehicle-body"><div className="vehicle-title"><Link to={`/armada/${fleet.id}`}><h3>{fleet.name}</h3></Link></div><div className="vehicle-specs"><span><Icon name="users" />{fleet.capacity} {t('penumpang', 'passengers')}</span><span><Icon name={fleet.selfDrive ? 'key' : 'steering-wheel'} />{fleet.selfDrive ? t('Lepas kunci / Driver', 'Self-drive / Driver') : t('Dengan driver', 'With driver')}</span></div><div className="vehicle-price-row"><div><small>{t('Mulai dari', 'Starting from')}</small><strong>{money(fleet.price)}<span> / {t('hari', 'day')}</span></strong></div><Link className="vehicle-detail-arrow" to={`/armada/${fleet.id}`} aria-label={`${t('Lihat detail', 'View details')} ${fleet.name}`}><Icon name="arrow-up-right" /></Link></div>{onAdd && <div className="vehicle-select-row"><span className={`availability-text ${!ready ? 'sold-out' : ''}`}><span />{ready} {t('unit tersedia', 'units available')}</span><Button variant={selected ? 'primary' : 'secondary'} disabled={!ready} onClick={() => onAdd(fleet)}>{selected > 0 ? <><Icon name="check" />{selected} {t('dipilih', 'selected')}</> : <><Icon name="plus-small" />{t('Pilih', 'Select')}</>}</Button></div>}</div></article>;
}

export function CategoryTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useApp(); return <Tabs value={value} onChange={onChange} className="category-tabs" items={[{ value: 'all', label: t('Semua armada', 'All vehicles'), icon: 'apps' }, ...categories.map(category => ({ value: category, label: category, icon: category === 'Mobil' ? 'car-alt' : category === 'Hiace' || category === 'Elf' ? 'shuttle-van' : 'bus' }))]} />;
}

export function FleetPicker({ items, onChange, start, end, passengers, excludeBookingId = '', showAvailability = true }: { items: BookingItem[]; onChange: (items: BookingItem[]) => void; start: string; end: string; passengers: number; excludeBookingId?: string; showAvailability?: boolean }) {
  const { data, t } = useApp();
  const update = (index: number, patch: Partial<BookingItem>) => onChange(items.map((item, itemIndex) => index === itemIndex ? { ...item, ...patch, unitIds: patch.quantity !== undefined ? item.unitIds.slice(0, patch.quantity) : item.unitIds } : item));
  const capacity = totalCapacity(data, items);
  return <div className="fleet-picker"><Select value="" placeholder={t('+ Tambahkan jenis armada', '+ Add a vehicle type')} onChange={id => { const f = data.fleet.find(f => f.id === id)!; onChange([...items, { fleetId: id, quantity: 1, mode: f.selfDrive ? 'self' : 'driver', unitIds: [] }]); }} options={data.fleet.filter(f => f.active && !items.some(item => item.fleetId === f.id)).map(f => ({ value: f.id, label: f.name, description: `${f.capacity} ${t('kursi', 'seats')} / ${money(f.price)}` }))} />
    <div className="fleet-picker-items">{items.map((item, index) => { const f = data.fleet.find(fleet => fleet.id === item.fleetId); if (!f) return null; const ready = availableUnits(data, f.id, start, end, excludeBookingId).length; return <div className="fleet-picker-item" key={item.fleetId}><img src={f.image} alt={f.name} /><div className="picker-item-info"><strong>{f.name}</strong><small>{f.capacity} {t('kursi / unit', 'seats / unit')}{showAvailability && ` | ${ready} ${t('tersedia', 'available')}`}</small><Select value={item.mode} onChange={value => update(index, { mode: value as 'driver' | 'self' })} options={f.selfDrive ? [{ value: 'self', label: t('Lepas kunci', 'Self-drive') }, { value: 'driver', label: t('Dengan driver (+Rp200.000/hari)', 'With driver (+Rp200,000/day)') }] : [{ value: 'driver', label: t('Termasuk driver', 'Driver included') }]} /></div><div className="quantity-control"><button type="button" disabled={item.quantity <= 1} aria-label={t('Kurangi unit', 'Remove one unit')} onClick={() => update(index, { quantity: item.quantity - 1 })}><Icon name="minus-small" /></button><input type="number" min="1" max={ready || 1} aria-label={`${f.name} unit`} value={item.quantity} onChange={event => update(index, { quantity: Math.max(1, Math.min(ready || 1, Number(event.target.value))) })} /><button type="button" disabled={item.quantity >= ready} aria-label={t('Tambah unit', 'Add one unit')} onClick={() => update(index, { quantity: item.quantity + 1 })}><Icon name="plus-small" /></button></div><button type="button" className="icon-button remove-item" aria-label={`${t('Hapus', 'Remove')} ${f.name}`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}><Icon name="trash" /></button></div>; })}</div>
    {items.length > 0 && <div className={`capacity-notice ${capacity < passengers ? 'capacity-low' : ''}`}><Icon name={capacity < passengers ? 'exclamation' : 'check-circle'} /><div><strong>{totalUnits(items)} {t('unit', 'vehicles')} &middot; {capacity} {t('kursi', 'seats')} / {passengers} {t('penumpang', 'passengers')}</strong><p>{capacity < passengers ? t(`Kapasitas kurang ${passengers - capacity} kursi. Tambahkan armada atau unit.`, `${passengers - capacity} more seats needed. Add more vehicles.`) : t('Kapasitas cukup. Siap untuk perjalanan Anda.', 'Enough room for everyone. Ready for your journey.')}</p></div></div>}
    {totalUnits(items) >= 3 && <div className="notice notice-blue"><Icon name="sparkles" /><span>{t('Anda memenuhi syarat harga khusus 3+ unit, termasuk kombinasi armada. Ajukan penawaran untuk harga terbaik.', 'You qualify for special 3+ vehicle pricing, including mixed fleets. Request a quote for the best price.')}</span></div>}
  </div>;
}
