import type { HTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cx(
        "skeleton-shimmer rounded-2xl bg-gradient-to-r from-violet-100 via-pink-50 to-violet-100",
        className,
      )}
      {...props}
    />
  );
}

export function PageSkeleton({
  sidebar,
  header,
  children,
}: {
  sidebar?: ReactNode;
  header?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col bg-white/40">
        {header}
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="glass-card w-[420px] max-w-full p-8">
        <Skeleton className="mb-3 h-10 w-48" />
        <Skeleton className="mb-8 h-5 w-64" />
        <Skeleton className="mb-3 h-12 w-full rounded-xl" />
        <Skeleton className="mb-3 h-12 w-full rounded-xl" />
        <Skeleton className="mb-6 h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-shell">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-10 h-10 w-64" />

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="card p-6">
            <Skeleton className="mb-5 h-6 w-40" />
            <Skeleton className="mb-4 h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card p-6">
            <Skeleton className="mb-3 h-7 w-40" />
            <Skeleton className="mb-6 h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkspaceHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-violet-100 bg-white/95 px-6 py-4">
      <div>
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="flex w-80 flex-col border-r border-violet-100 bg-white/95">
      <div className="border-b border-violet-100 px-6 py-4">
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex-1 space-y-3 p-3">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-14 w-full rounded-xl" />
        ))}
      </div>
      <div className="border-t border-violet-100 p-4">
        <Skeleton className="mb-3 h-12 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </aside>
  );
}

export function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Skeleton className="mb-4 h-7 w-48 rounded-full" />
          <Skeleton className="mb-3 h-10 w-64" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-12 w-64 rounded-2xl" />
        </div>
      </div>
      <div className="glass-card mb-4 p-3">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-white p-6 shadow-[0_24px_60px_rgba(124,58,237,0.12)]">
        <Skeleton className="mb-4 h-6 w-3/4" />
        <Skeleton className="mb-4 h-6 w-full" />
        <Skeleton className="mb-4 h-6 w-5/6" />
        <Skeleton className="mb-4 h-6 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
