import Link from "next/link";
import { pageUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { GlassCard, PageHeader } from "@/components/ui/primitives";
export default async function ProfilePage() {
  const user = await pageUser();
  return (
    <>
      <PageHeader
        title="Your profile"
        description="The details that make your account yours."
      />
      <nav className="settings-tabs">
        <Link aria-current="page" href="/settings/profile">
          Profile
        </Link>
        <Link href="/settings/security">Security</Link>
      </nav>
      <GlassCard className="form-width">
        <ProfileForm
          displayName={user.displayName ?? ""}
          accountType={user.accountType}
          email={user.email}
        />
      </GlassCard>
    </>
  );
}
