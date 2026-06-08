"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(nextLocale: 'en' | 'ur') {
    router.replace(
      // @ts-expect-error -- pathname might not match perfectly but next-intl handles it
      {pathname, params},
      {locale: nextLocale}
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="sm" className="gap-2 px-2 h-9 rounded-lg">
          <Globe className="h-4 w-4" />
          <span className="uppercase text-xs font-bold">{locale}</span>
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-[150px] p-2 rounded-xl border-border/50">
        <DropdownMenuItem onClick={() => onSelectChange('en')} className="gap-2">
          <span className="text-lg">🇬🇧</span> English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectChange('ur')} className="gap-2">
          <span className="text-lg">🇵🇰</span> اردو
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
