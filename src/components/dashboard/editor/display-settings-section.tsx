"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup, SelectField, SwitchField, TextareaField, TextField } from "./controls";
import { useEditor } from "./editor-provider";
import { newId } from "@/lib/id";

const PROFILE_VISIBILITY = [
  { value: "PUBLIC", label: "Public — visible sur vyper.lol" },
  { value: "UNLISTED", label: "Non répertorié — accessible par lien" },
  { value: "PRIVATE", label: "Privé — réservé à vous" },
] as const;

const SECTION_TYPES = [
  { value: "ABOUT", label: "À propos" },
  { value: "PROJECTS", label: "Projets" },
  { value: "GALLERY", label: "Galerie" },
  { value: "MUSIC", label: "Musique" },
  { value: "SKILLS", label: "Compétences" },
  { value: "CUSTOM_TEXT", label: "Texte personnalisé" },
  { value: "DISCORD", label: "Discord" },
  { value: "GITHUB", label: "GitHub" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TWITCH", label: "Twitch" },
  { value: "SPOTIFY", label: "Spotify" },
  { value: "STEAM", label: "Steam" },
] as const;

export function DisplaySettingsSection() {
  const { draft, data, mutate } = useEditor();
  const [newType, setNewType] = useState<(typeof SECTION_TYPES)[number]["value"]>("CUSTOM_TEXT");

  const addSection = () => {
    if (draft.sections.length >= 40) return;
    const label = SECTION_TYPES.find((item) => item.value === newType)?.label ?? "Section";
    mutate((next) => {
      next.sections.push({ id: newId(), type: newType, title: label, visible: true, config: {} });
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FieldGroup title="Publication" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
        <SelectField
          label="Visibilité"
          value={draft.profile.visibility === "PASSWORD" ? "UNLISTED" : draft.profile.visibility}
          options={PROFILE_VISIBILITY}
          onChange={(value) => mutate((next) => { next.profile.visibility = value; })}
        />
        <SwitchField
          label="Publier le profil"
          description="Un profil non publié ne peut pas être consulté par les visiteurs."
          checked={draft.profile.isPublished}
          onChange={(value) => mutate((next) => { next.profile.isPublished = value; })}
        />
        <SwitchField label="Afficher les vues" checked={draft.settings.showViews} onChange={(value) => mutate((next) => { next.settings.showViews = value; })} />
        <SwitchField label="Afficher les abonnés" checked={draft.settings.showFollowerCount} onChange={(value) => mutate((next) => { next.settings.showFollowerCount = value; })} />
        <SwitchField label="Afficher les badges obtenus" checked={draft.settings.showBadges} onChange={(value) => mutate((next) => { next.settings.showBadges = value; })} />
        <SwitchField label="Animations sur le profil" checked={draft.settings.animationsEnabled} onChange={(value) => mutate((next) => { next.settings.animationsEnabled = value; })} />
      </FieldGroup>

      <FieldGroup title="Expérience & Audio" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
        <SwitchField 
          label="Écran 'Click to enter'" 
          description="Affiche un écran noir demandant au visiteur de cliquer (requis pour lire de l'audio automatiquement)."
          checked={draft.settings.config.intro?.enabled ?? false} 
          onChange={(value) => mutate((next) => { 
            if (!next.settings.config.intro) next.settings.config.intro = { enabled: value, text: "click to enter", buttonText: "enter", blur: 16, playSound: false };
            else next.settings.config.intro.enabled = value;
          })} 
        />
        {(draft.settings.config.intro?.enabled) && (
          <TextField
            label="Texte de l'écran d'entrée"
            value={draft.settings.config.intro?.text ?? "click to enter"}
            maxLength={60}
            onChange={(value) => mutate((next) => { if (next.settings.config.intro) next.settings.config.intro.text = value; })}
          />
        )}
        <TextField
          label="URL de la musique (MP3/Audio)"
          description="Lien direct vers un fichier audio. La musique se lance après le clic."
          value={draft.settings.config.audioUrl ?? ""}
          onChange={(value) => mutate((next) => {
            next.settings.config.audioUrl = value || undefined;
          })}
        />
      </FieldGroup>

      <FieldGroup title="Référencement" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
        <TextField
          label="Titre de l’onglet"
          value={draft.profile.seoTitle}
          maxLength={70}
          placeholder="Vyper.lol | votre nom"
          onChange={(value) => mutate((next) => { next.profile.seoTitle = value; })}
        />
        <TextareaField
          label="Description"
          value={draft.profile.seoDescription}
          rows={5}
          maxLength={200}
          placeholder="Une courte description de votre page."
          onChange={(value) => mutate((next) => { next.profile.seoDescription = value; })}
        />
        <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-muted-foreground">
          Sans domaine personnalisé, votre page publique est <span className="font-medium text-white">vyper.lol/{data.username}</span>.
        </p>
      </FieldGroup>

      <FieldGroup title="Sections du profil" className="border-white/10 bg-black/35 text-white backdrop-blur-xl lg:col-span-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={newType}
            onChange={(event) => setNewType(event.target.value as typeof newType)}
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Type de section à ajouter"
          >
            {SECTION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <Button type="button" onClick={addSection} className="bg-orange-500 text-white hover:bg-orange-400"><Plus className="size-4" /> Ajouter une section</Button>
        </div>
        {draft.sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">Aucune section supplémentaire n’est affichée.</div>
        ) : (
          <div className="grid gap-3">
            {draft.sections.map((section, index) => (
              <div key={section.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1"><TextField label="Nom de la section" value={section.title ?? ""} maxLength={60} onChange={(value) => mutate((next) => { next.sections[index].title = value || null; })} /></div>
                <div className="w-full sm:w-52"><span className="mb-1.5 block text-sm font-medium">Type</span><div className="flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">{section.type}</div></div>
                <div className="flex items-center justify-between gap-2 sm:pb-1"><SwitchField label="" checked={section.visible} onChange={(value) => mutate((next) => { next.sections[index].visible = value; })} /><Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => mutate((next) => { next.sections.splice(index, 1); })} aria-label={`Supprimer ${section.title ?? "la section"}`}><Trash2 className="size-4" /></Button></div>
              </div>
            ))}
          </div>
        )}
      </FieldGroup>
    </div>
  );
}
