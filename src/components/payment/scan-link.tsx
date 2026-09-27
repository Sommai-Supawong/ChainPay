"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
type Detector = {
  detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};
export function ScanLink() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [open, setOpen] = useState(false),
    [value, setValue] = useState("");
  function stop() {
    if (timer.current) clearInterval(timer.current);
    stream.current?.getTracks().forEach((track) => track.stop());
  }
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  function navigate(raw: string) {
    try {
      const url = new URL(raw);
      if (
        url.origin !== window.location.origin ||
        !/^\/p\/CP-[\w-]{16,32}$/.test(url.pathname)
      )
        throw new Error();
      stop();
      router.push(url.pathname);
    } catch {
      toast.error("Use a ChainPay payment link from this site.");
    }
  }
  async function camera() {
    stop();
    const Constructor = (
      window as unknown as {
        BarcodeDetector?: new (config: { formats: string[] }) => Detector;
      }
    ).BarcodeDetector;
    if (!Constructor) {
      toast.info(
        "Use your phone’s camera to scan the QR, or paste the link below.",
      );
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (!video.current) {
        stop();
        return;
      }
      video.current.srcObject = stream.current;
      await video.current.play();
      const detector = new Constructor({ formats: ["qr_code"] });
      let detecting = false;
      timer.current = setInterval(async () => {
        if (!video.current || detecting) return;
        detecting = true;
        try {
          const codes = await detector.detect(video.current);
          if (codes[0]) {
            stop();
            navigate(codes[0].rawValue);
          }
        } catch {
          stop();
          toast.error("Camera scanning stopped. Paste a payment link instead.");
        } finally {
          detecting = false;
        }
      }, 700);
    } catch {
      stop();
      toast.error(
        "Camera unavailable. Allow camera access or paste a payment link.",
      );
    }
  }
  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => {
          if (open) stop();
          setOpen(!open);
        }}
      >
        <ScanLine size={18} />
        Scan
      </Button>
      {open && (
        <div className="scan-panel card">
          <div className="card-heading">
            <h2>Open a payment link</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close scanner"
              onClick={() => {
                stop();
                setOpen(false);
              }}
            >
              <X size={17} />
            </Button>
          </div>
          <video ref={video} playsInline muted className="scan-video" />
          <Button variant="secondary" onClick={camera}>
            Use camera
          </Button>
          <label htmlFor="scan-url">Or paste a ChainPay payment link</label>
          <input
            id="scan-url"
            value={value}
            placeholder="https://…/p/CP-…"
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={() => navigate(value)}>Open request</Button>
        </div>
      )}
    </div>
  );
}
