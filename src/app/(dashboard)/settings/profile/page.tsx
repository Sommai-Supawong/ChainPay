import { pageUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { GlassCard, PageHeader } from "@/components/ui/primitives";
import { SettingsTabs } from "@/components/theme/settings-tabs";
import { T } from "@/i18n";
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
        <div className="profile-summary">
          <span className="avatar" aria-hidden="true">
            {(user.displayName ?? user.email).slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2>{user.displayName || <T value="Your profile" />}</h2>
            <p className="muted">{user.email}</p>
          </div>
        </div>
        <ProfileForm
          displayName={user.displayName ?? ""}
          accountType={user.accountType}
          email={user.email}
        />
      </GlassCard>
    </>
  );
}
