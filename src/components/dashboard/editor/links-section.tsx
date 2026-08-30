"use client";

import { Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup, SelectField, TextareaField, TextField } from "./controls";
import { useEditor } from "./editor-provider";
import { newId } from "@/lib/id";
import { DEFAULT_LINK_STYLE } from "@/lib/profile/link-style";

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public" },
  { value: "AUTHENTICATED", label: "Membres connectés" },
  { value: "HIDDEN", label: "Masqué" },
] as const;

export function LinksSection() {
  const { draft, mutate } = useEditor();

  const addLink = () => {
    if (draft.links.length >= 100) return;
    mutate((next) => {
      next.links.push({
        id: newId(),
        title: "Nouveau lien",
        description: null,
        url: "https://example.com",
        icon: null,
        imageUrl: null,
        style: structuredClone(DEFAULT_LINK_STYLE),
        visibility: "PUBLIC",
      });
    });
  };

  return (
    <FieldGroup title="Liens" className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">Ajoutez vos sites, portfolios, communautés et projets. Chaque lien est enregistré dans son ordre d’affichage.</p>
        <Button type="button" onClick={addLink} className="shrink-0 bg-orange-500 text-white hover:bg-orange-400">
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>
      {draft.links.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
          Aucun lien personnalisé. Ajoutez votre premier lien quand vous êtes prêt.
        </div>
      ) : (
        <div className="grid gap-3">
          {draft.links.map((link, index) => (
            <div key={link.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium"><LinkIcon className="size-4 text-orange-300" /> Lien {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => mutate((next) => { next.links.splice(index, 1); })}
                  aria-label={`Supprimer le lien ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Titre"
                  value={link.title}
                  maxLength={80}
                  onChange={(value) => mutate((next) => { next.links[index].title = value; })}
                />
                <TextField
                  label="URL"
                  value={link.url}
                  placeholder="https://example.com"
                  onChange={(value) => mutate((next) => { next.links[index].url = value; })}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_220px]">
                <TextareaField
                  label="Description optionnelle"
                  value={link.description ?? ""}
                  rows={2}
                  maxLength={200}
                  onChange={(value) => mutate((next) => { next.links[index].description = value || null; })}
                />
                <SelectField
                  label="Visibilité"
                  value={link.visibility}
                  options={VISIBILITY_OPTIONS}
                  onChange={(value) => mutate((next) => { next.links[index].visibility = value; })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </FieldGroup>
  );
}
