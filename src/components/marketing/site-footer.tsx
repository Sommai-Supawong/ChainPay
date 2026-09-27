import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { CopyButton } from "@/components/ui/copy-button";
import { contractAddress, explorerAddress } from "@/lib/blockchain/config";
import { shortAddress } from "@/lib/utils";

export function SiteFooter() {
  let address: string | undefined;
  try {
    address = contractAddress();
  } catch {
    /* Unconfigured deployments still have a useful public landing page. */
  }
  return (
    <footer className="cp-footer cp-container">
      <div className="cp-footer-grid">
        <div className="cp-footer-brand">
          <Brand />
          <p>
            Modern Web3 payments.
            <br />
            Transparent settlement.
            <br />A simpler everyday experience.
          </p>
          <span className="cp-network-label">
            <span className="network-dot" /> Ethereum Sepolia Testnet
          </span>
        </div>
        <nav aria-label="Footer product">
          <h2>Product</h2>
          {[
            ["/dashboard", "Dashboard"],
            ["/pay", "Send payment"],
            ["/requests", "Payment requests"],
            ["/activity", "Activity"],
            ["/wallets", "Wallets"],
          ].map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Resources and support">
          <h2>Resources &amp; support</h2>
          <a href="#how-it-works">Getting started</a>
          <a href="#built-for-trust">Security &amp; verification</a>
          <a href="#help">Help &amp; FAQs</a>
          {address && (
            <a
              href={explorerAddress(address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Smart contract <ArrowUpRight size={13} />
            </a>
          )}
        </nav>
        <div className="cp-contract-info">
          <h2>On the network</h2>
          <span>Ethereum Sepolia</span>
          <p>Chain ID · 11155111</p>
          {address ? (
            <>
              <div className="cp-contract-address">
                <span title={address}>{shortAddress(address)}</span>
                <CopyButton value={address} label="Copy contract" />
              </div>
              <a
                className="text-link"
                href={explorerAddress(address)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View contract
                <ArrowUpRight size={14} />
              </a>
            </>
          ) : (
            <p>Testnet payments only</p>
          )}
        </div>
      </div>
      <div className="cp-footer-bottom">
        <span>© {new Date().getFullYear()} ChainPay</span>
        <span>
          Designed &amp; Developed by <strong>Sommai Devcodejeng</strong>
        </span>
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
