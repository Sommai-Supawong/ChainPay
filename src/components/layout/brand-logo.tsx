import Image from "next/image";

/** Decorative when paired with the adjacent ChainPay name. */
export function BrandLogo() {
  return (
    <Image
      className="brand-logo"
      src="/images/logo.png"
      alt=""
      width={1254}
      height={1254}
      sizes="56px"
    />
  );
}
