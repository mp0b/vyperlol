import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getActiveProfile } from "@/lib/dashboard/active-profile";
import { loadEditorState } from "@/lib/editor/load";
import { EditorProvider } from "@/components/dashboard/editor/editor-provider";
import { BuilderShell } from "@/components/dashboard/editor/builder-shell";

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const active = await getActiveProfile(user.id);
  if (!active) redirect("/onboarding");

  const state = await loadEditorState(active.id);
  if (!state) redirect("/dashboard");

  return (
    <EditorProvider key={active.id} initialDraft={state.draft} initialData={state.data}>
      <BuilderShell>{children}</BuilderShell>
    </EditorProvider>
  );
}
