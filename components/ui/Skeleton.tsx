export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-stone-200/80 dark:bg-zinc-800/80 ${className}`} aria-hidden="true" />;
}
