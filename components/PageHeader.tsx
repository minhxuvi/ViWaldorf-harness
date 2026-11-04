"use client";

import React from "react";

export function DemoBanner() {
  return null;
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
