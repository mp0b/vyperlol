"use client";

import { useEditor } from "@/components/dashboard/editor/editor-provider";
import { ExternalLink, LinkIcon, LayoutTemplate, Paintbrush, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoSection } from "@/components/dashboard/editor/basic-info-section";
import { LinksSection } from "@/components/dashboard/editor/links-section";
import { SocialsSection } from "@/components/dashboard/editor/socials-section";
import { DisplaySettingsSection } from "@/components/dashboard/editor/display-settings-section";
import { ThemeSettingsSection } from "@/components/dashboard/editor/theme-settings-section";

export default function EditorPage() {
  const { data } = useEditor();

  return (
    <div className="text-white">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-orange-300"><Sparkles className="size-3.5" /> Éditeur de profil</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Construisez une page qui vous ressemble.</h2>
          <p className="mt-3 text-sm leading-6 text-[#a79f95] sm:text-base">Configurez vos liens, votre présence et votre univers visuel. Chaque modification est enregistrée automatiquement et le rendu est à vérifier sur votre page publique.</p>
        </div>
        <Button asChild className="vy-action-primary rounded-xl px-5 font-semibold">
          <a href={`/${data.username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Voir mon profil
          </a>
        </Button>
      </div>

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="vy-builder-tabs mb-8 w-full">
          <TabsTrigger value="links" className="rounded-xl">
            <LinkIcon className="size-4" /> Identité & liens
          </TabsTrigger>
          <TabsTrigger value="display" className="rounded-xl">
            <LayoutTemplate className="size-4" /> Affichage
          </TabsTrigger>
          <TabsTrigger value="style" className="rounded-xl">
            <Paintbrush className="size-4" /> Style & thème
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="links" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BasicInfoSection />
            <SocialsSection />
          </div>
          <LinksSection />
        </TabsContent>
        
        <TabsContent value="display" className="space-y-6">
          <DisplaySettingsSection />
        </TabsContent>
        
        <TabsContent value="style" className="space-y-6">
          <ThemeSettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
