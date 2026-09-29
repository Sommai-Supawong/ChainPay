import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/i18n";
import { translateError } from "@/i18n/messages";
import { StatusAlert, StatusBadge } from "@/components/ui/primitives";

function render(language: "en" | "th", status: string) {
  return renderToStaticMarkup(
    <LanguageProvider initialLanguage={language}>
      <StatusBadge status={status} />
    </LanguageProvider>,
  );
}

describe("status and alert presentation", () => {
  it.each([
    ["paid", "paid", "ชำระแล้ว"],
    ["active", "active", "ใช้งานอยู่"],
    ["pending", "warning", "รอดำเนินการ"],
    ["confirmed", "success", "ยืนยันแล้ว"],
    ["failed", "error", "ไม่สำเร็จ"],
    ["cancelled", "muted", "ยกเลิกแล้ว"],
    ["expired", "muted", "หมดอายุ"],
    ["verified", "success", "ยืนยันแล้ว"],
    ["draft", "muted", "แบบร่าง"],
  ])("renders %s with an icon, tone, and Thai label", (status, tone, label) => {
    const html = render("th", status);
    expect(html).toContain(`data-tone="${tone}"`);
    expect(html).toContain(label);
    expect(html).toContain("<svg");
  });

  it("keeps English labels and gives unexpected Thai errors a Thai fallback", () => {
    expect(render("en", "paid")).toContain("Paid");
    expect(translateError("th", "Unexpected RPC detail")).toBe(
      "เกิดข้อผิดพลาด โปรดลองอีกครั้ง",
    );
    expect(translateError("en", "Unexpected RPC detail")).toBe(
      "Unexpected RPC detail",
    );
  });

  it("renders a semantic alert with title, description, and icon", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLanguage="th">
        <StatusAlert tone="error" title="Payment needs attention">
          กรุณาลองใหม่
        </StatusAlert>
      </LanguageProvider>,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("กรุณาตรวจสอบการชำระเงิน");
    expect(html).toContain("กรุณาลองใหม่");
    expect(html).toContain("<svg");
  });
});
