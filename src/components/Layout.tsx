import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../store";
import { prettyDate, dateOffset, whatsappUrl } from "../data";
import { Button, ConfirmDialog, Field, Icon, Modal, Tooltip } from "./ui";

export function Logo({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      aria-label="NusaRide home"
    >
      <svg viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path
          d="M3 27 12 7h6L9 27H3Zm12 0 9-20h7l-9 20h-7Z"
          fill="currentColor"
        />
        <path d="m13 13 7 14h-7l-4-8 4-6Z" fill="currentColor" />
      </svg>
      {!compact && (
        <span>
          nusa<span className="brand-light">ride</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}
export function Preferences() {
  const { lang, setLang, dark, setDark, t } = useApp();
  const nextLang = lang === "id" ? "en" : "id";
  return (
    <div className="preferences">
      <Tooltip text={nextLang === "en" ? "English" : "Bahasa Indonesia"}>
        <button
          className="language-toggle"
          aria-label={t(
            "Ganti bahasa ke Inggris",
            "Switch language to Indonesian",
          )}
          onClick={() => setLang(nextLang)}
        >
          {lang.toUpperCase()}
        </button>
      </Tooltip>
      <Tooltip
        text={
          dark ? t("Mode terang", "Light mode") : t("Mode gelap", "Dark mode")
        }
      >
        <button
          className="icon-button theme-toggle"
          aria-label={dark ? "Light mode" : "Dark mode"}
          onClick={() => setDark(!dark)}
        >
          <Icon name={dark ? "sun" : "moon"} />
        </button>
      </Tooltip>
    </div>
  );
}
export function PublicLayout() {
  const { t, data, notify } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [code, setCode] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const handle = () => {
      setShowChat(window.scrollY > 430);
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);
  const heroPage = ["/", "/paket", "/corporate"].includes(location.pathname);
  const nav = [
    { to: "/", label: t("Beranda", "Home") },
    { to: "/armada", label: t("Armada", "Our fleet") },
    { to: "/paket", label: t("Paket Rental", "Rental packages") },
    { to: "/corporate", label: t("Sewa Korporat", "Corporate rental") },
  ];
  function track(event: React.FormEvent) {
    event.preventDefault();
    const booking = data.bookings.find(
      (b) => b.code.toLowerCase() === code.trim().toLowerCase(),
    );
    if (booking) {
      setTrackOpen(false);
      navigate(`/booking/success/${booking.id}`);
    } else
      notify(
        t(
          "Kode booking tidak ditemukan. Periksa kembali kode Anda.",
          "Booking not found. Please check your booking code.",
        ),
        "error",
      );
  }
  return (
    <div className="public-app">
      <header
        className={`site-header ${heroPage ? "site-header-hero" : ""} ${scrolled || mobileOpen ? "site-header-solid" : ""}`}
      >
        <div className="container header-inner">
          <Logo />
          <nav
            className="desktop-nav"
            aria-label={t("Navigasi utama", "Main navigation")}
          >
            {nav.map((item) => (
              <NavLink to={item.to} end={item.to === "/"} key={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Preferences />
            <Button
              className="header-contact"
              onClick={() => setContactOpen(true)}
            >
              <Icon name="comment-alt" />
              {t("Hubungi kami", "Contact us")}
              <Icon name="arrow-up-right" />
            </Button>
            <button
              className="icon-button mobile-toggle"
              aria-label={t("Buka navigasi", "Open navigation")}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Icon name={mobileOpen ? "cross" : "menu-burger"} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                  {item.label}
                  <Icon name="arrow-right" />
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setContactOpen(true);
                  setMobileOpen(false);
                }}
              >
                {t("Hubungi kami", "Contact us")}
                <Icon name="comment-alt" />
              </button>
              <button
                onClick={() => {
                  setTrackOpen(true);
                  setMobileOpen(false);
                }}
              >
                {t("Cek booking", "Track booking")}
                <Icon name="search" />
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Logo inverse />
              <p>
                {t(
                  "Lebih dari sekadar perjalanan.\nKami mengantar cerita Anda.",
                  "More than a journey.\nWe take your story further.",
                )}
              </p>
              <div className="footer-social">
                <a
                  href={whatsappUrl(
                    "Halo NusaRide, saya ingin informasi rental (demo).",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <Icon name="comment-alt" />
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText("@nusaride.demo")
                      .then(() =>
                        notify(
                          t(
                            "Username Instagram demo disalin.",
                            "Demo Instagram username copied.",
                          ),
                        ),
                      )
                      .catch(() => notify("@nusaride.demo", "info"));
                  }}
                  aria-label="Instagram demo"
                >
                  <Icon name="camera" />
                </button>
                <a href="mailto:hello@nusaride.example" aria-label="Email">
                  <Icon name="envelope" />
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>{t("Jelajahi", "Explore")}</h4>
              <Link to="/armada">{t("Pilihan armada", "Our fleet")}</Link>
              <Link to="/paket">{t("Paket rental", "Rental packages")}</Link>
              <Link to="/corporate">Corporate & Group</Link>
              <Link to="/#tentang">
                {t("Tentang NusaRide", "About NusaRide")}
              </Link>
            </div>
            <div className="footer-column">
              <h4>{t("Bantuan", "Support")}</h4>
              <Link to="/#faq">{t("Pertanyaan umum", "FAQs")}</Link>
              <button onClick={() => setTrackOpen(true)}>
                {t("Cek booking", "Track booking")}
              </button>
              <button onClick={() => setContactOpen(true)}>
                {t("Hubungi kami", "Contact us")}
              </button>
              <Link to="/ketentuan">
                {t("Syarat & ketentuan", "Terms & conditions")}
              </Link>
            </div>
            <div className="footer-column footer-contact">
              <h4>{t("Mari terhubung", "Let's connect")}</h4>
              <a
                href={whatsappUrl("Halo NusaRide (demo).")}
                target="_blank"
                rel="noreferrer"
              >
                +62 896-1661-2183 <Icon name="arrow-up-right" />
              </a>
              <a href="mailto:hello@nusaride.example">hello@nusaride.example</a>
              <span>Jakarta, Indonesia</span>
              <span className="footer-hours">
                {t(
                  "Setiap hari, 07.00 - 22.00 WIB",
                  "Every day, 07:00 - 22:00 WIB",
                )}
              </span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              &copy; {new Date().getFullYear()} NusaRide.{" "}
              {t(
                "Setiap perjalanan, lebih berarti.",
                "Make every journey matter.",
              )}
            </span>
            <span className="demo-label">
              <span />
              {t(
                "Demo frontend. Tidak ada transaksi nyata.",
                "Frontend demo. No real transactions.",
              )}
            </span>
            <Link to="/admin">
              {t("Dashboard admin", "Admin dashboard")}
              <Icon name="arrow-up-right" />
            </Link>
          </div>
          <a
            className="icon-credit"
            href="https://www.flaticon.com/uicons"
            target="_blank"
            rel="noreferrer"
          >
            Interface icons by Flaticon
          </a>
        </div>
      </footer>
      <AnimatePresence>
        {showChat && (
          <motion.button
            className="floating-chat"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setContactOpen(true)}
            aria-label={t("Konsultasi via WhatsApp", "Chat on WhatsApp")}
          >
            <Icon name="comment-alt" />
            <span>{t("Ada yang bisa dibantu?", "How can we help?")}</span>
          </motion.button>
        )}
      </AnimatePresence>
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={t("Perjalanan Anda, kami bantu.", "Let's plan your journey.")}
        description={t(
          "Ceritakan rencana Anda. Tim NusaRide siap mencarikan armada yang tepat.",
          "Tell us your plans. We will help you find the right vehicles.",
        )}
      >
        <div className="contact-detail">
          <Icon name="headset" />
          <div>
            <strong>NusaRide Travel Consultant</strong>
            <p>
              {t("Setiap hari, 07.00 - 22.00 WIB", "Daily, 07:00 - 22:00 WIB")}
            </p>
          </div>
          <span className="online-indicator" />
        </div>
        <div className="notice">
          <Icon name="info" />
          <span>
            {t(
              "Ini adalah demo. Nomor kontak merupakan data contoh, bukan layanan rental sungguhan.",
              "This is a demo. Contact details are fictional, not a real rental service.",
            )}
          </span>
        </div>
        <a
          className="btn btn-primary full-width"
          href={whatsappUrl(
            "Halo NusaRide! Saya ingin konsultasi rental armada. (Demo frontend)",
          )}
          target="_blank"
          rel="noreferrer"
          onClick={() => setContactOpen(false)}
        >
          <Icon name="comment-alt" />
          {t("Lanjutkan ke WhatsApp", "Continue to WhatsApp")}
          <Icon name="arrow-up-right" />
        </a>
        <Button
          variant="ghost"
          className="full-width mt-3"
          onClick={() => {
            setContactOpen(false);
            navigate("/armada");
          }}
        >
          {t(
            "Atau jelajahi armada terlebih dahulu",
            "Or explore our fleet first",
          )}
        </Button>
      </Modal>
      <Modal
        open={trackOpen}
        onClose={() => setTrackOpen(false)}
        title={t("Cek booking Anda", "Track your booking")}
        description={t(
          "Masukkan kode yang Anda terima setelah membuat booking.",
          "Enter the code you received after making your booking.",
        )}
      >
        <form onSubmit={track}>
          <Field label={t("Kode booking", "Booking code")}>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="NR-260701-001"
              required
            />
          </Field>
          <Button type="submit" className="full-width mt-6">
            {t("Lihat booking", "View booking")}
            <Icon name="arrow-right" />
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export const adminLinks = [
  {
    path: "",
    id: "Dashboard",
    en: "Dashboard",
    icon: "apps",
    group: "workspace",
  },
  {
    path: "booking",
    id: "Booking",
    en: "Bookings",
    icon: "calendar-check",
    group: "workspace",
  },
  {
    path: "corporate-request",
    id: "Corporate Request",
    en: "Corporate requests",
    icon: "building",
    group: "workspace",
  },
  {
    path: "vendor",
    id: "Vendor Rental",
    en: "Rental vendors",
    icon: "shop",
    group: "operations",
  },
  {
    path: "armada",
    id: "Armada & Unit",
    en: "Fleet & units",
    icon: "car-alt",
    group: "operations",
  },
  {
    path: "kalender",
    id: "Kalender",
    en: "Calendar",
    icon: "calendar",
    group: "operations",
  },
  {
    path: "lokasi",
    id: "Lokasi Armada",
    en: "Fleet locations",
    icon: "marker",
    group: "operations",
  },
  {
    path: "driver",
    id: "Driver",
    en: "Drivers",
    icon: "steering-wheel",
    group: "operations",
  },
  {
    path: "maintenance",
    id: "Maintenance",
    en: "Maintenance",
    icon: "wrench-simple",
    group: "operations",
  },
  {
    path: "customer",
    id: "Customer",
    en: "Customers",
    icon: "users",
    group: "business",
  },
  {
    path: "harga",
    id: "Harga",
    en: "Pricing",
    icon: "tags",
    group: "business",
  },
  {
    path: "pembayaran",
    id: "Pembayaran",
    en: "Payments",
    icon: "credit-card",
    group: "business",
  },
  {
    path: "quotation",
    id: "Quotation",
    en: "Quotations",
    icon: "document-signed",
    group: "business",
  },
  {
    path: "invoice",
    id: "Invoice",
    en: "Invoices",
    icon: "receipt",
    group: "business",
  },
  {
    path: "laporan",
    id: "Laporan",
    en: "Reports",
    icon: "chart-histogram",
    group: "business",
  },
];
export function AdminLayout() {
  const { isAdmin, setIsAdmin, t, data, resetDemo, lang } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => setMobileOpen(false), [location.pathname]);
  if (!isAdmin)
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  const current = adminLinks.find(
    (link) => location.pathname === `/admin${link.path ? "/" + link.path : ""}`,
  );
  const inquiries = data.bookings.filter((b) => b.status === "Inquiry");
  return (
    <div className="admin-app">
      {mobileOpen && (
        <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`admin-sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Logo />
          <span className="workspace-tag">WORKSPACE</span>
          <button
            className="icon-button mobile-toggle"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="cross" />
          </button>
        </div>
        <nav className="sidebar-nav">
          {["workspace", "operations", "business"].map((group) => (
            <div className="nav-group" key={group}>
              <p>
                {group === "workspace"
                  ? t("RINGKASAN", "OVERVIEW")
                  : group === "operations"
                    ? t("OPERASIONAL", "OPERATIONS")
                    : t("BISNIS", "BUSINESS")}
              </p>
              {adminLinks
                .filter((link) => link.group === group)
                .map((link) => (
                  <NavLink
                    key={link.path}
                    to={`/admin${link.path ? "/" + link.path : ""}`}
                    end
                  >
                    <Icon name={link.icon} />
                    <span>{t(link.id, link.en)}</span>
                    {link.path === "corporate-request" && (
                      <span className="nav-counter">
                        {
                          data.bookings.filter(
                            (b) =>
                              b.status === "Inquiry" &&
                              b.customerType !== "Personal",
                          ).length
                        }
                      </span>
                    )}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/">
            <Icon name="globe" />
            {t("Lihat website", "View website")}
            <Icon name="arrow-up-right" />
          </Link>
          <button onClick={() => setResetOpen(true)}>
            <Icon name="refresh" />
            {t("Reset data demo", "Reset demo data")}
          </button>
          <div className="admin-profile">
            <span className="avatar">SA</span>
            <div>
              <strong>Super Admin</strong>
              <small>admin@nusaride.id</small>
            </div>
            <Tooltip text={t("Keluar", "Sign out")}>
              <button
                className="icon-button"
                aria-label={t("Keluar", "Sign out")}
                onClick={() => {
                  setIsAdmin(false);
                  navigate("/admin/login");
                }}
              >
                <Icon name="sign-out-alt" />
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu-burger" />
            </button>
            <span className="admin-breadcrumb">
              Workspace <Icon name="angle-small-right" />
              <strong>
                {current ? t(current.id, current.en) : "Dashboard"}
              </strong>
            </span>
          </div>
          <div>
            <span className="admin-today">
              <Icon name="calendar" />
              {prettyDate(dateOffset(), lang)}
            </span>
            <Preferences />
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label={t("Notifikasi", "Notifications")}
                onClick={() => setNotifications(!notifications)}
              >
                <Icon name="bell" />
                {inquiries.length > 0 && <span />}
              </button>
              {notifications && (
                <>
                  <div
                    className="dropdown-scrim"
                    onClick={() => setNotifications(false)}
                  />
                  <div className="notification-dropdown">
                    <h4>{t("Perlu perhatian", "Needs attention")}</h4>
                    {inquiries.map((booking) => (
                      <Link
                        to="/admin/booking"
                        key={booking.id}
                        onClick={() => setNotifications(false)}
                      >
                        <span className="notification-icon">
                          <Icon name="calendar-plus" />
                        </span>
                        <div>
                          <strong>{booking.name}</strong>
                          <p>
                            {t("Inquiry baru", "New inquiry")} &middot;{" "}
                            {booking.code}
                          </p>
                        </div>
                        <Icon name="angle-small-right" />
                      </Link>
                    ))}
                    {!inquiries.length && (
                      <p className="muted">
                        {t("Semua sudah ditangani.", "You are all caught up.")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <span className="avatar avatar-small">SA</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
        <footer className="admin-footer">
          <span>NusaRide Workspace</span>
          <span>
            {t("Mode demo", "Demo mode")}
            <span className="status-dot" />
            {t("Data tersimpan di browser Anda", "Data saved in your browser")}
          </span>
        </footer>
      </div>
      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetDemo}
        title={t("Reset semua data demo?", "Reset all demo data?")}
        description={t(
          "Booking dan perubahan Anda akan dihapus. Data contoh awal akan dipulihkan.",
          "Your bookings and changes will be removed and the initial sample data restored.",
        )}
      />
    </div>
  );
}
