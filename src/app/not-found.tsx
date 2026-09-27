import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main id="main" className="error-page">
      <p className="eyebrow">404 / NOTHING HERE</p>
      <h1>This link doesn’t lead anywhere.</h1>
      <p className="muted">Check the address or return to ChainPay.</p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
