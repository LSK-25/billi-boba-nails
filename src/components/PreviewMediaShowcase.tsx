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
    if (carouselItems.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselItems.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [carouselItems.length]);

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
        <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-[#f8f2ff] md:min-h-[650px]">
          {activeItem.mediaKind === 'video' ? (
            <video
              ref={videoRef}
              key={activeItem.id}
              src={activeItem.mediaUrl}
              className="absolute inset-0 h-full w-full object-cover"
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
              className="absolute inset-0 h-full w-full object-cover transition duration-700"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#24152d]/82 via-[#24152d]/18 to-transparent" />

          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl">
              {sectionLabel(activeItem.section)}
            </span>

            <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
              {activeIndex + 1} / {carouselItems.length}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 rounded-[1.7rem] border border-white/45 bg-white/22 p-5 text-white backdrop-blur-xl md:p-6">
            <h3 className="font-display text-4xl font-black tracking-[-0.07em] md:text-5xl">
              {activeItem.title}
            </h3>

            {activeItem.caption && (
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/78 md:text-base">
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
                <button type="button" onClick={replayVideo} className="rounded-full border border-white/45 bg-white/18 px-5 py-2 text-sm font-black text-white backdrop-blur-xl">
                  Replay video
                </button>
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