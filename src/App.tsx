import React, { useEffect, useMemo, useRef, useState } from 'react';
import coupleImg from './assets/img/1.JPG';
import { getGalleryImages, getGalleryVideos } from './gallery';

function App() {
  const [lightbox, setLightbox] = useState<{ open: boolean; kind: 'image' | 'video'; src: string; alt: string; index: number }>(
    { open: false, kind: 'image', src: '', alt: '', index: -1 }
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'light' || saved === 'dark') return saved as 'light' | 'dark';
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const baseNav = "rounded-md px-2 py-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream";
  const isActiveId = (id: string) => activeSection === id || (id === 'songs' && (activeSection === 'song-131' || activeSection === 'song-132'));
  const linkClass = (id: string) => `${baseNav} ${isActiveId(id) ? 'text-accent font-semibold' : ''}`;
  const ariaCurrent = (id: string) => (isActiveId(id) ? 'page' : undefined);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const onOpenLightboxAt = (index: number) => {
    prevFocusRef.current = document.activeElement as HTMLElement;
    const item = media[index];
    if (!item) return;
    setLightbox({ open: true, kind: item.kind, src: item.src, alt: item.alt, index });
  };

  const onCloseLightbox = () => {
    setLightbox({ open: false, kind: 'image', src: '', alt: '', index: -1 });
    prevFocusRef.current?.focus?.();
  };

  useEffect(() => {
    if (lightbox.open) {
      closeBtnRef.current?.focus();
    }
  }, [lightbox.open]);

  // Countdown state - disabled for funeral
  const funeralDate = useMemo(() => new Date('2025-12-28T00:00:00'), []);
  type Countdown = { d: number; h: number; m: number; s: number; done: boolean };
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = funeralDate.getTime() - now;
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0, done: true });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown({ d, h, m, s, done: false });
    };
    update();
    intervalRef.current = window.setInterval(update, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [funeralDate]);

  // Build gallery from local images and videos (memoized)
  const images = useMemo(() => getGalleryImages(), []);
  const videos = useMemo(() => getGalleryVideos(), []);
  const media = useMemo(() => [
    ...images.map((i) => ({ kind: 'image' as const, ...i })),
    ...videos.map((v) => ({ kind: 'video' as const, ...v })),
  ], [images, videos]);

  // Keyboard controls when lightbox is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (media.length > 1) {
          const next = (lightbox.index + 1 + media.length) % media.length;
          const item = media[next];
          setLightbox({ open: true, kind: item.kind, src: item.src, alt: item.alt, index: next });
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (media.length > 1) {
          const prev = (lightbox.index - 1 + media.length) % media.length;
          const item = media[prev];
          setLightbox({ open: true, kind: item.kind, src: item.src, alt: item.alt, index: prev });
        }
      }
    };
    if (lightbox.open) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open, lightbox.index, media]);

  // Show scroll-to-top button on scroll
  useEffect(() => {
    let ticking = false;

    const ids = ['home','gallery','program','song-131','song-132','reception','rsvp'];
    const getActive = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const offset = 120; // approximate sticky header + padding
      const targetY = y + offset;
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        if (top <= targetY) current = id; else break;
      }
      return current;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          setShowScrollTop(y > 300);
          const current = getActive();
          setActiveSection((prev) => (prev !== current ? current : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    // initial
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal on viewport
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal')) as HTMLElement[];
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion or no IntersectionObserver support, reveal immediately
    if (prefersReduced || typeof window === 'undefined' || !(window as any).IntersectionObserver) {
      nodes.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-cream to-gray-200 text-primary font-body dark:from-gray-900 dark:to-gray-950 dark:text-white">
      {/* Skip to content for accessibility */}
      <a href="#mainContent" className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 focus:bg-cream focus:text-primary focus:px-3 focus:py-2 focus:rounded-md focus:shadow" aria-label="Skip to main content">
        Skip to content
      </a>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-gray-50/80 via-cream/90 to-gray-100/80 dark:bg-none backdrop-blur border-b border-primary/10 dark:bg-gray-900/80 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
          <a href="#home" className="inline-flex items-center gap-2 font-semibold text-lg" aria-label="Mrs Bernice Mensah">
            Mrs Bernice Mensah
          </a>
          <div className="flex items-center gap-2">
            <div id="primary-menu" className="hidden md:flex space-x-4 text-sm">
              <a href="#gallery" className={linkClass('gallery')} aria-current={ariaCurrent('gallery')}>Gallery</a>
              <a href="#program" className={linkClass('program')} aria-current={ariaCurrent('program')}>Program</a>
              <a href="#song-131" className={linkClass('songs')} aria-current={ariaCurrent('songs')}>Songs</a>
              <a href="#reception" className={linkClass('reception')} aria-current={ariaCurrent('reception')}>Details</a>
              <a href="#rsvp" className={linkClass('rsvp')} aria-current={ariaCurrent('rsvp')}>Contact</a>
              <a href="https://maps.app.goo.gl/BQWS1XYdyq2ui3oB8" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-3 py-1.5 shadow hover:bg-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream" aria-label="Open directions in Google Maps (opens in new tab)">
                <span aria-hidden="true">📍</span>
                <span>Directions</span>
              </a>
            </div>
            <button
              type="button"
              aria-pressed={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="rounded-md px-3 py-2 border border-primary/10 hover:bg-black/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:hover:bg-white/10"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <div className="md:hidden">
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden absolute left-0 right-0 top-full bg-cream/95 border-b border-primary/10 dark:bg-gray-900/90 dark:border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2 text-sm">
              <a href="#gallery" onClick={() => setMenuOpen(false)} className={linkClass('gallery')} aria-current={ariaCurrent('gallery')}>Gallery</a>
              <a href="#program" onClick={() => setMenuOpen(false)} className={linkClass('program')} aria-current={ariaCurrent('program')}>Program</a>
              <a href="#song-131" onClick={() => setMenuOpen(false)} className={linkClass('songs')} aria-current={ariaCurrent('songs')}>Songs</a>
              <a href="#reception" onClick={() => setMenuOpen(false)} className={linkClass('reception')} aria-current={ariaCurrent('reception')}>Details</a>
              <a href="#rsvp" onClick={() => setMenuOpen(false)} className={linkClass('rsvp')} aria-current={ariaCurrent('rsvp')}>Contact</a>
              <a href="https://maps.app.goo.gl/BQWS1XYdyq2ui3oB8" target="_blank" rel="noreferrer noopener" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-3 py-1.5 shadow hover:bg-primary transition">
                <span aria-hidden="true">📍</span>
                <span>Directions</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header id="home" className="relative isolate overflow-hidden bg-gradient-to-r from-gray-100 via-cream to-gray-200 dark:bg-none">
        {/* Decorative background accents */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl"></div>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src={coupleImg}
                alt="Mrs Bernice Mensah"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="reveal w-full h-96 md:h-[32rem] object-cover object-top rounded-md border border-primary/10 ring-4 ring-accent/60 ring-offset-2 ring-offset-cream dark:ring-offset-gray-900 drop-shadow-[0_0_28px_rgba(180,120,104,0.55)]"
              />
            </div>
            <div className="reveal text-center md:text-left">
              <p className="text-accent uppercase tracking-widest text-sm mb-3">In Loving Memory</p>
              <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-tight mb-4">Mrs Bernice Mensah</h1>
              <p className="text-lg md:text-xl text-primary/80 dark:text-white/90">Age: 54 years</p>
              <p className="text-base md:text-lg text-primary/70 dark:text-white/80 mb-2">Funeral Service</p>
              <p className="text-base md:text-lg text-primary/70 dark:text-white/80">Center For National Culture, Cape Coast</p>
              <div className="mt-4">
                <a
                href="https://maps.app.goo.gl/BQWS1XYdyq2ui3oB8"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-3 text-base shadow hover:bg-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                aria-label="Get directions to Center For National Culture (opens in new tab)"
                >
                  <span aria-hidden="true">📍</span>
                  <span>Get Directions</span>
                </a>
                <a
                  href="https://zoom.us/j/MEETING_ID"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ml-3 inline-flex items-center gap-2 rounded-md bg-[#2D8CFF] text-white px-5 py-3 text-base shadow hover:bg-[#1E6FE3] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D8CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  aria-label="Join the Zoom meeting (opens in new tab)"
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v.764l2.553-1.916A1 1 0 0 1 21 7.686v8.628a1 1 0 0 1-1.447.838L16 15.236V16a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Z" fill="currentColor"/>
                  </svg>
                  <span>Join on Zoom</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>


      <main id="mainContent" aria-hidden={lightbox.open} tabIndex={-1}>
        {/* Gallery */}
        <section id="gallery" aria-labelledby="gallery-heading" className="max-w-6xl mx-auto px-4 py-14 md:py-20 scroll-mt-24">
          <h2 id="gallery-heading" className="reveal font-display text-3xl md:text-4xl mb-6">Photo Gallery</h2>
          <p className="reveal text-primary/70 dark:text-white/80 mb-8">Cherished memories of Mrs Bernice Mensah.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {media.map((item, i) => (
              <button
                key={item.src}
                className="reveal group relative aspect-[4/3] overflow-hidden rounded-lg border border-primary/10 bg-white/20 backdrop-blur-sm shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream transform hover:-translate-y-0.5 dark:bg-white/5 dark:border-white/10 dark:focus-visible:ring-offset-gray-900"
                onClick={() => onOpenLightboxAt(i)}
                aria-label={`Open ${item.kind === 'video' ? 'video' : 'photo'}: ${item.alt}`}
              >
                {item.kind === 'video' ? (
                  <>
                    <video src={item.src} muted playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-5xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">▶</span>
                    </div>
                  </>
                ) : (
                  <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Program */}
        <section id="program" aria-labelledby="program-heading" className="bg-gradient-to-r from-gray-50/60 via-cream/70 to-gray-100/60 dark:bg-gray-900/20 py-14 md:py-20 scroll-mt-24">
          <div className="max-w-6xl mx-auto px-4">
            <h2 id="program-heading" className="reveal font-display text-3xl md:text-4xl mb-6">Funeral Service Program</h2>
            <ul className="reveal grid md:grid-cols-3 gap-6">
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">🎶 </span>Musical Interlude</h3>
                <p className="text-primary/70 dark:text-white/70">7:40 AM</p>
                <p className="mt-2 text-sm text-primary/70 dark:text-white/70">Solemn music to prepare hearts.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">In Remembrance 🕯️</span></div>
              </li>
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">🙏 </span>Arrival of Guests</h3>
                <p className="text-primary/70 dark:text-white/70">7:50 AM</p>
                <p className="mt-2 text-sm text-primary/70 dark:text-white/70">Guests arrive and are seated respectfully.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">Please be seated</span></div>
              </li>
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">⚰️ </span>Viewing of Body</h3>
                <p className="text-primary/70">8:00 AM</p>
                <p className="mt-2 text-sm text-primary/70">Family and friends pay final respects.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">Final Goodbye</span></div>
              </li>
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">🎵 </span>Song 147 & Opening Prayer</h3>
                <p className="text-primary/70">10:00 AM</p>
                <p className="mt-2 text-sm text-primary/70">Opening song and prayer to begin the service.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">Service Begins 🙏</span></div>
              </li>
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">📖 </span>Funeral Discourse</h3>
                <p className="text-primary/70">10:05 AM</p>
                <p className="mt-2 text-sm text-primary/70">Biblical talk on the resurrection hope.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">Hope & Comfort</span></div>
              </li>
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">📢 </span>Announcements</h3>
                <p className="text-primary/70">10:35 AM</p>
                <p className="mt-2 text-sm text-primary/70">Important notices and family acknowledgments.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">Acknowledgments</span></div>
              </li>
              <li className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/20 transform hover:-translate-y-0.5 dark:bg-gray-800 dark:border-white/10">
                <h3 className="font-semibold"><span aria-hidden="true">🎶 </span>Song 151 & Closing Prayer</h3>
                <p className="text-primary/70">10:40 AM</p>
                <p className="mt-2 text-sm text-primary/70">Closing song and prayer to conclude the service.</p>
                <div className="mt-3"><span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-primary/80 border border-primary/10 dark:from-gray-700 dark:to-gray-600 dark:text-white/90">Farewell 🕊️</span></div>
              </li>
            </ul>
          </div>
        </section>


        {/* Song 147 */}
        <section id="song-131" aria-labelledby="song131-heading" className="max-w-6xl mx-auto px-4 py-14 md:py-20 text-center scroll-mt-24">
          <h2 id="song131-heading" className="reveal font-display text-3xl md:text-4xl mb-2">Song 147 — "Life Everlasting Is Promised"</h2>
          <p className="reveal text-primary/70 mb-6">(Psalm 37:29)</p>
          <div className="space-y-6 leading-relaxed text-primary/90 dark:text-white/90">
            <div>
              <h3 className="font-semibold mb-2">1. Verse</h3>
              <p>Life everlasting is promised.</p>
              <p>Our earthly home will endure.</p>
              <p>'Meek ones will thrive,' said the psalmist.</p>
              <p>This grand future is sure.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chorus</h3>
              <p>We can live forever.</p>
              <p>It's worth all endeavor.</p>
              <p>God's promise is faithful.</p>
              <p>His Word will come true.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Verse</h3>
              <p>Paradise brought to perfection;</p>
              <p>All of God's children set free.</p>
              <p>Under Jehovah's direction,</p>
              <p>Peace on earth we will see.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chorus</h3>
              <p>We can live forever.</p>
              <p>It's worth all endeavor.</p>
              <p>God's promise is faithful.</p>
              <p>His Word will come true.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Verse</h3>
              <p>Soon in the grand resurrection,</p>
              <p>Sorrow will all disappear.</p>
              <p>Showering tender affection,</p>
              <p>God will dry ev'ry tear.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chorus</h3>
              <p>We can live forever.</p>
              <p>It's worth all endeavor.</p>
              <p>God's promise is faithful.</p>
              <p>His Word will come true.</p>
            </div>
          </div>
        </section>

        {/* Song 151 */}
        <section id="song-132" aria-labelledby="song132-heading" className="max-w-6xl mx-auto px-4 py-14 md:py-20 text-center scroll-mt-24">
          <h2 id="song132-heading" className="reveal font-display text-3xl md:text-4xl mb-2">Song 151 — "He Will Call"</h2>
          <p className="reveal text-primary/70 mb-6">(Job 14:13-15)</p>
          <div className="space-y-6 leading-relaxed text-primary/90 dark:text-white/90">
            <div>
              <h3 className="font-semibold mb-2">1. Verse</h3>
              <p>Life, like a mist, appears for just a day,</p>
              <p>Then disappears tomorrow.</p>
              <p>All that we are can quickly fade away,</p>
              <p>Replaced with tears and sorrow.</p>
              <p>If a man should die, can he live again?</p>
              <p>Hear the promise God has made:</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chorus</h3>
              <p>He will call; The dead will answer.</p>
              <p>They will live at his command.</p>
              <p>For he will have a longing</p>
              <p>For the work of his own hand.</p>
              <p>So have faith, and do not wonder,</p>
              <p>For our God can make us stand.</p>
              <p>And we will live forever,</p>
              <p>As the work of his own hand.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Verse</h3>
              <p>Friends of our God, though they may pass away,</p>
              <p>Will never be forsaken.</p>
              <p>All those asleep who in God's mem'ry stay,</p>
              <p>From death he will awaken.</p>
              <p>Then we'll come to see all that life can be:</p>
              <p>Paradise eternally.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chorus</h3>
              <p>He will call; The dead will answer.</p>
              <p>They will live at his command.</p>
              <p>For he will have a longing</p>
              <p>For the work of his own hand.</p>
              <p>So have faith, and do not wonder,</p>
              <p>For our God can make us stand.</p>
              <p>And we will live forever,</p>
              <p>As the work of his own hand.</p>
            </div>
          </div>
        </section>

        {/* Funeral Details */}
        <section id="reception" aria-labelledby="reception-heading" className="max-w-6xl mx-auto px-4 py-14 md:py-20 scroll-mt-24">
          <h2 id="reception-heading" className="reveal font-display text-3xl md:text-4xl mb-6">Funeral Service Details</h2>
          <div className="reveal grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-primary/80 font-semibold text-xl">Center For National Culture</p>
              <p className="text-primary/60">Cape Coast, Ghana</p>
                <a
                    className="inline-block mt-4 text-accent underline underline-offset-4 hover:text-primary"
                    href="https://maps.app.goo.gl/BQWS1XYdyq2ui3oB8"
                    target="_blank" rel="noreferrer"
                >
                    View on Google Maps
                </a>
                {/* Details about the deceased */}
                <div className="mt-10">
                    <h3 className="font-semibold text-2xl mb-3">In Loving Memory</h3>
                    <div className="space-y-2 text-primary/80">
                        <p><strong>Name:</strong> Mrs Bernice Mensah</p>
                        <p><strong>Age:</strong> 54 years</p>
                        <p><strong>Service Location:</strong> Center For National Culture, Cape Coast</p>
                    </div>
                </div>
            </div>
              <div className="rounded-xl overflow-hidden border border-primary/10 dark:border-white/10">
                  <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3973.951640662141!2d-1.2816808!3d5.1114972!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfddfec56b217157%3A0x4bffaceef969129a!2sCentre%20for%20National%20Culture!5e0!3m2!1sen!2sgh!4v1766164514592!5m2!1sen!2sgh"
                      width="600" height="450" loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
          </div>


        </section>

          {/* Contact */}
          {/*<section id="rsvp" aria-labelledby="rsvp-heading" className="max-w-6xl mx-auto px-4 py-14 md:py-20 scroll-mt-24">*/}
          {/*  <h2 id="rsvp-heading" className="reveal font-display text-3xl md:text-4xl mb-6">Contact Information</h2>*/}
          {/*  <p className="reveal text-primary/70 mb-8">For inquiries, please reach out to:</p>*/}
        {/*  <div className="reveal grid sm:grid-cols-2 gap-6">*/}
        {/*    <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-white/10">*/}
        {/*      <h3 className="font-semibold flex items-center gap-2"><span aria-hidden="true">👤</span>Timothy</h3>*/}
        {/*      <a*/}
        {/*        href="tel:0556661300"*/}
        {/*        className="mt-2 inline-flex items-center gap-2 text-accent hover:text-primary underline underline-offset-4"*/}
        {/*        aria-label="Call Timothy at 055 666 1300"*/}
        {/*      >*/}
        {/*        <span aria-hidden="true">📞</span>*/}
        {/*        055 666 1300*/}
        {/*      </a>*/}
        {/*    </div>*/}
        {/*    <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-white/10">*/}
        {/*      <h3 className="font-semibold flex items-center gap-2"><span aria-hidden="true">👤</span>Josaphat</h3>*/}
        {/*      <a*/}
        {/*        href="tel:0530672467"*/}
        {/*        className="mt-2 inline-flex items-center gap-2 text-accent hover:text-primary underline underline-offset-4"*/}
        {/*        aria-label="Call Josaphat at 053 067 2467"*/}
        {/*      >*/}
        {/*        <span aria-hidden="true">📞</span>*/}
        {/*        053 067 2467*/}
        {/*      </a>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</section>*/}

      </main>

      {/* Scroll to Top */}
      {showScrollTop && !lightbox.open && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="fixed bottom-6 right-6 z-40 rounded-full bg-accent text-white shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:focus-visible:ring-offset-gray-900 transition transform hover:-translate-y-0.5 active:translate-y-0 w-12 h-12 flex items-center justify-center border border-primary/10 dark:border-white/10"
        >
          <span aria-hidden="true" className="text-xl leading-none">↑</span>
        </button>
      )}

        {/* Lightbox Modal */}
        {lightbox.open && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog"
                 aria-modal="true" aria-label="Media lightbox" onClick={onCloseLightbox}>
                <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                    <button
                        ref={closeBtnRef}
              onClick={onCloseLightbox}
              className="absolute -top-3 -right-3 bg-white text-gray-900 rounded-full w-10 h-10 shadow focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close"
            >
              ✕
            </button>

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/90 text-gray-900 rounded-full w-10 h-10 shadow focus:outline-none focus:ring-2 focus:ring-accent border border-primary/10 hover:bg-white"
                  aria-label="Previous"
                  title="Previous (Arrow Left)"
                  onClick={(e) => {
                    e.stopPropagation();
                    const prev = (lightbox.index - 1 + media.length) % media.length;
                    const item = media[prev];
                    setLightbox({ open: true, kind: item.kind, src: item.src, alt: item.alt, index: prev });
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white/90 text-gray-900 rounded-full w-10 h-10 shadow focus:outline-none focus:ring-2 focus:ring-accent border border-primary/10 hover:bg-white"
                  aria-label="Next"
                  title="Next (Arrow Right)"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = (lightbox.index + 1 + media.length) % media.length;
                    const item = media[next];
                    setLightbox({ open: true, kind: item.kind, src: item.src, alt: item.alt, index: next });
                  }}
                >
                  ›
                </button>
              </>
            )}

            {lightbox.kind === 'video' ? (
              <video src={lightbox.src} controls autoPlay playsInline className="w-full rounded-lg" />
            ) : (
              <img src={lightbox.src} alt={lightbox.alt} className="w-full rounded-lg" />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-primary/10 dark:border-white/10 py-8 text-center text-sm text-primary/70" aria-hidden={lightbox.open}>
        <p>In Loving Memory of Mrs Bernice Mensah • 2025</p>
      </footer>
    </div>
  );
}

export default App;
