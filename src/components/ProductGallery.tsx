'use client';

import { useState } from 'react';

type ProductGalleryProps = {
  name: string;
  code: string;
  gallery: string[];
  tone: string;
  accentTone: string;
};

export default function ProductGallery({
  name,
  code,
  gallery,
  tone,
  accentTone,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const selectedImage = gallery[selectedIndex] ?? gallery[0] ?? null;
  const hasMultipleImages = gallery.length > 1;

  function showPreviousImage() {
    if (!hasMultipleImages) return;
    setSelectedIndex((current) => (current === 0 ? gallery.length - 1 : current - 1));
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    setSelectedIndex((current) => (current === gallery.length - 1 ? 0 : current + 1));
  }

  return (
    <>
      <div className="liquid-glass rounded-[2.4rem] p-4">
        <div
          className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/70 md:min-h-[620px]"
          style={{ background: `linear-gradient(135deg, ${tone}, #ffffff 52%, ${accentTone})` }}
        >
          <div className="noise-overlay" />

          <div className="absolute left-4 top-4 z-20 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#6e5971] backdrop-blur md:left-6 md:top-6">
            {code}
          </div>

          {selectedImage ? (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label={`Zoom ${name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt={name}
                className="h-full w-full object-contain p-4 transition duration-500 hover:scale-[1.02] md:p-8"
              />
            </button>
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative h-80 w-80">
                <span className="absolute left-10 top-10 h-60 w-20 rounded-full bg-white/62 shadow-[inset_0_0_30px_rgba(255,255,255,.7),0_34px_70px_rgba(120,84,132,.16)]" />
                <span className="absolute left-32 top-0 h-80 w-24 rounded-full bg-white/72 shadow-[inset_0_0_34px_rgba(255,255,255,.72),0_34px_80px_rgba(120,84,132,.18)]" />
                <span className="absolute right-12 top-20 h-52 w-20 rounded-full bg-white/58 shadow-[inset_0_0_30px_rgba(255,255,255,.62),0_34px_70px_rgba(120,84,132,.14)]" />
                <span className="absolute inset-x-20 top-36 h-8 rounded-full bg-white/75 blur-md" />
              </div>
            </div>
          )}

          {selectedImage && (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#6e5971] backdrop-blur md:right-6 md:top-6"
            >
              Tap to zoom
            </button>
          )}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/75 text-xl font-black text-[#3a2a42] shadow-[0_14px_34px_rgba(72,50,82,.16)] backdrop-blur-xl transition hover:-translate-x-0.5 md:left-6"
                aria-label="Previous product photo"
              >
                {'<'}
              </button>

              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/75 text-xl font-black text-[#3a2a42] shadow-[0_14px_34px_rgba(72,50,82,.16)] backdrop-blur-xl transition hover:translate-x-0.5 md:right-6"
                aria-label="Next product photo"
              >
                {'>'}
              </button>

              <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-black text-[#6e5971] shadow-sm backdrop-blur">
                {selectedIndex + 1} / {gallery.length}
              </div>
            </>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto rounded-[1.6rem] border border-white/60 bg-white/35 p-3">
            {gallery.map((imageUrl, index) => (
              <button
                key={imageUrl}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`h-24 w-28 shrink-0 overflow-hidden rounded-[1.2rem] border bg-white/45 transition md:h-28 md:w-36 ${
                  selectedIndex === index
                    ? 'border-[#8c6fe8] ring-2 ring-[#d9c8ff]'
                    : 'border-white/70 hover:-translate-y-0.5 hover:bg-white/70'
                }`}
                aria-label={`View ${name} image ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${name} gallery ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomOpen && selectedImage && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#1e1624]/85 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute inset-0 cursor-zoom-out"
            aria-label="Close zoom"
          />

          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/25 bg-white shadow-[0_30px_90px_rgba(0,0,0,.35)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#4a314e1c] p-4">
              <div>
                <p className="font-black text-[#2c2131]">{name}</p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a728d]">{code}</p>
              </div>

              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>

            <div className="grid max-h-[78vh] place-items-center overflow-auto bg-[#f8f1f6] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt={name}
                className="max-h-[72vh] w-auto max-w-full rounded-[1rem] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}