import Link from "next/link";
import { Link2 } from "lucide-react";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="ChainPay home">
      <span className="brand-mark">
        <Link2 size={24} strokeWidth={2.5} />
      </span>
      ChainPay<span className="brand-dot">.</span>
    </Link>
  );
}
