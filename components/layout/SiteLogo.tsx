import { Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SiteLogoProps {
  url: string;
  className?: string;
}

export function SiteLogo({ url, className }: SiteLogoProps) {
  const containerClasses = cn(
    'flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm border border-black/5 dark:border-white/15',
    className
  );

  return (
    <div className={containerClasses}>
      {url ? (
        // SVG verificado por servidor. <img> mantiene su contenido aislado del DOM.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} width={56} height={56} alt="" className="h-full w-full object-contain" />
      ) : (
        <Flower2 aria-hidden="true" className="h-full w-full text-[#83D0C6]" />
      )}
    </div>
  );
}
