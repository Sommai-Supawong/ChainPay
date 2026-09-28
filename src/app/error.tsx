"use client";
import { T } from "@/i18n";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="error-page">
      <h1>
        <T value="We couldn’t load this page." />
      </h1>
      <p className="muted">
        <T value="Please try again. If this is a new installation, check the service configuration in the setup guide." />
      </p>
      <Button onClick={reset}>
        <T value="Try again" />
      </Button>
    </main>
  );
}
