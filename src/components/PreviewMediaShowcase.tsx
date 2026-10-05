'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getActivePreviewMedia, type PreviewMediaItem } from '@/lib/preview-media';

function sectionLabel(section: PreviewMediaItem['section']) {
  if (section === 'shimmer_preview') return 'Shimmer Preview';
  if (section === 'new_coming') return 'New Coming';
  return 'Best Seller';
}

export default function PreviewMediaShowcase() {
  const [items, setItems] = useState<PreviewMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerItem, setViewerItem] = useState<PreviewMediaItem | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true;

    getActivePreviewMedia().then((nextItems) => {
      if (!active) return;
      setItems(nextItems);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const carouselItems = useMemo(() => {
    const shimmer = items.filter((item) => item.section === 'shimmer_preview');
    const newComing = items.filter((item) => item.section === 'new_coming');
    const bestSeller = items.filter((item) => item.section === 'best_seller');

    return [...shimmer, ...newComing, ...bestSeller];
  }, [items]);

  const activeItem = carouselItems[activeIndex];

  useEffect(() => {
    if (viewerItem || carouselItems.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselItems.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [carouselItems.length, viewerItem]);

  useEffect(() => {
    if (!viewerItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewerItem(null);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewerItem]);

  useEffect(() => {
    if (!activeItem || activeItem.mediaKind !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  }, [activeItem]);

  function goPrevious() {
    if (carouselItems.length === 0) return;
    setActiveIndex((current) => (current - 1 + carouselItems.length) % carouselItems.length);
  }

  function goNext() {
    if (carouselItems.length === 0) return;
    setActiveIndex((current) => (current + 1) % carouselItems.length);
  }

  function replayVideo() {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  }

  if (loading) {
    return (
      <section className="page-shell mt-24">
        <div className="liquid-glass rounded-[2.4rem] p-6 md:p-8">
          <span className="pill">Shimmer preview</span>
          <p className="mt-5 font-black text-[#34263c]">Loading previews...</p>
        </div>
      </section>
    );
  }

  if (!activeItem) {
    return (
      <section className="page-shell mt-24">
        <div className="liquid-glass rounded-[2.4rem] p-6 md:p-8">
          <span className="pill">Shimmer preview</span>
          <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em] md:text-6xl">
            Preview new finishes before ordering.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#756778]">
            Add shimmer videos, new coming designs and best-selling photos from Admin → Preview media.
          </p>
          <Link href="/shop" className="btn-primary mt-7 w-fit">
            Explore collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell mt-24">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="pill">Shimmer preview</span>
          <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.06em] md:text-6xl">
            New comings, best sellers and shimmer looks.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
            Best sellers, new comings and shimmer previews selected by the BILLi&BoBA studio.
          </p>
        </div>

        <Link href="/shop" className="btn-secondary w-fit">
          Shop these looks
        </Link>
      </div>

      <div className="liquid-glass overflow-hidden rounded-[2.5rem] p-4 md:p-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#f8f2ff] md:min-h-[650px]">
          <div
            className={`relative aspect-[4/5] w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto ${activeItem.mediaKind === 'video' ? 'cursor-zoom-in' : ''}`}
            role={activeItem.mediaKind === 'video' ? 'button' : undefined}
            tabIndex={activeItem.mediaKind === 'video' ? 0 : undefined}
            aria-label={activeItem.mediaKind === 'video' ? `Watch ${activeItem.title} video` : undefined}
            onClick={() => {
              if (activeItem.mediaKind === 'video') setViewerItem(activeItem);
            }}
            onKeyDown={(event) => {
              if (activeItem.mediaKind === 'video' && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                setViewerItem(activeItem);
              }
            }}
          >
            {activeItem.mediaKind === 'video' ? (
              <video
                ref={videoRef}
                key={activeItem.id}
                src={activeItem.mediaUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={activeItem.id}
                src={activeItem.mediaUrl}
                alt={activeItem.title}
                className="h-full w-full object-cover transition duration-700"
              />
            )}

            {activeItem.mediaKind === 'video' && (
              <span className="absolute bottom-4 right-4 rounded-full border border-white/55 bg-black/35 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
                Tap to watch
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#24152d]/82 via-[#24152d]/18 to-transparent md:block" />

          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl">
              {sectionLabel(activeItem.section)}
            </span>

            <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
              {activeIndex + 1} / {carouselItems.length}
            </span>
          </div>

          <div className="relative z-10 m-4 rounded-[1.7rem] border border-white/45 bg-[#382c3f]/92 p-4 text-white backdrop-blur-xl md:absolute md:bottom-5 md:left-5 md:right-5 md:m-0 md:bg-white/22 md:p-6">
            <h3 className="font-display text-3xl font-black tracking-[-0.07em] md:text-5xl">
              {activeItem.title}
            </h3>

            {activeItem.caption && (
              <p className="mt-3 line-clamp-3 max-w-2xl text-sm font-semibold leading-6 text-white/78 md:line-clamp-none md:text-base">
                {activeItem.caption}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={goPrevious} className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#3b3040]">
                Previous
              </button>

              <button type="button" onClick={goNext} className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#3b3040]">
                Next
              </button>

              {activeItem.mediaKind === 'video' && (
                <>
                  <button
                    type="button"
                    onClick={() => setViewerItem(activeItem)}
                    className="rounded-full border border-white/45 bg-white px-5 py-2 text-sm font-black text-[#3b3040]"
                  >
                    Watch video
                  </button>
                  <button type="button" onClick={replayVideo} className="rounded-full border border-white/45 bg-white/18 px-5 py-2 text-sm font-black text-white backdrop-blur-xl">
                    Replay
                  </button>
                </>
              )}

              {activeItem.ctaHref && activeItem.ctaLabel && (
                <Link href={activeItem.ctaHref} className="rounded-full border border-white/45 bg-white/18 px-5 py-2 text-sm font-black text-white backdrop-blur-xl">
                  {activeItem.ctaLabel}
                </Link>
              )}
            </div>

            {carouselItems.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {carouselItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Open preview ${index + 1}`}
                    className={
                      index === activeIndex
                        ? 'h-2.5 w-9 rounded-full bg-white'
                        : 'h-2.5 w-2.5 rounded-full bg-white/45'
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}