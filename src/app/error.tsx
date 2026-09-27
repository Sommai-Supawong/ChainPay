"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="error-page">
      <h1>We couldn’t load this page.</h1>
      <p className="muted">
        Please try again. If this is a new installation, check the service
        configuration in the setup guide.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
