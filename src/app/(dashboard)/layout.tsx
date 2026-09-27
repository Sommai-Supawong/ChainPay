import { pageUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/shell";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser();
  return (
    <AppShell name={user.displayName ?? "Your account"} email={user.email}>
      {children}
    </AppShell>
  );
}
