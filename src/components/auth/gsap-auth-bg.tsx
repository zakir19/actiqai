"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type GSAPAuthBackgroundProps = {
    className?: string;
};

export function GSAPAuthBackground(props: GSAPAuthBackgroundProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const blobRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            blobRefs.current.forEach((blob, index) => {
                const randomX = () => (Math.random() * 60 - 30);
                const randomY = () => (Math.random() * 60 - 30);
                const randomScale = () => 0.9 + Math.random() * 0.4;
                const randomRotate = () => Math.random() * 360;

                gsap.to(blob, {
                    xPercent: randomX(),
                    yPercent: randomY(),
                    scale: randomScale(),
                    rotate: randomRotate(),
                    filter: "blur(40px)",
                    duration: 12 + Math.random() * 8,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    stagger: index * 0.2,
                });
            });

            gsap.fromTo(
                containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1.2, ease: "power2.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className={
                "pointer-events-none absolute inset-0 overflow-hidden" +
                (props.className ? ` ${props.className}` : "")
            }
            aria-hidden
        >
            <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-purple-500/20 blur-3xl" ref={(el) => { if (el) blobRefs.current[0] = el; }} />
            <div className="absolute -bottom-16 -right-16 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-400/30 via-violet-500/25 to-sky-400/20 blur-3xl" ref={(el) => { if (el) blobRefs.current[1] = el; }} />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-emerald-400/30 via-teal-400/25 to-cyan-400/20 blur-3xl" ref={(el) => { if (el) blobRefs.current[2] = el; }} />
            <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.08)_100%)]" />
        </div>
    );
}

export default GSAPAuthBackground;


