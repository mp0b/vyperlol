"use client";

import { useState } from "react";
import { Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup, SwitchField, TextField } from "./controls";
import { useEditor } from "./editor-provider";
import { SOCIAL_PROVIDERS, getSocialProvider, parseSocial } from "@/lib/providers/social";
import { newId } from "@/lib/id";

export function SocialsSection() {
  const { draft, mutate } = useEditor();
  const [provider, setProvider] = useState(SOCIAL_PROVIDERS[0]?.key ?? "github");

  const addSocial = () => {
    if (draft.socials.length >= 50) return;
    mutate((next) => {
      next.socials.push({ id: newId(), provider, username: null, url: "", label: null, visible: true });
    });
  };

  return (
    <FieldGroup title="Réseaux sociaux" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
      <p className="-mt-2 text-sm text-muted-foreground">
        Ajoutez jusqu’à 50 plateformes. Un identifiant ou une URL est normalisé automatiquement quand il est reconnu.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Plateforme à ajouter"
        >
          {SOCIAL_PROVIDERS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        <Button type="button" onClick={addSocial} className="bg-white text-black hover:bg-white/90">
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>

      {draft.socials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
          Aucune plateforme ajoutée pour l’instant.
        </div>
      ) : (
        <div className="grid gap-3">
          {draft.socials.map((social, index) => {
            const definition = getSocialProvider(social.provider);
            const value = social.url || social.username || "";
            return (
              <div key={social.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="size-4 text-white/70" />
                    {definition?.label ?? social.provider}
                  </div>
                  <div className="flex items-center gap-2">
                    <SwitchField label="" checked={social.visible} onChange={(visible) => mutate((next) => { next.socials[index].visible = visible; })} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => mutate((next) => { next.socials.splice(index, 1); })}
                      aria-label={`Supprimer ${definition?.label ?? social.provider}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Identifiant ou URL"
                    value={value}
                    placeholder={definition?.placeholder}
                    onChange={(input) => mutate((next) => {
                      const parsed = parseSocial(next.socials[index].provider, input);
                      next.socials[index].username = parsed?.username ?? null;
                      next.socials[index].url = parsed?.url ?? input;
                    })}
                  />
                  <TextField
                    label="Libellé optionnel"
                    value={social.label ?? ""}
                    maxLength={60}
                    placeholder={definition?.label}
                    onChange={(label) => mutate((next) => { next.socials[index].label = label || null; })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FieldGroup>
  );
}
