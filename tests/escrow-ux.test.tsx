import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/i18n";
import { StatusBadge } from "@/components/ui/primitives";
import {
  escrowContractExplorerUrl,
  explorerAddress,
  explorerTx,
} from "@/lib/blockchain/config";

describe("Escrow UX Enhancement — Unit Tests", () => {
  describe("Smart Contract Explorer URL", () => {
    it("resolves the deployed Escrow contract to Sepolia block explorer when configured", () => {
      const original =
        process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS;
      process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS =
        "0xe08D0Da1F8df1b2d13455D16641056Cc6d6352b9";
      try {
        const url = escrowContractExplorerUrl();
        expect(url).toBe(
          "https://sepolia.etherscan.io/address/0xe08D0Da1F8df1b2d13455D16641056Cc6d6352b9",
        );
        expect(url).not.toContain("/tx/");
        expect(url).not.toContain("mainnet");
        expect(url).not.toContain("goerli");
        expect(url).not.toContain("holesky");
      } finally {
        process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS = original;
      }
    });

    it("returns null safely when contract address is missing, invalid or zero address", () => {
      const original =
        process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS;
      try {
        delete process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS;
        expect(escrowContractExplorerUrl()).toBeNull();

        process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS = "0xinvalid";
        expect(escrowContractExplorerUrl()).toBeNull();

        process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS =
          "0x0000000000000000000000000000000000000000";
        expect(escrowContractExplorerUrl()).toBeNull();
      } finally {
        process.env.NEXT_PUBLIC_CHAINPAY_ESCROW_CONTRACT_ADDRESS = original;
      }
    });

    it("distinguishes smart contract address link from transaction hash link", () => {
      const contractAddr = "0xe08D0Da1F8df1b2d13455D16641056Cc6d6352b9";
      const txHash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      const addressUrl = explorerAddress(contractAddr);
      const txUrl = explorerTx(txHash);

      expect(addressUrl).toBe(
        `https://sepolia.etherscan.io/address/${contractAddr}`,
      );
      expect(txUrl).toBe(`https://sepolia.etherscan.io/tx/${txHash}`);
      expect(addressUrl).not.toEqual(txUrl);
    });
  });

  describe("Escrow Status Badge & i18n", () => {
    it("renders created status badge with muted tone and correct Thai translation", () => {
      const enHtml = renderToStaticMarkup(
        <LanguageProvider initialLanguage="en">
          <StatusBadge status="created" />
        </LanguageProvider>,
      );
      expect(enHtml).toContain('data-tone="muted"');
      expect(enHtml).toContain("Created");

      const thHtml = renderToStaticMarkup(
        <LanguageProvider initialLanguage="th">
          <StatusBadge status="created" />
        </LanguageProvider>,
      );
      expect(thHtml).toContain('data-tone="muted"');
      expect(thHtml).toContain("สร้างแล้ว");
    });

    it("renders all valid escrow statuses consistently in both English and Thai", () => {
      const statuses = [
        { status: "created", en: "Created", th: "สร้างแล้ว", tone: "muted" },
        { status: "funded", en: "Funded", th: "ฝากเงินแล้ว", tone: "success" },
        { status: "released", en: "Released", th: "จ่ายเงินแล้ว", tone: "paid" },
        { status: "disputed", en: "Disputed", th: "มีข้อพิพาท", tone: "error" },
        { status: "refunded", en: "Refunded", th: "คืนเงินแล้ว", tone: "muted" },
      ];

      for (const item of statuses) {
        const enHtml = renderToStaticMarkup(
          <LanguageProvider initialLanguage="en">
            <StatusBadge status={item.status} />
          </LanguageProvider>,
        );
        expect(enHtml).toContain(`data-tone="${item.tone}"`);
        expect(enHtml).toContain(item.en);

        const thHtml = renderToStaticMarkup(
          <LanguageProvider initialLanguage="th">
            <StatusBadge status={item.status} />
          </LanguageProvider>,
        );
        expect(thHtml).toContain(`data-tone="${item.tone}"`);
        expect(thHtml).toContain(item.th);
      }
    });
  });

  describe("Escrow List Filter Logic", () => {
    const mockEscrows = [
      {
        id: "1",
        title: "Frontend design",
        description: "Figma to Next.js",
        status: "created",
        freelancerAddress: "0x1111111111111111111111111111111111111111",
        clientAddress: "0x2222222222222222222222222222222222222222",
      },
      {
        id: "2",
        title: "Smart contract audit",
        description: "Vulnerability analysis",
        status: "funded",
        freelancerAddress: "0x3333333333333333333333333333333333333333",
        clientAddress: "0x2222222222222222222222222222222222222222",
      },
      {
        id: "3",
        title: "Backend API",
        description: "Postgres and Drizzle",
        status: "released",
        freelancerAddress: "0x4444444444444444444444444444444444444444",
        clientAddress: "0x2222222222222222222222222222222222222222",
      },
    ];

    function applyFilter(filter: string, search: string) {
      return mockEscrows.filter((e) => {
        const matchesFilter = filter === "all" || e.status === filter;
        const matchesSearch =
          !search ||
          `${e.title} ${e.description} ${e.freelancerAddress} ${e.clientAddress}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      });
    }

    it("returns all escrows when filter is 'all' and search is empty", () => {
      expect(applyFilter("all", "")).toHaveLength(3);
    });

    it("returns only matching escrows for each status filter", () => {
      expect(applyFilter("created", "")).toHaveLength(1);
      expect(applyFilter("created", "")[0]?.id).toBe("1");

      expect(applyFilter("funded", "")).toHaveLength(1);
      expect(applyFilter("funded", "")[0]?.id).toBe("2");

      expect(applyFilter("released", "")).toHaveLength(1);
      expect(applyFilter("released", "")[0]?.id).toBe("3");

      expect(applyFilter("disputed", "")).toHaveLength(0);
      expect(applyFilter("refunded", "")).toHaveLength(0);
    });

    it("filters accurately with keyword search combined with status", () => {
      expect(applyFilter("all", "frontend")).toHaveLength(1);
      expect(applyFilter("all", "frontend")[0]?.title).toBe("Frontend design");

      expect(applyFilter("funded", "frontend")).toHaveLength(0);
      expect(applyFilter("funded", "audit")).toHaveLength(1);
    });
  });
});
