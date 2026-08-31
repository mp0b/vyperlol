"use client";

import { Check, Palette, Sparkles } from "lucide-react";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { cn } from "@/lib/utils";
import { ColorField, FieldGroup, SelectField, SliderField, SwitchField, TextField } from "./controls";
import { ImageField } from "./image-field";
import { VideoField } from "./video-field";
import { useEditor } from "./editor-provider";

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "Manrope", label: "Manrope" },
  { value: "Playfair Display", label: "Playfair Display" },
] as const;

const BACKGROUND_OPTIONS = [
  { value: "color", label: "Couleur unie" },
  { value: "gradient", label: "Dégradé" },
  { value: "animated-gradient", label: "Dégradé animé" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
] as const;

const EFFECT_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "particles", label: "Particules" },
  { value: "snow", label: "Neige" },
  { value: "matrix", label: "Matrix" },
  { value: "stars", label: "Étoiles" },
  { value: "aurora", label: "Aurore" },
  { value: "grid", label: "Grille" },
  { value: "waves", label: "Ondes" },
  { value: "glow", label: "Halo" },
  { value: "noise", label: "Grain" },
  { value: "scanlines", label: "Scanlines" },
] as const;

const CARD_OPTIONS = [
  { value: "glass", label: "Verre" },
  { value: "solid", label: "Pleine" },
  { value: "minimal", label: "Minimaliste" },
  { value: "floating", label: "Flottante" },
  { value: "transparent", label: "Transparente" },
  { value: "neon", label: "Néon" },
  { value: "soft", label: "Soft" },
  { value: "custom", label: "Personnalisée" },
] as const;

const LINK_OPTIONS = [
  { value: "glass", label: "Verre" },
  { value: "solid", label: "Plein" },
  { value: "outline", label: "Contour" },
  { value: "soft", label: "Soft" },
  { value: "neon", label: "Néon" },
] as const;

export function ThemeSettingsSection() {
  const { draft, mutate } = useEditor();
  const theme = draft.theme;

  return (
    <div className="grid gap-6">
      <FieldGroup title="Thèmes" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
        <p className="-mt-2 text-sm text-muted-foreground">Les presets remplacent uniquement la configuration visuelle du profil. Vous pouvez ensuite ajuster chaque détail.</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const selected = theme.colors.accent === preset.config.colors.accent && theme.background.color === preset.config.background.color;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => mutate((next) => { next.theme = structuredClone(preset.config); })}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                  selected ? "border-white/40/80 bg-white/10" : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
                )}
              >
                <div className="mb-5 h-14 rounded-xl border border-white/10" style={{ background: `linear-gradient(135deg, ${preset.config.background.color}, ${preset.config.colors.accent})` }} />
                <div className="flex items-center justify-between gap-2"><span className="font-medium">{preset.name}</span>{selected && <Check className="size-4 text-white/70" />}</div>
                <span className="mt-1 block text-xs text-muted-foreground">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <div className="grid gap-6 xl:grid-cols-2">
        <FieldGroup title="Couleurs & fond" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Accent" value={theme.colors.accent} onChange={(value) => mutate((next) => { next.theme.colors.accent = value; })} />
            <ColorField label="Texte" value={theme.colors.text} onChange={(value) => mutate((next) => { next.theme.colors.text = value; })} />
            <ColorField label="Texte secondaire" value={theme.colors.textSecondary} onChange={(value) => mutate((next) => { next.theme.colors.textSecondary = value; })} />
            <ColorField label="Fond" value={theme.background.color} onChange={(value) => mutate((next) => { next.theme.background.color = value; })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Type de fond" value={theme.background.type} options={BACKGROUND_OPTIONS} onChange={(value) => mutate((next) => { next.theme.background.type = value; })} />
            <SelectField label="Effet" value={theme.background.effect} options={EFFECT_OPTIONS} onChange={(value) => mutate((next) => { next.theme.background.effect = value; })} />
          </div>
          {theme.background.type === "image" && (
            <ImageField
              label="Image de fond"
              value={theme.background.imageUrl ?? ""}
              aspect="wide"
              onChange={(value) => mutate((next) => { next.theme.background.imageUrl = value; })}
            />
          )}
          {theme.background.type === "video" && (
            <VideoField
              label="Vidéo de fond"
              value={theme.background.videoUrl ?? ""}
              onChange={(value) => mutate((next) => { next.theme.background.videoUrl = value; })}
            />
          )}
          <SliderField label="Opacité du fond" value={Math.round(theme.background.opacity * 100)} min={0} max={100} suffix=" %" onChange={(value) => mutate((next) => { next.theme.background.opacity = value / 100; })} />
          <SliderField label="Intensité de l’effet" value={Math.round(theme.background.effectIntensity * 100)} min={0} max={100} suffix=" %" onChange={(value) => mutate((next) => { next.theme.background.effectIntensity = value / 100; })} />
        </FieldGroup>

        <FieldGroup title="Typographie" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
          <SelectField label="Police" value={FONT_OPTIONS.some((option) => option.value === theme.typography.fontFamily) ? theme.typography.fontFamily as (typeof FONT_OPTIONS)[number]["value"] : "Inter"} options={FONT_OPTIONS} onChange={(value) => mutate((next) => { next.theme.typography.fontFamily = value; next.theme.typography.source = "google"; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Casse"
              value={theme.typography.transform}
              options={[{ value: "none", label: "Normale" }, { value: "uppercase", label: "MAJUSCULES" }, { value: "lowercase", label: "minuscules" }, { value: "capitalize", label: "Capitale" }]}
              onChange={(value) => mutate((next) => { next.theme.typography.transform = value; })}
            />
            <SelectField
              label="Effet de texte (Pseudo)"
              value={theme.effects.textEffect}
              options={[
                { value: "none", label: "Aucun" },
                { value: "gradient", label: "Dégradé" },
                { value: "glow", label: "Halo" },
                { value: "glitch", label: "Glitch" },
                { value: "shimmer", label: "Reflet" },
                { value: "wave", label: "Vague" },
                { value: "typewriter", label: "Machine à écrire" },
                { value: "rainbow", label: "Arc-en-ciel" },
                { value: "pulse", label: "Pulsation" },
              ]}
              onChange={(value) => mutate((next) => { next.theme.effects.textEffect = value; })}
            />
          </div>
          <SliderField label="Graisse" value={theme.typography.weight} min={100} max={900} step={100} onChange={(value) => mutate((next) => { next.theme.typography.weight = value; })} />
          <SliderField label="Espacement des lettres" value={theme.typography.letterSpacing} min={-2} max={10} step={0.5} suffix=" px" onChange={(value) => mutate((next) => { next.theme.typography.letterSpacing = value; })} />
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground"><Sparkles className="mr-2 inline size-4 text-white/70" />Les polices sélectionnées sont chargées depuis Google Fonts sur votre page publique.</div>
        </FieldGroup>

        <FieldGroup title="Carte de profil" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
          <SelectField label="Style de la carte" value={theme.profileCard.style} options={CARD_OPTIONS} onChange={(value) => mutate((next) => { next.theme.profileCard.style = value; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SliderField label="Arrondi" value={theme.profileCard.radius} min={0} max={48} suffix=" px" onChange={(value) => mutate((next) => { next.theme.profileCard.radius = value; })} />
            <SliderField label="Flou" value={theme.profileCard.blur} min={0} max={40} suffix=" px" onChange={(value) => mutate((next) => { next.theme.profileCard.blur = value; })} />
          </div>
          <SwitchField label="Bordure" checked={theme.profileCard.border} onChange={(value) => mutate((next) => { next.theme.profileCard.border = value; })} />
          <SwitchField label="Halo" checked={theme.profileCard.glow} onChange={(value) => mutate((next) => { next.theme.profileCard.glow = value; })} />
          <SwitchField label="Anneau de l’avatar" checked={theme.profileCard.avatar.ring} onChange={(value) => mutate((next) => { next.theme.profileCard.avatar.ring = value; })} />
        </FieldGroup>

        <FieldGroup title="Cartes de liens" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
          <SelectField label="Style des liens" value={theme.links.style} options={LINK_OPTIONS} onChange={(value) => mutate((next) => { next.theme.links.style = value; })} />
          <SliderField label="Arrondi" value={theme.links.radius} min={0} max={32} suffix=" px" onChange={(value) => mutate((next) => { next.theme.links.radius = value; })} />
          <SelectField
            label="Animation au survol"
            value={theme.links.hoverAnimation}
            options={[{ value: "none", label: "Aucune" }, { value: "lift", label: "Élévation" }, { value: "glow", label: "Halo" }, { value: "scale", label: "Zoom" }, { value: "slide", label: "Glissement" }]}
            onChange={(value) => mutate((next) => { next.theme.links.hoverAnimation = value; })}
          />
          <ColorField label="Fond des liens" value={theme.links.background ?? "rgba(255, 255, 255, 0.05)"} onChange={(value) => mutate((next) => { next.theme.links.background = value; })} />
        </FieldGroup>

        <FieldGroup title="Curseur & Effets" className="border-white/10 bg-black/35 text-white backdrop-blur-xl lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Style du Curseur"
              value={theme.effects.cursor}
              options={[
                { value: "default", label: "Par défaut" },
                { value: "glow", label: "Lumière (Glow)" },
                { value: "particles", label: "Particules" },
                { value: "trail", label: "Traînée (Trail)" },
                { value: "sparkles", label: "Étincelles" },
                { value: "custom", label: "Image Personnalisée" },
              ]}
              onChange={(value) => mutate((next) => { next.theme.effects.cursor = value; })}
            />
            {theme.effects.cursor === "custom" && (
              <ImageField
                label="Image du Curseur (PNG)"
                value={theme.effects.cursorImageUrl ?? ""}
                onChange={(value) => mutate((next) => { next.theme.effects.cursorImageUrl = value; })}
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <SwitchField label="Effet d'ondulation (Ripple)" checked={theme.effects.ripple} onChange={(value) => mutate((next) => { next.theme.effects.ripple = value; })} />
            <SwitchField label="Réduire les mouvements (Reduced Motion)" checked={theme.effects.reducedMotion} onChange={(value) => mutate((next) => { next.theme.effects.reducedMotion = value; })} />
          </div>
        </FieldGroup>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70"><Palette className="mr-2 inline size-4 text-white/70" />Toutes les personnalisations sont appliquées à la page publique après l’enregistrement automatique. Utilisez « Voir mon profil en direct » pour vérifier le rendu réel.</div>
    </div>
  );
}
