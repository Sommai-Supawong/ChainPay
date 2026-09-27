import Link from "next/link";
import { BrandLogo } from "./brand-logo";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="ChainPay home">
      <span className="brand-mark">
        <BrandLogo />
      </span>
      ChainPay<span className="brand-dot">.</span>
    </Link>
  );
}
