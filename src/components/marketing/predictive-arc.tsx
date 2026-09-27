"use client";

import { useEffect, useRef } from "react";

const SWEEP_PERIOD = 10;
const SWEEP_DURATION = 7;

/** A bounded 2D particle horizon. No React updates in the animation loop. */
export function PredictiveArc() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      elapsed = 0;
    let visible = true;
    const cursor = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      vx: 0,
      vy: 0,
      glow: 0,
      targetGlow: 0,
    };
    // Bake the soft glow once instead of applying shadowBlur to every particle.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 48;
    const glowContext = glow.getContext("2d");
    if (glowContext) {
      const light = glowContext.createRadialGradient(24, 24, 0, 24, 24, 24);
      light.addColorStop(0, "rgba(221,237,255,0.7)");
      light.addColorStop(0.16, "rgba(124,182,255,0.4)");
      light.addColorStop(0.45, "rgba(57,125,255,0.13)");
      light.addColorStop(1, "rgba(57,125,255,0)");
      glowContext.fillStyle = light;
      glowContext.fillRect(0, 0, 48, 48);
    }

    function point(row: number, angle: number): [number, number] {
      const ripple = reduced.matches
        ? 0
        : Math.sin(angle * 5 + elapsed * 0.09 + row * 0.3) * 3;
      return [
        width / 2 +
          Math.cos(angle) * width * (0.45 + row * 0.017) +
          cursor.x * (8 + row * 0.5),
        height * 0.97 -
          Math.sin(angle) * (height * 0.53 + row * 10) +
          ripple +
          cursor.y * 9,
      ];
    }

    function sweep(row: number) {
      // The head starts/ends beyond the visible curve, then rests for three seconds.
      const progress =
        ((elapsed - row * 0.1 + SWEEP_PERIOD) % SWEEP_PERIOD) / SWEEP_DURATION;
      return {
        angle: Math.PI + 0.6 - progress * (Math.PI + 1.2),
        active: progress <= 1,
      };
    }

    function draw(time: number) {
      frame = 0;
      if (!visible || document.hidden) return;
      if (time - last < 32 && !reduced.matches) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const dt = Math.min((time - last) / 33.33 || 1, 2);
      last = time;
      if (!reduced.matches) elapsed += dt / 30;
      cursor.vx = (cursor.vx + (cursor.targetX - cursor.x) * 0.045 * dt) * 0.78;
      cursor.vy = (cursor.vy + (cursor.targetY - cursor.y) * 0.045 * dt) * 0.78;
      cursor.x += cursor.vx * dt;
      cursor.y += cursor.vy * dt;
      cursor.glow += (cursor.targetGlow - cursor.glow) * Math.min(1, 0.09 * dt);
      ctx!.clearRect(0, 0, width, height);
      const mobile = width < 700;
      const columns = mobile ? 64 : 116;
      const rows = mobile ? 7 : 12;

      // A few fine continuous rails anchor the dotted horizon. Keep the center quiet
      // behind the headline while allowing brighter blue shoulders on either side.
      const railLight = ctx!.createLinearGradient(0, 0, width, 0);
      railLight.addColorStop(0, "rgba(78,143,255,0)");
      railLight.addColorStop(0.18, "rgba(108,165,255,0.46)");
      railLight.addColorStop(0.36, "rgba(133,182,255,0.24)");
      railLight.addColorStop(0.5, "rgba(145,191,255,0.09)");
      railLight.addColorStop(0.64, "rgba(133,182,255,0.24)");
      railLight.addColorStop(0.82, "rgba(108,165,255,0.46)");
      railLight.addColorStop(1, "rgba(78,143,255,0)");
      ctx!.lineCap = "round";
      for (const row of mobile ? [1, 5] : [1, 5, 10]) {
        ctx!.beginPath();
        for (let col = 0; col < columns; col++) {
          const [x, y] = point(row, (col / (columns - 1)) * Math.PI);
          if (col === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = railLight;
        ctx!.globalAlpha = 0.12;
        ctx!.lineWidth = 10;
        ctx!.stroke();
        ctx!.globalAlpha = 1;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();

        const flow = sweep(row);
        if (
          !reduced.matches &&
          flow.active &&
          flow.angle > -0.4 &&
          flow.angle < Math.PI + 0.4
        ) {
          const [x, y] = point(row, flow.angle);
          const radius = mobile ? 100 : 190;
          const edgeFade = Math.min(
            1,
            Math.max(0, (flow.angle + 0.4) / 0.4),
            Math.max(0, (Math.PI + 0.4 - flow.angle) / 0.4),
          );
          const centerFade =
            0.3 + 0.7 * Math.min(1, Math.abs(x - width / 2) / (width * 0.32));
          const light = ctx!.createRadialGradient(x, y, 0, x, y, radius);
          light.addColorStop(0, "rgba(225,240,255,0.85)");
          light.addColorStop(0.23, "rgba(126,185,255,0.65)");
          light.addColorStop(0.65, "rgba(61,132,255,0.26)");
          light.addColorStop(1, "rgba(61,132,255,0)");
          ctx!.strokeStyle = light;
          ctx!.globalAlpha = edgeFade * centerFade * 0.2;
          ctx!.lineWidth = 14;
          ctx!.stroke();
          ctx!.globalAlpha = edgeFade * centerFade;
          ctx!.lineWidth = 1.6;
          ctx!.stroke();
          ctx!.globalAlpha = 1;
        }
      }
      for (let row = 0; row < rows; row++) {
        const flow = sweep(row);
        for (let col = 0; col < columns; col++) {
          const angle = (col / (columns - 1)) * Math.PI;
          const [x, y] = point(row, angle);
          const distance = Math.hypot(
            x - width * (0.5 + cursor.x * 0.5),
            y - height * (0.5 + cursor.y * 0.5),
          );
          const influence =
            finePointer.matches && !reduced.matches
              ? Math.max(0, 1 - distance / 220) ** 2 * cursor.glow
              : 0;
          const flowing =
            !reduced.matches && flow.active
              ? Math.exp(-(((angle - flow.angle) / 0.24) ** 2))
              : 0;
          const readability =
            0.4 + 0.6 * Math.min(1, Math.abs(x - width / 2) / (width * 0.32));
          const alpha =
            ((0.28 + Math.sin(angle) * 0.28) * (1 - row / (rows + 7)) +
              influence * 0.5 +
              flowing * 0.48) *
            readability;
          const energy = Math.min(1, flowing + influence);
          const size = (row % 4 === 0 ? 1.9 : 1.35) + energy * 0.35;
          const offsetY = y - influence * 7;
          if (energy > 0.08 && glowContext) {
            const diameter = 12 + energy * 9;
            ctx!.globalAlpha = energy * readability * 0.7;
            ctx!.drawImage(
              glow,
              x - diameter / 2,
              offsetY - diameter / 2,
              diameter,
              diameter,
            );
            ctx!.globalAlpha = 1;
          }
          ctx!.fillStyle = `rgba(${Math.round(112 + energy * 94)},${Math.round(166 + energy * 63)},255,${alpha})`;
          ctx!.fillRect(x, offsetY, size, size);
        }
      }
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    }
    function start() {
      if (!frame && visible && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    function resize() {
      const rect = host!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      start();
    }
    function move(event: PointerEvent) {
      if (
        reduced.matches ||
        !finePointer.matches ||
        event.pointerType === "touch"
      )
        return;
      const rect = host!.getBoundingClientRect();
      cursor.targetX = ((event.clientX - rect.left) / width - 0.5) * 2;
      cursor.targetY = ((event.clientY - rect.top) / height - 0.5) * 2;
      cursor.targetGlow = 1;
    }
    function reset() {
      cursor.targetX = 0;
      cursor.targetY = 0;
      cursor.targetGlow = 0;
    }
    function preferenceChanged() {
      reset();
      cursor.x = cursor.y = cursor.vx = cursor.vy = 0;
      cursor.glow = 0;
      cancelAnimationFrame(frame);
      frame = 0;
      start();
    }
    function visibilityChanged() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      start();
    }
    const resizeObserver = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visibilityChanged();
    });
    resizeObserver.observe(host);
    intersection.observe(host);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", preferenceChanged);
    finePointer.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      reduced.removeEventListener("change", preferenceChanged);
      finePointer.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);
  return <canvas ref={ref} className="cp-arc" aria-hidden="true" />;
}
