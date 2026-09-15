import { Flower2 } from 'lucide-react';

export function SiteLogo({ url }: { url: string }) {
  return url ? (
    // SVG verificado por servidor. <img> mantiene su contenido aislado del DOM.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} width={40} height={40} alt="" className="h-10 w-10 shrink-0 object-contain" />
  ) : <Flower2 aria-hidden="true" className="h-10 w-10 shrink-0 text-[#83D0C6]" />;
}
