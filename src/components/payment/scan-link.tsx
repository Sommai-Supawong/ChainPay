"use client";

import { T, useTranslation } from "@/i18n";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ScanLine, VideoOff, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useThemeOptional } from "@/components/theme/theme-provider";

type Detector = {
  detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

interface ScanLinkProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function ScanLink({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
  className,
}: ScanLinkProps = {}) {
  const t = useTranslation();
  const router = useRouter();
  const { theme } = useThemeOptional();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled
    ? (setControlledOpen ?? (() => {}))
    : setUncontrolledOpen;

  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [value, setValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  function stop() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
      stream.current = null;
    }
    if (video.current) {
      video.current.srcObject = null;
    }
    setIsScanning(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      stop();
    }
    setOpen(nextOpen);
  }

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  function navigate(raw: string) {
    try {
      const url = new URL(raw, window.location.origin);
      if (
        url.origin !== window.location.origin ||
        !/^\/p\/CP-[\w-]{16,32}$/.test(url.pathname)
      ) {
        throw new Error();
      }
      stop();
      handleOpenChange(false);
      router.push(url.pathname);
    } catch {
      toast.error(t("Use a ChainPay payment link from this site."));
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
        t("Use your phone’s camera to scan the QR, or paste the link below."),
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
      setIsScanning(true);
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
          toast.error(
            t("Camera scanning stopped. Paste a payment link instead."),
          );
        } finally {
          detecting = false;
        }
      }, 700);
    } catch {
      stop();
      toast.error(
        t("Camera unavailable. Allow camera access or paste a payment link."),
      );
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <Dialog.Trigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button variant="secondary" className={className}>
              <ScanLine size={18} />
              <T value="Scan" />
            </Button>
          )}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="scan-overlay" data-theme={theme} />
        <Dialog.Content
          className="scan-modal product-ui"
          data-theme={theme}
          aria-describedby="scan-qr-description"
        >
          <div className="scan-modal-header">
            <div>
              <Dialog.Title className="scan-modal-title">
                <T value="Scan QR Code" />
              </Dialog.Title>
              <Dialog.Description
                id="scan-qr-description"
                className="scan-modal-subtitle"
              >
                <T value="Align the QR code inside the frame" />
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("Close scanner")}
                className="scan-modal-close"
              >
                <X size={18} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="scan-modal-body">
            <div className="scan-camera-container">
              <video
                ref={video}
                playsInline
                muted
                className="scan-video"
                aria-label={t("Camera preview")}
              />
              {!isScanning && (
                <div className="scan-camera-placeholder" aria-hidden="true">
                  <ScanLine size={40} className="scan-placeholder-icon" />
                </div>
              )}
              <div className="scan-viewfinder" aria-hidden="true">
                <span className="scan-corner top-left" />
                <span className="scan-corner top-right" />
                <span className="scan-corner bottom-left" />
                <span className="scan-corner bottom-right" />
                {isScanning && <span className="scan-laser-line" />}
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="scan-camera-btn"
              onClick={isScanning ? stop : camera}
            >
              {isScanning ? (
                <>
                  <VideoOff size={16} />
                  <T value="Stop camera" />
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <T value="Use camera" />
                </>
              )}
            </Button>

            <div className="scan-paste-section">
              <label htmlFor="scan-url" className="scan-paste-label">
                <T value="Or paste a ChainPay payment link" />
              </label>
              <div className="scan-input-group">
                <input
                  id="scan-url"
                  className="technical-text scan-input"
                  value={value}
                  placeholder="https://…/p/CP-…"
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      navigate(value);
                    }
                  }}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  className="scan-open-btn"
                  onClick={() => navigate(value)}
                  disabled={!value.trim()}
                >
                  <T value="Open request" />
                </Button>
              </div>
            </div>
          </div>

          <div className="scan-modal-footer">
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="secondary"
                className="scan-cancel-btn"
              >
                <T value="Cancel" />
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
