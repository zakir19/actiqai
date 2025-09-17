"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

type Variant = "home" | "auth" | "default";

export default function SiteBackground() {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const layersRef = useRef<HTMLDivElement[]>([]);

    const variant: Variant = useMemo(() => {
        if (!pathname) return "default";
        if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/auth")) return "auth";
        if (pathname === "/" ) return "home";
        return "default";
    }, [pathname]);

    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            // basic fade-in
            gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" });

            // gentle movement for each blob layer
            layersRef.current.forEach((el, i) => {
                if (!el) return;
                const distance = 10 + i * 6;
                gsap.to(el, {
                    xPercent: gsap.utils.random(-distance, distance),
                    yPercent: gsap.utils.random(-distance, distance),
                    rotate: gsap.utils.random(-10, 10),
                    scale: gsap.utils.random(0.95, 1.1),
                    duration: 12 + i * 4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    stagger: i * 0.2,
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, [variant]);

    return (
        <div ref={containerRef} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {variant === "home" && (
                <div className="absolute inset-0">
                    <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-500/25 to-purple-500/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[0] = el)} />
                    <div className="absolute -bottom-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-fuchsia-400/30 via-violet-500/25 to-sky-400/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[1] = el)} />
                    <div className="absolute top-1/2 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-400/20 to-cyan-400/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[2] = el)} />
                    <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.06)_100%)]" />
                </div>
            )}
            {variant === "auth" && (
                <div className="absolute inset-0">
                    <div className="absolute -top-32 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-500/35 via-indigo-500/25 to-purple-500/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[0] = el)} />
                    <div className="absolute bottom-0 right-1/4 h-[22rem] w-[22rem] translate-x-1/2 rounded-full bg-gradient-to-tr from-teal-400/30 via-cyan-400/20 to-sky-400/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[1] = el)} />
                    <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.08)_100%)]" />
                </div>
            )}
            {variant === "default" && (
                <div className="absolute inset-0">
                    <div className="absolute -top-24 right-0 h-[18rem] w-[18rem] rounded-full bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-fuchsia-400/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[0] = el)} />
                    <div className="absolute bottom-0 left-0 h-[20rem] w-[20rem] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-400/20 to-cyan-400/20 blur-3xl"
                         ref={(el) => el && (layersRef.current[1] = el)} />
                    <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.05)_100%)]" />
                </div>
            )}
        </div>
    );
}


