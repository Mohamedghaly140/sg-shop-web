import { LucideConstruction } from "lucide-react";

export default function AdminSettingsFeature() {
  return (
    <div className="p-6">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your store preferences and integrations
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-24 gap-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <LucideConstruction className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">Coming soon</p>
          <p className="text-sm text-muted-foreground mt-1">
            Store settings and configuration options are coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
