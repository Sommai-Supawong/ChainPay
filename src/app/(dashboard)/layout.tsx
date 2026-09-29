import { pageUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser();
  return (
    <ThemeProvider initialTheme={user.themePreference}>
      <AppShell name={user.displayName ?? "Your account"} email={user.email}>
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
