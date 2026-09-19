export type CustomerType =
  | "Personal"
  | "Corporate"
  | "Sekolah / Kampus"
  | "Instansi"
  | "Travel Agent"
  | "Event Organizer";
export type Category = "Mobil" | "Hiace" | "Elf" | "Medium Bus" | "Big Bus";
export type BookingStatus =
  | "Inquiry"
  | "Waiting DP"
  | "DP Paid"
  | "Confirmed"
  | "Waiting Vendor Assignment"
  | "Vendor Assigned"
  | "Ready"
  | "On Trip"
  | "Completed"
  | "Cancelled";
export interface SearchState {
  start: string;
  end: string;
  time: string;
  pickup: string;
  destination: string;
  passengers: number;
  customerType: CustomerType;
  area: string;
  tripType: string;
  serviceMode?: "self" | "driver" | "transfer";
}
export interface Fleet {
  id: string;
  name: string;
  category: Category;
  capacity: number;
  price: number;
  corporatePrice: number;
  partnerPrice: number;
  image: string;
  selfDrive: boolean;
  transmission: string;
  fuel: string;
  facilities: string[];
  description: string;
  active: boolean;
}
export interface Vendor {
  id: string;
  name: string;
  owner: string;
  whatsapp: string;
  address: string;
  area: string;
  notes: string;
  active: boolean;
}
export interface Unit {
  id: string;
  plate: string;
  fleetId: string;
  vendorId: string;
  cost: number;
  status: string;
  gps: boolean;
  location: string;
  x: number;
  y: number;
  notes: string;
}
export interface Driver {
  id: string;
  name: string;
}
export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  notes: string;
}
export interface Organization {
  id: string;
  name: string;
  pic: string;
  whatsapp: string;
  email: string;
  address: string;
  npwp: string;
  notes: string;
}
export interface BookingItem {
  fleetId: string;
  quantity: number;
  mode: "driver" | "self";
  unitIds: string[];
  driverId?: string;
}
export interface Booking extends SearchState {
  id: string;
  code: string;
  name: string;
  whatsapp: string;
  email: string;
  company: string;
  source: string;
  status: BookingStatus;
  items: BookingItem[];
  total: number;
  discount: number;
  notes: string;
  createdAt: string;
}
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  date: string;
  type: "Payment" | "Refund";
  notes: string;
}
export interface Maintenance {
  id: string;
  unitId: string;
  start: string;
  end: string;
  type: string;
  notes: string;
}
export interface Document {
  id: string;
  number: string;
  type: "Quotation" | "Invoice";
  bookingId: string;
  discount: number;
  validUntil: string;
  status: string;
  notes: string;
}
export interface PriceRule {
  id: string;
  fleetId: string;
  audience: string;
  route: string;
  price: number;
}
export interface DemoData {
  fleet: Fleet[];
  vendors: Vendor[];
  units: Unit[];
  drivers: Driver[];
  customers: Customer[];
  organizations: Organization[];
  bookings: Booking[];
  payments: Payment[];
  maintenance: Maintenance[];
  documents: Document[];
  prices: PriceRule[];
}
export const customerTypes: CustomerType[] = [
  "Personal",
  "Corporate",
  "Sekolah / Kampus",
  "Instansi",
  "Travel Agent",
  "Event Organizer",
];
export const categories: Category[] = [
  "Mobil",
  "Hiace",
  "Elf",
  "Medium Bus",
  "Big Bus",
];
export const bookingStatuses: BookingStatus[] = [
  "Inquiry",
  "Waiting DP",
  "DP Paid",
  "Confirmed",
  "Waiting Vendor Assignment",
  "Vendor Assigned",
  "Ready",
  "On Trip",
  "Completed",
  "Cancelled",
];
export const blockingStatuses: BookingStatus[] = [
  "Waiting DP",
  "DP Paid",
  "Confirmed",
  "Waiting Vendor Assignment",
  "Vendor Assigned",
  "Ready",
  "On Trip",
];
export const sources = [
  "Website",
  "WhatsApp",
  "Telepon",
  "Instagram",
  "Referral",
  "Manual",
];
export const money = (value: number) =>
  "Rp" + Math.round(value).toLocaleString("id-ID");
export const uid = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
export function dateOffset(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
}
export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const prettyDate = (date: string, lang = "id") =>
  date
    ? new Date(date + "T12:00:00").toLocaleDateString(
        lang === "id" ? "id-ID" : "en-GB",
        { day: "numeric", month: "short", year: "numeric" },
      )
    : "-";
export const rentalDays = (start: string, end: string) =>
  Math.max(
    1,
    Math.round(
      (new Date(end + "T12:00:00").getTime() -
        new Date(start + "T12:00:00").getTime()) /
        86400000,
    ) + 1,
  );
export const overlaps = (s1: string, e1: string, s2: string, e2: string) =>
  s1 <= e2 && e1 >= s2;
export const defaultSearch: SearchState = {
  start: dateOffset(1),
  end: dateOffset(1),
  time: "08:00",
  pickup: "Jakarta",
  destination: "",
  passengers: 6,
  customerType: "Personal",
  area: "Dalam kota",
  tripType: "Pulang Pergi",
};

export function availableUnits(
  data: DemoData,
  fleetId: string,
  start: string,
  end: string,
  excludeBookingId = "",
) {
  if (
    !data.fleet.some((fleet) => fleet.id === fleetId && fleet.active) ||
    !start ||
    !end ||
    end < start
  )
    return [];
  const blocked = new Set(
    data.bookings
      .filter(
        (b) =>
          b.id !== excludeBookingId &&
          blockingStatuses.includes(b.status) &&
          overlaps(start, end, b.start, b.end),
      )
      .flatMap((b) => b.items.flatMap((i) => i.unitIds)),
  );
  return data.units.filter(
    (u) =>
      u.fleetId === fleetId &&
      u.status !== "Inactive" &&
      u.status !== "Maintenance" &&
      data.vendors.some((v) => v.id === u.vendorId && v.active) &&
      !blocked.has(u.id) &&
      !data.maintenance.some(
        (m) => m.unitId === u.id && overlaps(start, end, m.start, m.end),
      ),
  );
}
export function unitStatus(data: DemoData, unit: Unit, date = dateOffset()) {
  if (
    unit.status === "Inactive" ||
    !data.vendors.some(
      (vendor) => vendor.id === unit.vendorId && vendor.active,
    ) ||
    !data.fleet.some((fleet) => fleet.id === unit.fleetId && fleet.active)
  )
    return "Inactive";
  if (
    unit.status === "Maintenance" ||
    data.maintenance.some(
      (m) => m.unitId === unit.id && overlaps(date, date, m.start, m.end),
    )
  )
    return "Maintenance";
  const booking = data.bookings.find(
    (b) =>
      blockingStatuses.includes(b.status) &&
      overlaps(date, date, b.start, b.end) &&
      b.items.some((i) => i.unitIds.includes(unit.id)),
  );
  if (!booking) return "Available";
  if (booking.status === "On Trip") return "On Trip";
  if (booking.status === "Waiting DP" || booking.status === "DP Paid")
    return "Reserved";
  return "Booked";
}
export const paidAmount = (data: DemoData, bookingId: string) =>
  data.payments
    .filter((p) => p.bookingId === bookingId)
    .reduce((sum, p) => sum + (p.type === "Refund" ? -p.amount : p.amount), 0);
export function paymentStatus(data: DemoData, booking: Booking) {
  const paid = paidAmount(data, booking.id);
  if (
    data.payments.some(
      (p) => p.bookingId === booking.id && p.type === "Refund",
    ) &&
    paid <= 0
  )
    return "Refund";
  return paid >= booking.total && booking.total > 0
    ? "Lunas"
    : paid === 50000
      ? "DP"
      : paid > 0
        ? "Partial Payment"
        : "Belum bayar";
}
export const totalUnits = (items: BookingItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);
export const totalCapacity = (data: DemoData, items: BookingItem[]) =>
  items.reduce(
    (sum, i) =>
      sum +
      i.quantity * (data.fleet.find((f) => f.id === i.fleetId)?.capacity || 0),
    0,
  );
export function estimate(
  data: DemoData,
  items: BookingItem[],
  start: string,
  end: string,
) {
  return (
    items.reduce((sum, i) => {
      const f = data.fleet.find((fleet) => fleet.id === i.fleetId);
      return (
        sum +
        ((f?.price || 0) + (i.mode === "driver" && f?.selfDrive ? 200000 : 0)) *
          i.quantity
      );
    }, 0) * rentalDays(start, end)
  );
}
export function vendorCost(data: DemoData, booking: Booking) {
  return (
    booking.items.reduce(
      (sum, item) =>
        sum +
        item.unitIds.reduce(
          (cost, id) => cost + (data.units.find((u) => u.id === id)?.cost || 0),
          0,
        ),
      0,
    ) * rentalDays(booking.start, booking.end)
  );
}
export function whatsappUrl(message: string, number = "6289616612183") {
  const digits = number.replace(/\D/g, "").replace(/^0/, "62");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function bookingMessage(data: DemoData, booking: Booking) {
  return `Halo NusaRide, saya ingin konfirmasi booking demo.\n\nKode: ${booking.code}\nNama: ${booking.name}${booking.company ? "\nPerusahaan: " + booking.company : ""}\nTanggal: ${prettyDate(booking.start)} - ${prettyDate(booking.end)}\nJam: ${booking.time}\nRute: ${booking.pickup} ke ${booking.destination}\nArmada: ${booking.items.map((i) => `${data.fleet.find((f) => f.id === i.fleetId)?.name} (${i.quantity} unit, ${i.mode === "driver" ? "dengan driver" : "lepas kunci"})`).join(", ")}\nTotal unit: ${totalUnits(booking.items)}\nTotal: ${money(booking.total)}\nPembayaran: ${paymentStatus(data, booking)}\nStatus: ${booking.status}\n\nIni adalah demo, bukan transaksi sungguhan.`;
}

export function createSeedData(): DemoData {
  const fleet: Fleet[] = [
    {
      id: "innova",
      name: "Toyota Innova Zenix",
      category: "Mobil",
      capacity: 7,
      price: 650000,
      corporatePrice: 600000,
      partnerPrice: 575000,
      image: "/images/innova.webp",
      selfDrive: true,
      transmission: "Automatic",
      fuel: "Hybrid",
      facilities: [
        "AC",
        "Bluetooth",
        "USB Charger",
        "Reclining Seat",
        "Bagasi luas",
      ],
      description:
        "Kenyamanan premium untuk perjalanan keluarga dan bisnis. Kabin yang lapang dengan teknologi hybrid yang lebih efisien.",
      active: true,
    },
    {
      id: "hiace",
      name: "Toyota Hiace Premio",
      category: "Hiace",
      capacity: 14,
      price: 1200000,
      corporatePrice: 1100000,
      partnerPrice: 1000000,
      image: "/images/hiace.webp",
      selfDrive: false,
      transmission: "Manual",
      fuel: "Diesel",
      facilities: [
        "AC",
        "Reclining Seat",
        "USB Charger",
        "Audio System",
        "Bagasi luas",
      ],
      description:
        "Ruang lebih untuk cerita yang lebih banyak. Pilihan ideal untuk wisata keluarga besar, outing kantor, dan perjalanan antarkota.",
      active: true,
    },
    {
      id: "elf",
      name: "Isuzu Elf Long",
      category: "Elf",
      capacity: 19,
      price: 1450000,
      corporatePrice: 1350000,
      partnerPrice: 1250000,
      image: "/images/elf.webp",
      selfDrive: false,
      transmission: "Manual",
      fuel: "Diesel",
      facilities: ["AC", "Reclining Seat", "Audio System", "Bagasi luas"],
      description:
        "Solusi perjalanan rombongan yang praktis dan nyaman. Kapasitas lega untuk kegiatan sekolah, komunitas, dan wisata.",
      active: true,
    },
    {
      id: "medium-bus",
      name: "Medium Bus Executive",
      category: "Medium Bus",
      capacity: 35,
      price: 2300000,
      corporatePrice: 2100000,
      partnerPrice: 1950000,
      image: "/images/bus.webp",
      selfDrive: false,
      transmission: "Manual",
      fuel: "Diesel",
      facilities: [
        "AC",
        "Reclining Seat",
        "TV & Karaoke",
        "USB Charger",
        "Bagasi luas",
      ],
      description:
        "Setiap anggota rombongan berhak menikmati perjalanan. Bus executive dengan fasilitas lengkap dan driver berpengalaman.",
      active: true,
    },
    {
      id: "avanza",
      name: "Toyota Avanza Veloz",
      category: "Mobil",
      capacity: 7,
      price: 400000,
      corporatePrice: 375000,
      partnerPrice: 350000,
      image: "/images/avanza.webp",
      selfDrive: true,
      transmission: "Automatic",
      fuel: "Bensin",
      facilities: ["AC", "Bluetooth", "USB Charger", "Bagasi luas"],
      description:
        "Teman perjalanan harian yang andal. Fleksibel untuk aktivitas dalam kota maupun liburan akhir pekan bersama keluarga.",
      active: true,
    },
    {
      id: "big-bus",
      name: "Big Bus Royal Class",
      category: "Big Bus",
      capacity: 50,
      price: 3500000,
      corporatePrice: 3250000,
      partnerPrice: 3000000,
      image: "/images/bigbus.webp",
      selfDrive: false,
      transmission: "Automatic",
      fuel: "Diesel",
      facilities: [
        "AC",
        "Reclining Seat",
        "TV & Karaoke",
        "Toilet",
        "USB Charger",
        "Bagasi luas",
      ],
      description:
        "Perjalanan besar, pengalaman istimewa. Bus pariwisata premium untuk acara perusahaan dan rombongan skala besar.",
      active: true,
    },
  ];
  const vendors: Vendor[] = [
    {
      id: "v1",
      name: "Prima Transport",
      owner: "Budi Santoso",
      whatsapp: "081298765401",
      address: "Jl. TB Simatupang No. 18, Jakarta Selatan",
      area: "Jakarta",
      notes: "Partner utama. Armada premium, respons cepat.",
      active: true,
    },
    {
      id: "v2",
      name: "Bintang Jaya Rental",
      owner: "Andi Pratama",
      whatsapp: "081298765402",
      address: "Jl. Margonda Raya No. 42, Depok",
      area: "Depok",
      notes: "Spesialis mobil keluarga dan Hiace.",
      active: true,
    },
    {
      id: "v3",
      name: "Nusantara Bus",
      owner: "Hendra Wijaya",
      whatsapp: "081298765403",
      address: "Jl. Raya Bekasi KM 22, Bekasi",
      area: "Bekasi",
      notes: "Bus pariwisata dan Elf untuk rombongan.",
      active: true,
    },
    {
      id: "v4",
      name: "Cahaya Wisata",
      owner: "Rina Kusuma",
      whatsapp: "081298765404",
      address: "Jl. Pajajaran No. 56, Bogor",
      area: "Bogor",
      notes: "Area operasional Jawa Barat dan Jabodetabek.",
      active: true,
    },
    {
      id: "v5",
      name: "Artha Mobility",
      owner: "Dimas Saputra",
      whatsapp: "081298765405",
      address: "Jl. BSD Raya No. 12, Tangerang",
      area: "Tangerang",
      notes: "Corporate shuttle dan airport transfer.",
      active: true,
    },
  ];
  const locations = [
    "Jl. Sudirman, Jakarta Pusat",
    "Kemang, Jakarta Selatan",
    "Bandara Soekarno-Hatta",
    "Margonda, Depok",
    "Cikarang, Bekasi",
    "BSD City, Tangerang",
    "Sentul, Bogor",
    "Kelapa Gading, Jakarta Utara",
  ];
  const units: Unit[] = fleet.flatMap((f, fi) =>
    Array.from({ length: [8, 8, 6, 5, 8, 4][fi] }, (_, i) => ({
      id: `u-${f.id}-${i + 1}`,
      plate: `${i % 4 === 3 ? "F" : "B"} ${1200 + fi * 100 + i * 17} ${["NRA", "KJT", "SZX", "TMA"][i % 4]}`,
      fleetId: f.id,
      vendorId: vendors[(i + fi) % vendors.length].id,
      cost: Math.round((f.price * (0.67 + (i % 3) * 0.045)) / 10000) * 10000,
      status: "Available",
      gps: i % 5 !== 4,
      location: locations[(i + fi) % locations.length],
      x: 15 + ((fi * 17 + i * 11) % 72),
      y: 18 + ((fi * 23 + i * 13) % 64),
      notes: i % 3 === 0 ? "Servis rutin selesai. Kondisi prima." : "",
    })),
  );
  const customers: Customer[] = [
    ["c1", "Aditya Pratama", "081234567801", "aditya.pratama@example.com"],
    ["c2", "Sarah Wijaya", "081234567802", "sarah.w@example.com"],
    ["c3", "Dimas Saputra", "081234567803", "dimas.s@example.com"],
    ["c4", "Putri Maharani", "081234567804", "putri.m@example.com"],
    ["c5", "Rizky Ramadhan", "081234567805", "rizky.r@example.com"],
    ["c6", "Dewi Lestari", "081234567806", "dewi.l@example.com"],
    ["c7", "Fajar Nugroho", "081234567807", "fajar.n@example.com"],
    ["c8", "Nadia Putri", "081234567808", "nadia.p@example.com"],
  ].map(([id, name, whatsapp, email]) => ({
    id,
    name,
    whatsapp,
    email,
    notes: "",
  }));
  const organizations: Organization[] = [
    {
      id: "o1",
      name: "PT Ruang Karya Indonesia",
      pic: "Sarah Wijaya",
      whatsapp: customers[1].whatsapp,
      email: "sarah@ruangkarya.example",
      address: "SCBD, Jakarta Selatan",
      npwp: "01.234.567.8-012.000",
      notes: "Company outing setiap kuartal.",
    },
    {
      id: "o2",
      name: "Universitas Indonesia",
      pic: "Dimas Saputra",
      whatsapp: customers[2].whatsapp,
      email: "dimas@kampus.example",
      address: "Kampus UI, Depok",
      npwp: "",
      notes: "Study tour dan kunjungan industri.",
    },
    {
      id: "o3",
      name: "PT Arunika Digital",
      pic: "Dewi Lestari",
      whatsapp: customers[5].whatsapp,
      email: "dewi@arunika.example",
      address: "Kuningan, Jakarta Selatan",
      npwp: "02.345.678.9-013.000",
      notes: "Airport transfer untuk tamu perusahaan.",
    },
    {
      id: "o4",
      name: "Langkah Travel",
      pic: "Fajar Nugroho",
      whatsapp: customers[6].whatsapp,
      email: "fajar@langkah.example",
      address: "Jl. Dago, Bandung",
      npwp: "",
      notes: "Partner agen perjalanan.",
    },
  ];
  const definitions: {
    customer: number;
    offset: number;
    days: number;
    type: CustomerType;
    company?: string;
    status: BookingStatus;
    fleet: string;
    qty: number;
    destination: string;
  }[] = [
    {
      customer: 0,
      offset: 0,
      days: 1,
      type: "Personal",
      status: "On Trip",
      fleet: "innova",
      qty: 1,
      destination: "Bandung",
    },
    {
      customer: 1,
      offset: 2,
      days: 2,
      type: "Corporate",
      company: organizations[0].name,
      status: "Confirmed",
      fleet: "hiace",
      qty: 3,
      destination: "Puncak, Bogor",
    },
    {
      customer: 2,
      offset: 4,
      days: 1,
      type: "Sekolah / Kampus",
      company: organizations[1].name,
      status: "Inquiry",
      fleet: "big-bus",
      qty: 2,
      destination: "Yogyakarta",
    },
    {
      customer: 3,
      offset: 1,
      days: 1,
      type: "Personal",
      status: "DP Paid",
      fleet: "innova",
      qty: 1,
      destination: "Jakarta Selatan",
    },
    {
      customer: 4,
      offset: 0,
      days: 0,
      type: "Personal",
      status: "Ready",
      fleet: "avanza",
      qty: 1,
      destination: "Bandara Soekarno-Hatta",
    },
    {
      customer: 5,
      offset: 3,
      days: 0,
      type: "Corporate",
      company: organizations[2].name,
      status: "Waiting DP",
      fleet: "hiace",
      qty: 1,
      destination: "Bandara Soekarno-Hatta",
    },
    {
      customer: 6,
      offset: 6,
      days: 2,
      type: "Travel Agent",
      company: organizations[3].name,
      status: "Waiting Vendor Assignment",
      fleet: "medium-bus",
      qty: 3,
      destination: "Dieng, Wonosobo",
    },
    {
      customer: 7,
      offset: 1,
      days: 0,
      type: "Personal",
      status: "Inquiry",
      fleet: "elf",
      qty: 1,
      destination: "Sentul, Bogor",
    },
    {
      customer: 0,
      offset: -5,
      days: 1,
      type: "Personal",
      status: "Completed",
      fleet: "avanza",
      qty: 1,
      destination: "Bogor",
    },
    {
      customer: 3,
      offset: -3,
      days: 0,
      type: "Personal",
      status: "Completed",
      fleet: "innova",
      qty: 1,
      destination: "Jakarta Pusat",
    },
    {
      customer: 4,
      offset: 5,
      days: 0,
      type: "Personal",
      status: "Cancelled",
      fleet: "avanza",
      qty: 1,
      destination: "Tangerang",
    },
    {
      customer: 1,
      offset: -8,
      days: 2,
      type: "Corporate",
      company: organizations[0].name,
      status: "Completed",
      fleet: "medium-bus",
      qty: 2,
      destination: "Bandung",
    },
  ];
  const bookings: Booking[] = definitions.map((d, i) => {
    const f = fleet.find((item) => item.id === d.fleet)!;
    const c = customers[d.customer];
    const chosen = units
      .filter((u) => u.fleetId === f.id)
      .slice(i === 3 || i === 5 ? 4 : 0, (i === 3 || i === 5 ? 4 : 0) + d.qty);
    return {
      ...defaultSearch,
      id: `b${i + 1}`,
      code: `NR-${dateOffset().replace(/-/g, "").slice(2)}-${String(101 + i).padStart(3, "0")}`,
      name: c.name,
      whatsapp: c.whatsapp,
      email: c.email,
      company: d.company || "",
      source: sources[i % sources.length],
      status: d.status,
      customerType: d.type,
      start: dateOffset(d.offset),
      end: dateOffset(d.offset + d.days),
      time: ["08:00", "07:00", "06:30", "09:00"][i % 4],
      pickup: "Jakarta",
      destination: d.destination,
      passengers: Math.max(2, f.capacity * d.qty - 3),
      tripType: d.days > 0 ? "Multi Day" : "Pulang Pergi",
      area: "Luar kota",
      items: [
        {
          fleetId: f.id,
          quantity: d.qty,
          mode: "driver",
          unitIds:
            d.status === "Inquiry" || d.status === "Cancelled"
              ? []
              : chosen.map((u) => u.id),
          driverId: `dr${(i % 8) + 1}`,
        },
      ],
      total: (f.price + (f.selfDrive ? 200000 : 0)) * d.qty * (d.days + 1),
      discount: 0,
      notes:
        i === 1
          ? "Company outing, pickup di kantor pukul 07.00. Mohon armada seragam."
          : "",
      createdAt: dateOffset(-Math.floor(i / 3)) + "T10:30:00",
    };
  });
  const payments: Payment[] = bookings
    .filter((b) => !["Inquiry", "Waiting DP", "Cancelled"].includes(b.status))
    .map((b, i) => ({
      id: `p${i + 1}`,
      bookingId: b.id,
      amount: ["Completed", "On Trip", "Ready"].includes(b.status)
        ? b.total
        : b.status === "DP Paid"
          ? 50000
          : Math.round(b.total * 0.3),
      method: i % 2 ? "Transfer BCA" : "QRIS",
      date: dateOffset(-i % 4),
      type: "Payment",
      notes: "Data pembayaran demo",
    }));
  return {
    fleet,
    vendors,
    units,
    customers,
    organizations,
    bookings,
    payments,
    drivers: [
      "Agus Setiawan",
      "Bambang Suryanto",
      "Eko Prasetyo",
      "Dedi Irawan",
      "Joko Susilo",
      "Rahmat Hidayat",
      "Yudi Permana",
      "Tono Wijaya",
    ].map((name, i) => ({ id: `dr${i + 1}`, name })),
    maintenance: [
      {
        id: "m1",
        unitId: "u-hiace-8",
        start: dateOffset(-1),
        end: dateOffset(2),
        type: "Servis berkala",
        notes: "Ganti oli dan pemeriksaan rem 40.000 km.",
      },
      {
        id: "m2",
        unitId: "u-avanza-8",
        start: dateOffset(4),
        end: dateOffset(5),
        type: "Penggantian ban",
        notes: "Ganti 4 ban dan spooring balancing.",
      },
    ],
    documents: [
      {
        id: "d1",
        number: "QUO/NR/2026/001",
        type: "Quotation",
        bookingId: "b3",
        discount: 250000,
        validUntil: dateOffset(7),
        status: "Sent",
        notes:
          "Penawaran termasuk driver, belum termasuk BBM, tol, dan parkir.",
      },
      {
        id: "d2",
        number: "INV/NR/2026/001",
        type: "Invoice",
        bookingId: "b2",
        discount: 0,
        validUntil: dateOffset(2),
        status: "Sent",
        notes: "Pelunasan paling lambat H-1 keberangkatan.",
      },
    ],
    prices: [
      {
        id: "pr1",
        fleetId: "innova",
        audience: "Personal",
        route: "Jakarta - Bandung",
        price: 1100000,
      },
      {
        id: "pr2",
        fleetId: "hiace",
        audience: "Corporate",
        route: "Jakarta - Puncak",
        price: 1400000,
      },
    ],
  };
}
