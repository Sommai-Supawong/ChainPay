"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { chain } from "@/lib/blockchain/config";
import { LanguageProvider, type Language } from "@/i18n";
export function Providers({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  const pathname = usePathname();
  const inApp =
    /^\/(dashboard|pay|requests|request|activity|wallets|contacts|settings)(\/|$)/.test(
      pathname,
    );
  const [query] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true },
        },
      }),
  );
  const [config] = useState(() =>
    createConfig({
      chains: [chain],
      connectors: [injected({ target: "metaMask" })],
      transports: { [chain.id]: http() },
      ssr: true,
    }),
  );
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={query}>
          <MotionConfig reducedMotion="user">
            {children}
            {!inApp && <Toaster theme="dark" richColors closeButton />}
          </MotionConfig>
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
