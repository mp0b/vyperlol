"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { validateUsernameFormat } from "@/lib/username";
import { createProfileAction } from "@/server/actions/profiles";

export function NewProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [checked, setChecked] = useState<{ username: string; status: "available" | "taken" } | null>(null);
  const [pending, start] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const format = username ? validateUsernameFormat(username) : null;
  const avail: "idle" | "checking" | "available" | "taken" | "invalid" = !username
    ? "idle"
    : !format?.ok
      ? "invalid"
      : checked?.username === username
        ? checked.status
        : "checking";

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!username || !format?.ok) return;
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(username)}`);
        const data = (await res.json()) as { available: boolean };
        setChecked({ username, status: data.available ? "available" : "taken" });
      } catch {
        setChecked({ username, status: "taken" });
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [format?.ok, username]);

  const create = () => {
    start(async () => {
      const res = await createProfileAction(username);
      if (res.ok) {
        toast.success(`Profile @${res.data.username} created`);
        onOpenChange(false);
        setUsername("");
        router.refresh();
        router.push("/dashboard/editor");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new profile</DialogTitle>
          <DialogDescription>Each profile has its own link, theme, and content.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring/40">
            <span className="pl-3 text-sm text-muted-foreground">vyper.lol/</span>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
            />
            <span className="pr-3">
              {avail === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {avail === "available" && <Check className="size-4 text-[var(--success)]" />}
              {(avail === "taken" || avail === "invalid") && <X className="size-4 text-destructive" />}
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={create} disabled={pending || avail !== "available"}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Create profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
