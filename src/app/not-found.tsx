import { T } from "@/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main id="main" className="error-page">
      <p className="eyebrow">
        <T value="404 / NOTHING HERE" />
      </p>
      <h1>
        <T value="This link doesn’t lead anywhere." />
      </h1>
      <p className="muted">
        <T value="Check the address or return to ChainPay." />
      </p>
      <Button asChild>
        <Link href="/">
          <T value="Back to home" />
        </Link>
      </Button>
    </main>
  );
}
