'use client';

import { useEffect, useState } from 'react';

export default function SplashIntro() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 2300);

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2950);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!showSplash) {
    return null;
  }

  return (
    <div
      className={`splash-intro ${isLeaving ? 'splash-intro--leaving' : ''}`}
      aria-label="BILLi&BoBA NAILS loading"
    >
      <div className="splash-glow splash-glow-one" />
      <div className="splash-glow splash-glow-two" />

      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-logo">B&amp;B</div>
        </div>

        <div className="splash-brand-wrap">
          <p className="splash-brand">BILLi&amp;BoBA</p>
          <p className="splash-nails">NAILS</p>
        </div>

        <div className="splash-loader">
          <span />
        </div>
      </div>

      <style jsx>{`
        .splash-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          overflow: hidden;
          pointer-events: none;
          background:
            radial-gradient(circle at 50% 34%, rgba(244, 130, 199, 0.28), transparent 18rem),
            radial-gradient(circle at 50% 68%, rgba(156, 104, 255, 0.2), transparent 20rem),
            linear-gradient(135deg, #120813 0%, #09050d 46%, #150818 100%);
          opacity: 1;
          transform: scale(1);
          transition:
            opacity 650ms ease,
            transform 650ms ease,
            filter 650ms ease;
        }

        .splash-intro--leaving {
          opacity: 0;
          transform: scale(1.035);
          filter: blur(10px);
        }

        .splash-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(45px);
          opacity: 0.55;
          animation: floatGlow 2.4s ease-in-out infinite alternate;
        }

        .splash-glow-one {
          width: 18rem;
          height: 18rem;
          background: rgba(255, 105, 180, 0.34);
          top: 18%;
          left: 18%;
        }

        .splash-glow-two {
          width: 20rem;
          height: 20rem;
          background: rgba(167, 115, 255, 0.28);
          right: 15%;
          bottom: 16%;
          animation-delay: 450ms;
        }

        .splash-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }

        .splash-logo-wrap {
          position: relative;
          display: grid;
          place-items: center;
          width: 8.5rem;
          height: 8.5rem;
          border-radius: 2.4rem;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05)),
            linear-gradient(135deg, rgba(255, 128, 198, 0.4), rgba(156, 104, 255, 0.28));
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.06),
            0 0 42px rgba(255, 108, 188, 0.42),
            0 0 95px rgba(164, 112, 255, 0.28);
          animation:
            logoReveal 1.1s cubic-bezier(0.18, 0.9, 0.22, 1) both,
            logoPulse 1.35s ease-in-out 950ms infinite alternate;
        }

        .splash-logo-wrap::before {
          content: '';
          position: absolute;
          inset: -1.1rem;
          border-radius: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          animation: ringPop 1.25s ease-out 300ms both;
        }

        .splash-logo {
          font-size: 2.35rem;
          font-weight: 950;
          letter-spacing: -0.08em;
          color: white;
          text-shadow:
            0 0 18px rgba(255, 255, 255, 0.55),
            0 0 35px rgba(255, 109, 190, 0.5);
        }

        .splash-brand-wrap {
          margin-top: 1.7rem;
          animation: brandReveal 800ms ease 900ms both;
        }

        .splash-brand {
          margin: 0;
          font-size: clamp(2rem, 6vw, 4.4rem);
          line-height: 0.9;
          font-weight: 950;
          letter-spacing: -0.085em;
          color: white;
          text-shadow: 0 0 30px rgba(255, 125, 199, 0.34);
        }

        .splash-nails {
          margin: 0.65rem 0 0;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.58em;
          color: rgba(255, 220, 243, 0.64);
        }

        .splash-loader {
          margin-top: 1.7rem;
          width: min(16rem, 58vw);
          height: 2px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.11);
          animation: loaderReveal 450ms ease 1.15s both;
        }

        .splash-loader span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, #ff83c8, #b998ff, transparent);
          transform: translateX(-100%);
          animation: loaderSweep 1.05s ease 1.2s both;
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.72) rotate(-4deg);
            filter: blur(14px);
          }
          58% {
            opacity: 1;
            transform: scale(1.08) rotate(1deg);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
            filter: blur(0);
          }
        }

        @keyframes logoPulse {
          from {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.06),
              0 0 38px rgba(255, 108, 188, 0.36),
              0 0 88px rgba(164, 112, 255, 0.24);
          }
          to {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.09),
              0 0 58px rgba(255, 108, 188, 0.58),
              0 0 122px rgba(164, 112, 255, 0.36);
          }
        }

        @keyframes ringPop {
          from {
            opacity: 0;
            transform: scale(0.72);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes brandReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes loaderReveal {
          from {
            opacity: 0;
            transform: scaleX(0.35);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes loaderSweep {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @keyframes floatGlow {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(1.5rem, -1rem, 0) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-intro,
          .splash-logo-wrap,
          .splash-logo-wrap::before,
          .splash-brand-wrap,
          .splash-loader,
          .splash-loader span,
          .splash-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}