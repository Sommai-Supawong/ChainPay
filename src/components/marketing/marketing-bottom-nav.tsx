"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ArrowUpRight, Ellipsis, ScanLine, X } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { marketingNav } from "@/components/navigation/marketing-nav";
import { ScanLink } from "@/components/payment/scan-link";
import { useTranslation } from "@/i18n";

const moreIndex = marketingNav.length;
const dragThreshold = 8;
const holdDelay = 190;

type Gesture = {
  pointerId: number;
  index: number;
  startX: number;
  startY: number;
  originX: number;
  dragging: boolean;
  cancelled: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

export function MarketingBottomNav({ signedIn }: { signedIn: boolean }) {
  const t = useTranslation();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string>("#");
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const gestureRef = useRef<Gesture | null>(null);
  const hoverRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const animationRef = useRef(0);
  const x = useMotionValue(0);
  const width = useMotionValue(0);
  const scale = useMotionValue(1);
  const stretch = useMotionValue(1);
  const activeIndex = open
    ? moreIndex
    : marketingNav.findIndex(({ href }) => href === active);
  const destination = signedIn ? "/dashboard" : "/login";

  useEffect(() => {
    const onScroll = () => {
      const current = [...marketingNav].reverse().find(
        ({ href }) =>
          href !== "#" &&
          (document.querySelector(href)?.getBoundingClientRect().top ??
            Infinity) <= window.innerHeight * 0.38,
      );
      setActive(current?.href ?? "#");
    };
    const onHistory = () => {
      if (window.location.href.endsWith("#")) {
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onHistory);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onHistory);
    };
  }, []);

  const position = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (!item) return null;
    return { x: item.offsetLeft + 1, width: item.offsetWidth - 2 };
  }, []);

  const snapTo = useCallback(
    async (index: number, pulse = false) => {
      const target = position(index);
      if (!target) return false;
      const sequence = ++animationRef.current;
      if (reduced) {
        x.set(target.x);
        width.set(target.width);
        scale.set(1);
        stretch.set(1);
        return true;
      }
      const animations = [
        animate(x, target.x, { type: "spring", stiffness: 390, damping: 35 }),
        animate(width, target.width, {
          type: "spring",
          stiffness: 390,
          damping: 35,
        }),
        animate(stretch, [stretch.get(), 1.08, 0.98, 1], { duration: 0.34 }),
      ];
      if (pulse)
        animations.push(
          animate(scale, [scale.get(), 1.06, 1], { duration: 0.24 }),
        );
      await Promise.all(animations);
      if (sequence !== animationRef.current) return false;
      scale.set(1);
      stretch.set(1);
      return true;
    },
    [position, reduced, scale, stretch, width, x],
  );

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const sync = () => {
      if (gestureRef.current) return;
      const target = position(activeIndex);
      if (!target) return;
      if (!ready) {
        x.set(target.x);
        width.set(target.width);
        setReady(true);
      } else {
        void snapTo(activeIndex);
      }
      setHighlight(null);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [activeIndex, position, ready, snapTo, width, x]);

  const clearGesture = () => {
    const gesture = gestureRef.current;
    if (gesture?.timer) clearTimeout(gesture.timer);
    gestureRef.current = null;
    hoverRef.current = null;
    setHighlight(null);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || !event.isPrimary) return;
    const item = (event.target as Element).closest<HTMLElement>("[data-nav-index]");
    if (!item || !innerRef.current?.contains(item)) return;
    const index = Number(item.dataset.navIndex);
    const current = position(activeIndex);
    if (!current) return;
    animationRef.current++;
    x.stop();
    width.stop();
    scale.stop();
    stretch.stop();
    const gesture: Gesture = {
      pointerId: event.pointerId,
      index,
      startX: event.clientX,
      startY: event.clientY,
      originX: current.x,
      dragging: false,
      cancelled: false,
      timer: null,
    };
    if (index === activeIndex) {
      gesture.timer = setTimeout(() => {
        if (gestureRef.current !== gesture) return;
        gesture.dragging = true;
        setHighlight(index);
        if (!reduced) animate(scale, 1.06, { duration: 0.14 });
      }, holdDelay);
    }
    gestureRef.current = gesture;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (Math.abs(dy) > dragThreshold && Math.abs(dy) > Math.abs(dx)) {
      gesture.cancelled = true;
      if (gesture.timer) clearTimeout(gesture.timer);
      return;
    }
    if (gesture.cancelled || gesture.index !== activeIndex || Math.abs(dx) <= dragThreshold) return;
    gesture.dragging = true;
    if (gesture.timer) clearTimeout(gesture.timer);
    const last = position(moreIndex);
    if (!last) return;
    const nextX = Math.max(1, Math.min(last.x, gesture.originX + dx * 0.82));
    x.set(nextX);
    if (!reduced) {
      scale.set(1.07);
      stretch.set(1.06);
    }
    const center = nextX + width.get() / 2;
    let nearest = activeIndex;
    let distance = Infinity;
    itemRefs.current.forEach((candidate, candidateIndex) => {
      if (!candidate) return;
      const delta = Math.abs(candidate.offsetLeft + candidate.offsetWidth / 2 - center);
      if (delta < distance) {
        distance = delta;
        nearest = candidateIndex;
      }
    });
    if (hoverRef.current !== nearest) {
      hoverRef.current = nearest;
      setHighlight(nearest);
    }
  };

  const activate = (index: number) => {
    if (index === moreIndex) {
      setOpen(true);
      return;
    }
    const href = marketingNav[index].href;
    setActive(href);
    window.location.assign(href);
  };

  const onPointerUp = async (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const target = gesture.dragging ? (hoverRef.current ?? activeIndex) : gesture.index;
    const cancelled = gesture.cancelled;
    clearGesture();
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    if (cancelled) {
      await snapTo(activeIndex);
      return;
    }
    setHighlight(target);
    const completed = await snapTo(target, true);
    if (completed) activate(target);
  };

  const onPointerCancel = () => {
    if (!gestureRef.current) return;
    clearGesture();
    void snapTo(activeIndex);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <nav className="mobile-bottom-nav marketing-bottom-nav" aria-label={t("Mobile navigation")}>
        <div
          ref={innerRef}
          className="mobile-bottom-nav-inner"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClickCapture={(event) => {
            if (!suppressClickRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
          }}
        >
          <motion.span
            className="mobile-nav-bubble"
            aria-hidden="true"
            style={{ x, width, scale, scaleX: stretch, opacity: ready ? 1 : 0 }}
          >
            <span className="mobile-nav-lens">
              <span className="mobile-nav-reflection" />
            </span>
          </motion.span>
          {marketingNav.map(({ href, shortLabel, icon: Icon }, index) => {
            const selected = highlight === index || (highlight === null && activeIndex === index);
            return (
              <a
                key={href}
                ref={(node) => { itemRefs.current[index] = node; }}
                data-nav-index={index}
                data-highlight={selected}
                href={href}
                className="mobile-nav-item"
                aria-current={active === href ? "location" : undefined}
                onClick={() => {
                  setActive(href);
                  void snapTo(index, true);
                }}
              >
                <Icon size={20} strokeWidth={selected ? 2.2 : 1.8} aria-hidden="true" />
                <span>{t(shortLabel)}</span>
              </a>
            );
          })}
          <Dialog.Trigger asChild>
            <button
              ref={(node) => { itemRefs.current[moreIndex] = node; }}
              data-nav-index={moreIndex}
              data-highlight={highlight === moreIndex || (highlight === null && open)}
              type="button"
              className="mobile-nav-item"
              aria-label={t("More")}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <Ellipsis size={21} aria-hidden="true" />
              <span>{t("More")}</span>
            </button>
          </Dialog.Trigger>
        </div>
      </nav>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-sheet-overlay" />
        <Dialog.Content className="mobile-more-sheet" aria-describedby={undefined}>
          <div className="mobile-sheet-handle" aria-hidden="true" />
          <div className="mobile-sheet-heading">
            <Dialog.Title>{t("More")}</Dialog.Title>
            <Dialog.Close className="mobile-sheet-close" aria-label={t("Close navigation")}>
              <X size={20} />
            </Dialog.Close>
          </div>
          <div className="mobile-sheet-links">
            <button
              type="button"
              className="mobile-sheet-link-btn"
              onClick={() => { setOpen(false); setScanOpen(true); }}
            >
              <span className="mobile-sheet-icon"><ScanLine size={19} aria-hidden="true" /></span>
              <span>{t("Scan QR Code")}</span>
              <span className="mobile-sheet-chevron" aria-hidden="true">›</span>
            </button>
            <Link href={destination} onClick={() => setOpen(false)}>
              <span className="mobile-sheet-icon"><ArrowUpRight size={19} /></span>
              {signedIn ? t("Dashboard") : t("Open ChainPay")}
              <span className="mobile-sheet-chevron" aria-hidden="true">›</span>
            </Link>
          </div>
          <div className="mobile-sheet-language">
            <span>{t("Language")}</span>
            <LanguageToggle />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      <ScanLink open={scanOpen} onOpenChange={setScanOpen} trigger={null} />
    </Dialog.Root>
  );
}
