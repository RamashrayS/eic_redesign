"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const idleVideoRef = useRef<HTMLVideoElement>(null);

  // Parallax & Tilt Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const fgCardRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const aboutCodyRef = useRef<HTMLDivElement>(null);

  // Typing effect state for About Section
  const [typedText, setTypedText] = useState("");
  const [startTyping, setStartTyping] = useState(false);

  // Mouse coordinate targets
  const targetX = useRef(0);
  const targetY = useRef(0);

  // Current interpolated values
  const currentX = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    // Hide loading after a short delay for preloading
    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    // Intersection Observer to start typing when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (!startTyping) return;
    const textToType = "Most people study the future. We want to build it. The Entrepreneurship & Innovation Cell brings together curious minds, ambitious builders, researchers, and entrepreneurs who aren't satisfied with ideas staying on a whiteboard or inside a laboratory. We create opportunities to learn from founders, engage with innovators, explore entrepreneurship, and transform scientific thinking into real-world impact. If you're excited by big problems, bold ideas, and the possibility of creating something meaningful, you're already one of us.";
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      setTypedText(textToType.substring(0, currentIndex + 1));
      currentIndex++;
      if (currentIndex >= textToType.length) {
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [startTyping]);

  useEffect(() => {
    const idle = idleVideoRef.current;
    if (!idle) return;

    idle.load();
    idle.play().catch((err) => {
      console.warn("Autoplay was prevented. Retrying on first user click...", err);
      const startAutoplay = () => {
        idle.play().catch(e => console.log(e));
        document.removeEventListener("click", startAutoplay);
      };
      document.addEventListener("click", startAutoplay);
    });
  }, []);

  useEffect(() => {
    // Parallax mouse tracker
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Map mouse coordinates to range [-1, 1] relative to center
      targetX.current = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      targetY.current = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop (Lerp)
    let animationFrameId: number;
    const updateParallax = () => {
      const lerpFactor = 0.08; // Smoothness factor (smaller = smoother/slower)

      // Interpolate current values towards target
      currentX.current += (targetX.current - currentX.current) * lerpFactor;
      currentY.current += (targetY.current - currentY.current) * lerpFactor;

      const x = currentX.current;
      const y = currentY.current;

      const isMobile = window.innerWidth < 768;

      // 1. Background Text: Shifts opposite to cursor
      // Left mouse movement (x < 0) shifts text right (positive X)
      const bgMaxShift = isMobile ? 12 : 25; // px
      const bgShiftX = -x * bgMaxShift;
      const bgShiftY = -y * bgMaxShift;
      const bgZ = isMobile ? -100 : -250;

      if (bgTextRef.current) {
        bgTextRef.current.style.transform = `translate3d(${bgShiftX}px, ${bgShiftY}px, ${bgZ}px)`;
      }

      // 2. Mascot Tilt: Tilts towards the cursor
      // Rotation Y: Positive x rotates right side away, facing right (towards cursor)
      // Rotation X: Negative y rotates top away, facing up (towards cursor)
      const maxMascotTilt = isMobile ? 8 : 15; // degrees
      const mascotRotX = -y * maxMascotTilt;
      const mascotRotY = x * maxMascotTilt;
      const mascotZ = isMobile ? 10 : 50;

      if (mascotRef.current) {
        mascotRef.current.style.transform = `translate3d(0, 0, ${mascotZ}px) rotateX(${mascotRotX}deg) rotateY(${mascotRotY}deg)`;
      }

      // 3. Foreground Ivory Card: Shifts opposite to cursor but FASTER than background
      const fgMaxShift = isMobile ? 25 : 65; // px
      const fgShiftX = -x * fgMaxShift;
      const fgShiftY = -y * fgMaxShift;
      const fgZ = isMobile ? 30 : 180;

      // Add a slight opposite tilt to the card to give it a physical cardboard sheen
      const fgRotX = y * 5;
      const fgRotY = -x * 5;

      if (fgCardRef.current) {
        fgCardRef.current.style.transform = `translate3d(${fgShiftX}px, ${fgShiftY}px, ${fgZ}px) rotateX(${fgRotX}deg) rotateY(${fgRotY}deg)`;
      }

      // 4. Subtle Cody mouse reactive shifting
      const codyMaxShift = isMobile ? 2 : 5; // tiny movement
      const codyShiftX = x * codyMaxShift;
      const codyShiftY = y * codyMaxShift;
      const codyMaxTilt = isMobile ? 1 : 2; // tiny tilt
      const codyRotX = -y * codyMaxTilt;
      const codyRotY = x * codyMaxTilt;

      if (aboutCodyRef.current) {
        aboutCodyRef.current.style.transform = `translate3d(${codyShiftX}px, ${codyShiftY}px, 0) rotateX(${codyRotX}deg) rotateY(${codyRotY}deg)`;
      }

      animationFrameId = requestAnimationFrame(updateParallax);
    };

    updateParallax();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#620614] overflow-x-hidden select-none">

      {/* 1. Fullscreen Loader */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#620614] transition-opacity duration-700 ease-in-out ${loading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#D1E7E0] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-syne font-extrabold text-[#F3EED9] tracking-widest text-xl animate-pulse">EIC</span>
        </div>
      </div>

      {/* 2. Spotlight Background Layer */}
      <div className="absolute inset-0 spotlight-bg pointer-events-none z-0" />

      {/* 3. Header Navigation (Premium Ivory Overlay) */}
      <header className="relative w-full px-6 py-6 md:px-12 flex justify-between items-center z-40">
        <a href="/" className="group flex items-center gap-3 hover:opacity-100 transition-opacity duration-300">

          <div className="flex flex-col">
            <span className="font-syne font-extrabold text-2xl tracking-tighter text-[#F3EED9] leading-none logo-text-hover">EIC</span>
            <span className="font-outfit font-semibold text-[9px] tracking-widest text-[#F3EED9] opacity-80 uppercase transition-opacity duration-300 group-hover:opacity-100">IISER PUNE</span>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-[#F3EED9] font-outfit text-sm font-medium">
          <a href="#about" className="nav-link-shine">About</a>
          <a href="#events" className="nav-link-shine">Events</a>
          <a href="#archive" className="nav-link-shine">Archive</a>
          <a href="#team" className="nav-link-shine">Team</a>
        </nav>
        <div className="flex items-center gap-3">

          {/* LinkedIn Link */}
          <a
            href="https://www.linkedin.com/company/eiciiserp/?originalSubdomain=in"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[#D1E7E0]/20 bg-[#F3EED9]/5 hover:bg-[#F3EED9]/10 hover:border-[#D1E7E0]/50 text-[#F3EED9] hover:text-[#D1E7E0] transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>

          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/eic.iiserpune/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[#D1E7E0]/20 bg-[#F3EED9]/5 hover:bg-[#F3EED9]/10 hover:border-[#D1E7E0]/50 text-[#F3EED9] hover:text-[#D1E7E0] transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          {/* IISER Pune Link */}
          <a
            href="https://www.iiserpune.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            title="IISER Pune Website"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[#D1E7E0]/20 bg-[#F3EED9]/5 hover:bg-[#F3EED9]/10 hover:border-[#D1E7E0]/50 text-[#F3EED9] hover:text-[#D1E7E0] transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
            </svg>
          </a>

        </div>
      </header>

      {/* 4. 3D Spatial Canvas Wrapper */}
      <main
        ref={containerRef}
        className="perspective-container preserve-3d flex-1 w-full relative flex items-center justify-center px-4 md:px-16 py-12 md:py-24"
      >

        {/* Layer 1: Background Layer (Negative Z-depth) */}
        <div
          ref={bgTextRef}
          className="absolute pointer-events-none select-none z-10 transition-transform duration-100 ease-out preserve-3d"
          style={{ transform: "translateZ(-250px)" }}
        >
          <h1 className={`font-syne font-extrabold text-[9vw] md:text-[11vw] tracking-tighter text-[#F3EED9] leading-[0.85] text-center select-none ${!loading ? "animate-pop-up" : "opacity-0"
            }`}>
            WELCOME<br />
            <span className="opacity-95">TO </span>
            <span className="shining-text shining-container">EIC</span>
          </h1>
        </div>

        {/* Layer 2: Mascot Layer (Middle Z-depth) */}
        <div
          ref={mascotRef}
          className="relative w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[650px] md:h-[650px] z-20 flex items-center justify-center transition-transform duration-100 ease-out preserve-3d"
          style={{ transform: "translateZ(50px)" }}
        >
          {/* Subtle Ground/Floor stage with shadow */}
          <div
            className="absolute bottom-[-20px] sm:bottom-[-40px] left-1/2 -translate-x-1/2 w-[85%] h-[80px] sm:h-[120px] pointer-events-none preserve-3d"
            style={{ transform: "rotateX(75deg) translateZ(-5px)" }}
          >
            {/* Soft ground radial contact shadow */}
            <div
              className="absolute inset-0 blur-xl"
              style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)" }}
            ></div>

            {/* Stage Grid Rings */}
            <div className="absolute inset-0 border border-[#D1E7E0]/15 rounded-full shadow-[0_0_15px_rgba(209,231,224,0.12)] animate-[pulse_4s_infinite]"></div>
            <div className="absolute inset-[15%] border border-[#FB575C]/10 rounded-full shadow-[0_0_10px_rgba(251,87,92,0.08)]"></div>
            <div className="absolute inset-[35%] border border-[#F3EED9]/5 rounded-full"></div>
          </div>

          {/* Mascot Video Container (with contour-fitting drop shadow) */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ filter: "drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.7))" }}
          >

            {/* Idle Video (Loops) */}
            <video
              ref={idleVideoRef}
              id="mascot-idle"
              className="absolute w-full h-full object-contain"
              src="/assets/idle.webm"
              autoPlay
              muted
              loop
              playsInline
            />

          </div>
        </div>

      </main>

      {/* About Section */}
      <section
        id="about"
        ref={aboutRef}
        className="relative w-full px-6 py-24 md:py-32 z-30 border-t border-[#F3EED9]/10 bg-[#620614] overflow-hidden flex items-center justify-center"
      >
        {/* Subtle background glow for About section */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,87,92,0.12)_0%,rgba(0,0,0,0)_75%)] pointer-events-none" />

        {/* Centered Content Wrapper */}
        <div className="relative max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 z-20">

          {/* Left Column: Static Cody Image */}
          <div className="w-full md:w-auto flex justify-center items-center py-4">
            <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] lg:w-[560px] lg:h-[560px] overflow-visible">
              {/* Ground contact shadow stage (similar to hero) */}
              <div
                className="absolute bottom-[-8px] sm:bottom-[-12px] md:bottom-[-15px] lg:bottom-[-18px] left-1/2 -translate-x-1/2 w-[85%] h-[60px] sm:h-[90px] pointer-events-none"
                style={{ transform: "rotateX(75deg)" }}
              >
                <div
                  className="absolute inset-0 blur-xl"
                  style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 75%)" }}
                />
              </div>

              {/* Breathing Animation Wrapper */}
              <div className="w-full h-full animate-cody-breath origin-bottom">
                {/* Mouse-reactive Wrapper */}
                <div
                  ref={aboutCodyRef}
                  className="w-full h-full transition-transform duration-300 ease-out preserve-3d"
                >
                  <img
                    src="/assets/explaining.webp"
                    alt="Mr Cody Explaining"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.55)] select-none pointer-events-none scale-125 lg:scale-135 origin-bottom translate-y-6 sm:translate-y-8 md:translate-y-10 lg:translate-y-12"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Text & Headline */}
          <div className="w-full md:w-auto flex-1 max-w-xl flex flex-col items-start text-left py-4 md:pl-2 -translate-y-8 md:-translate-y-16 lg:-translate-y-25">
            <h2 className="font-syne font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#F3EED9] mb-6 leading-none">
              <span className="shining-text">About</span>
            </h2>

            <div className="font-outfit text-base sm:text-lg md:text-xl text-[#F3EED9]/90 leading-relaxed max-w-xl h-[380px] sm:h-[300px] md:h-[240px] lg:h-[230px] relative">
              <p className="inline">
                {typedText}
              </p>
              {/* Blinking typing cursor (remains at the end after typing finishes) */}
              {startTyping && (
                <span className="inline-block w-3 h-3 rounded-full ml-2 bg-[#D1E7E0] animate-pulse align-middle" />
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Sleek Footer Overlay */}
      <footer className="relative w-full px-6 py-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#F3EED9] opacity-80 font-outfit z-40 border-t border-[#F3EED9]/10">
        <div>
          © {new Date().getFullYear()} Entrepreneurship Innovation Cell, IISER Pune. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#D1E7E0] transition-colors duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-[#D1E7E0] transition-colors duration-200">Terms of Use</a>
          <a href="mailto:eic@iiserpune.ac.in" className="hover:text-[#D1E7E0] transition-colors duration-200">Contact Us</a>
        </div>
      </footer>

    </div>
  );
}
