"use client";

import { ImageField } from "./image-field";
import { FieldGroup, TextareaField, TextField } from "./controls";
import { useEditor } from "./editor-provider";
import { PROFILE_TAGS, type ProfileTag } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BasicInfoSection() {
  const { draft, mutate } = useEditor();
  const { profile } = draft;

  const toggleTag = (tag: ProfileTag) => {
    mutate((next) => {
      const tags = next.profile.tags as ProfileTag[];
      next.profile.tags = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag].slice(0, 5);
    });
  };

  return (
    <FieldGroup title="Identité" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
      <ImageField
        label="Photo de profil"
        value={profile.avatarUrl}
        onChange={(value) => mutate((next) => { next.profile.avatarUrl = value; })}
        description="Importez une image ou collez l’URL d’un fichier déjà hébergé."
      />
      <ImageField
        label="Bannière"
        value={profile.bannerUrl}
        aspect="wide"
        onChange={(value) => mutate((next) => { next.profile.bannerUrl = value; })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nom affiché"
          value={profile.displayName}
          maxLength={60}
          placeholder="Votre nom"
          onChange={(value) => mutate((next) => { next.profile.displayName = value; })}
        />
        <TextField
          label="Activité"
          value={profile.occupation}
          maxLength={60}
          placeholder="Créateur, streamer, développeur…"
          onChange={(value) => mutate((next) => { next.profile.occupation = value; })}
        />
      </div>
      <TextareaField
        label="Bio"
        value={profile.bio}
        maxLength={1000}
        rows={4}
        placeholder="Présentez-vous en quelques mots."
        onChange={(value) => mutate((next) => { next.profile.bio = value; })}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Localisation"
          value={profile.location}
          maxLength={80}
          placeholder="Paris, France"
          onChange={(value) => mutate((next) => { next.profile.location = value; })}
        />
        <TextField
          label="Pronoms"
          value={profile.pronouns}
          maxLength={40}
          placeholder="il / lui"
          onChange={(value) => mutate((next) => { next.profile.pronouns = value; })}
        />
        <TextField
          label="Statut"
          value={profile.statusText}
          maxLength={100}
          placeholder="En ligne"
          onChange={(value) => mutate((next) => { next.profile.statusText = value; })}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Centres d’intérêt</span>
          <span className="text-xs text-muted-foreground">{profile.tags.length}/5</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROFILE_TAGS.map((tag) => {
            const selected = profile.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-orange-400/70 bg-orange-500/20 text-orange-100"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-white",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </FieldGroup>
  );
}
