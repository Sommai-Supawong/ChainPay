import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { ThemeSelector } from "@/components/theme/theme-selector";
import { LanguageProvider } from "@/i18n";
import { translate } from "@/i18n/messages";

function ThemeProbe() {
  const { theme } = useTheme();
  return createElement("div", { "data-theme": theme });
}

it("renders the saved appearance on the server before hydration", () => {
  for (const theme of ["dark", "light"] as const) {
    const html = renderToStaticMarkup(
      createElement(
        ThemeProvider,
        { initialTheme: theme } as React.ComponentProps<typeof ThemeProvider>,
        createElement(ThemeProbe),
      ),
    );
    expect(html).toContain(`data-theme="${theme}"`);
  }
  expect(translate("th", "Theme")).toBe("ธีม");
  expect(translate("th", "Light")).toBe("โหมดสว่าง");
  expect(translate("en", "Dark")).toBe("Dark");
});

it("marks the selected theme and renders Thai labels", () => {
  const html = renderToStaticMarkup(
    createElement(
      LanguageProvider,
      { initialLanguage: "th" } as React.ComponentProps<
        typeof LanguageProvider
      >,
      createElement(
        ThemeProvider,
        { initialTheme: "light" } as React.ComponentProps<typeof ThemeProvider>,
        createElement(ThemeSelector),
      ),
    ),
  );
  expect(html).toContain("โหมดมืด");
  expect(html).toContain("โหมดสว่าง");
  expect(html).toMatch(
    /class="theme-option" data-selected="true" aria-pressed="true"/,
  );
});
