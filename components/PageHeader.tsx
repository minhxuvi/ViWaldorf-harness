"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { Sparkles } from "lucide-react";

export function DemoBanner() {
  const { t } = useApp();

  return (
    <div className="flex items-center gap-2 py-1.5 px-3 mb-4 rounded-lg bg-[#F7ECD8] border border-[#E7DCC4] text-[12.5px] text-[#51624F] font-medium w-fit">
      <Sparkles className="w-3.5 h-3.5 text-[#C45C4A]" />
      <span>{t.common.demoBadge}</span>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forestDark mb-1.5">
          {title}
        </h1>
        <p className="text-sm text-inkSoft leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
