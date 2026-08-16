import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border bg-background p-10 text-center shadow-sm">
        <p className="text-sm font-medium">Coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This module is not built yet. Navigation and access control are in place.
        </p>
      </div>
    </div>
  );
}
