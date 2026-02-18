'use client';

import { useEffect, useState } from 'react';
import { useRef } from 'react';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Hide on touch devices
    if ('ontouchstart' in window) return;

    const move = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      setIsVisible(true);
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        const { x, y } = mouseRef.current;
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
        }
        if (ringRef.current) {
          const offset = hoverRef.current ? 24 : 16;
          ringRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0)`;
        }
        rafRef.current = null;
      });
    };
    const leave = () => setIsVisible(false);

    const pointerSelector = 'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]';
    const onPointerOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(pointerSelector)) {
        hoverRef.current = true;
        setIsHovering(true);
      }
    };
    const onPointerOut = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
      if (!target?.closest(pointerSelector)) return;
      if (related?.closest(pointerSelector)) return;
      hoverRef.current = false;
      setIsHovering(false);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', leave);
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', leave);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-aurora-cyan pointer-events-none z-[9999] mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border border-aurora-cyan/40 pointer-events-none z-[9998] mix-blend-difference transition-[width,height] duration-75 ease-linear"
        style={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          willChange: 'transform,width,height',
        }}
      />
    </>
  );
}
