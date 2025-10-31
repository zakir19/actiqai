"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function GSAPAuthBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    // Create floating particles
    const particles = Array.from({ length: 20 }, (_, i) => {
      const particle = document.createElement("div");
      particle.className = "absolute w-1 h-1 bg-blue-500/20 rounded-full";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      container.appendChild(particle);
      return particle;
    });

    // Animate particles
    particles.forEach((particle, i) => {
      gsap.set(particle, {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        scale: Math.random() * 0.5 + 0.5,
      });

      gsap.to(particle, {
        x: `+=${Math.random() * 400 - 200}`,
        y: `+=${Math.random() * 400 - 200}`,
        duration: Math.random() * 10 + 10,
        ease: "none",
        repeat: -1,
        yoyo: true,
        delay: i * 0.5,
      });
    });

    // Create gradient background animation
    gsap.to(container, {
      background: "linear-gradient(45deg, #1e293b, #334155, #475569)",
      duration: 8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
      }}
    />
  );
}
