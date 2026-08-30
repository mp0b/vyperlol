import { SiDiscord, SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { enabledOAuthProviders, type OAuthProviderKey } from "@/lib/auth/oauth";
import { Button } from "@/components/ui/button";

const META: Record<OAuthProviderKey, { label: string; Icon: typeof SiGithub }> = {
  discord: { label: "Discord", Icon: SiDiscord },
  github: { label: "GitHub", Icon: SiGithub },
  google: { label: "Google", Icon: SiGoogle },
};

/**
 * Renders one button per configured OAuth provider. Providers with missing
 * credentials simply don't appear — no dead buttons.
 */
export function OAuthButtons({ next }: { next?: string }) {
  const providers = enabledOAuthProviders();
  if (providers.length === 0) return null;

  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {providers.map((p) => {
          const { label, Icon } = META[p];
          return (
            <Button key={p} variant="outline" asChild className="w-full">
              <a href={`/api/auth/oauth/${p}${suffix}`}>
                <Icon size={16} />
                <span className={providers.length > 1 ? "sm:sr-only lg:not-sr-only" : ""}>{label}</span>
              </a>
            </Button>
          );
        })}
      </div>
      <div className="relative my-1 text-center">
        <span className="relative z-10 bg-card px-3 text-xs text-muted-foreground">or continue with email</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>
    </div>
  );
}
