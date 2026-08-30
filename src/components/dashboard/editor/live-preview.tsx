"use client";

import { useState } from "react";
import { ExternalLink, Monitor, Smartphone } from "lucide-react";
import "@/components/profile/profile.css";
import { useEditor } from "./editor-provider";
import { draftToRenderProfile } from "@/lib/editor/types";
import { ProfileRenderer } from "@/components/profile/profile-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LivePreview() {
  const { draft, data } = useEditor();
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const render = draftToRenderProfile(draft, data);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "rounded px-2 py-1 text-xs",
              device === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
            aria-label="Mobile preview"
          >
            <Smartphone className="size-4" />
          </button>
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "rounded px-2 py-1 text-xs",
              device === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
            aria-label="Desktop preview"
          >
            <Monitor className="size-4" />
          </button>
        </div>
        <span className="truncate text-xs text-muted-foreground">Live preview</span>
        <Button asChild variant="ghost" size="sm">
          <a href={`/${data.username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" /> Open
          </a>
        </Button>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--brand)_10%,transparent),transparent_60%)] p-4">
        <div
          className={cn(
            "h-full overflow-hidden rounded-2xl border border-border shadow-xl transition-all",
            device === "mobile" ? "w-[390px] max-w-full" : "w-full",
          )}
        >
          <ProfileRenderer profile={render} preview />
        </div>
      </div>
    </div>
  );
}
