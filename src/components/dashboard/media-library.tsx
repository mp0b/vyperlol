"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, FileVideo, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Asset = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  originalName: string | null;
  sizeBytes: number;
  createdAt: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ assets }: { assets: Asset[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/media/upload", { method: "POST", body });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? "Import impossible.");
      toast.success("Fichier importé.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import impossible.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiée.");
    } catch {
      toast.error("Impossible de copier l’URL.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 text-white md:p-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Médias</h2>
        <p className="mt-2 text-gray-400">Importez des images, vidéos ou fichiers audio pour vos profils et vos liens.</p>
      </div>
      <div
        className={`vy-dashboard-panel rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${dragging ? "border-orange-400 bg-orange-500/10" : "border-white/15"}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files[0]); }}
      >
        {uploading ? <Loader2 className="mx-auto mb-4 size-10 animate-spin text-orange-300" /> : <UploadCloud className="mx-auto mb-4 size-10 text-orange-300" />}
        <h3 className="text-lg font-semibold">Déposez un fichier ici</h3>
        <p className="mt-2 text-sm text-muted-foreground">JPG, PNG, WEBP, GIF, AVIF, MP4, WEBM et audio pris en charge selon les limites de votre instance.</p>
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="vy-action-primary mt-5 rounded-xl">{uploading && <Loader2 className="size-4 animate-spin" />} Choisir un fichier</Button>
        <input ref={inputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/ogg,audio/wav" onChange={(event) => { void upload(event.target.files?.[0]); }} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-semibold">Vos fichiers</h3><span className="text-sm text-muted-foreground">{assets.length} élément{assets.length === 1 ? "" : "s"}</span></div>
        {assets.length === 0 ? (
          <Card className="vy-dashboard-panel border-dashed p-12 text-center text-muted-foreground"><ImageIcon className="mx-auto mb-3 size-9" />Aucun fichier importé pour le moment.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="vy-dashboard-panel overflow-hidden border text-white">
                <div className="relative aspect-square bg-black/30">
                  {asset.type === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.thumbnailUrl ?? asset.url} alt="" className="size-full object-cover" />
                  ) : asset.type === "VIDEO" ? (
                    <div className="grid size-full place-items-center"><FileVideo className="size-10 text-orange-300" /></div>
                  ) : <div className="grid size-full place-items-center text-sm text-muted-foreground">Audio</div>}
                </div>
                <div className="space-y-2 p-3"><p className="truncate text-sm font-medium">{asset.originalName ?? "Fichier sans nom"}</p><div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{formatBytes(asset.sizeBytes)}</span><span>{new Date(asset.createdAt).toLocaleDateString("fr-FR")}</span></div><Button type="button" size="sm" variant="outline" className="vy-action-secondary w-full" onClick={() => void copyUrl(asset.url)}><Copy className="size-3.5" /> Copier l’URL</Button></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
