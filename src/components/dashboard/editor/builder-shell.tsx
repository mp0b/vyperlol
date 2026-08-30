import { SaveBar } from "./save-bar";

export function BuilderShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="vy-builder min-w-0 flex-1">
      <SaveBar />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:px-10">{children}</div>
    </div>
  );
}
