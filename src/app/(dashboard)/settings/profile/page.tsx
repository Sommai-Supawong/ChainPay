import { pageUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { GlassCard, PageHeader } from "@/components/ui/primitives";
import { SettingsTabs } from "@/components/theme/settings-tabs";
export default async function ProfilePage() {
  const user = await pageUser();
  return (
    <>
      <PageHeader
        title="Your profile"
        description="The details that make your account yours."
      />
      <SettingsTabs current="profile" />
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
