import { T } from "@/i18n";
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
            <T value="Modern Web3 payments." />
            <br />
            <T value="Transparent settlement." />
            <br />
            <T value="A simpler everyday experience." />
          </p>
          <span className="cp-network-label">
            <span className="network-dot" />{" "}
            <T value="Ethereum Sepolia Testnet" />
          </span>
        </div>
        <nav aria-labelledby="footer-product-heading">
          <h2 id="footer-product-heading">
            <T value="Product" />
          </h2>
          {[
            ["/dashboard", "Dashboard"],
            ["/pay", "Send payment"],
            ["/requests", "Payment requests"],
            ["/activity", "Activity"],
            ["/wallets", "Wallets"],
          ].map(([href, label]) => (
            <Link key={href} href={href}>
              <T value={label} />
            </Link>
          ))}
        </nav>
        <nav aria-labelledby="footer-resources-heading">
          <h2 id="footer-resources-heading">
            <T value="Resources & support" />
          </h2>
          <a href="#how-it-works">
            <T value="Getting started" />
          </a>
          <a href="#built-for-trust">
            <T value="Security & verification" />
          </a>
          <a href="#help">
            <T value="Help & FAQs" />
          </a>
          {address && (
            <a
              href={explorerAddress(address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <T value="Smart contract" />
              <ArrowUpRight size={13} />
            </a>
          )}
        </nav>
        <div className="cp-contract-info">
          <h2>
            <T value="On the network" />
          </h2>
          <span>
            <T value="Ethereum Sepolia" />
          </span>
          <p>
            <T value="Chain ID · 11155111" />
          </p>
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
                <T value="View contract" />
                <ArrowUpRight size={14} />
              </a>
            </>
          ) : (
            <p>
              <T value="Testnet payments only" />
            </p>
          )}
        </div>
      </div>
      <div className="cp-footer-bottom">
        <span>
          © {new Date().getFullYear()} <T value="ChainPay" />
        </span>
        <span>
          <T value="Designed & Developed by" />
          <strong>
            <T value="Sommai Devcodejeng" />
          </strong>
        </span>
        <a href="#main">
          <T value="Back to top ↑" />
        </a>
      </div>
    </footer>
  );
}
