import { GlassCard, PageHeader } from "@/components/ui/primitives";
import { SettingsTabs } from "@/components/theme/settings-tabs";
import { ThemeSelector } from "@/components/theme/theme-selector";
import { T } from "@/i18n";

export default function ThemeSettingsPage() {
  return (
    <>
      <PageHeader title="Appearance" description="Choose how ChainPay looks" />
      <SettingsTabs current="theme" />
      <GlassCard className="form-width">
        <h2>
          <T value="Theme" />
        </h2>
        <p className="muted theme-description">
          <T value="Your choice follows your account across devices. The homepage always stays dark." />
        </p>
        <ThemeSelector />
      </GlassCard>
    </>
  );
}
