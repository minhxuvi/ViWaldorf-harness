"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { DemoBanner, PageHeader } from "@/components/PageHeader";
import {
  BookOpen,
  Mic,
  Brain,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from "lucide-react";

export default function DashboardPage() {
  const { data, selectedStory, t, lang } = useApp();

  // Calculate schedule stats
  const hocMinutes = data.timetable
    .filter((entry) => entry.kind === "hoc")
    .reduce((sum, entry) => sum + (entry.endMinutes - entry.startMinutes), 0);

  const sinhHoatMinutes = data.timetable
    .filter((entry) => entry.kind === "sinh-hoat")
    .reduce((sum, entry) => sum + (entry.endMinutes - entry.startMinutes), 0);

  const totalMinutes = hocMinutes + sinhHoatMinutes;

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hours`;
  };

  return (
    <div className="space-y-6">
      <DemoBanner />

      <PageHeader
        title={t.dashboard.welcomeTitle}
        subtitle={t.dashboard.welcomeSubtitle}
      />

      {/* 4 Stat Cells */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="garden-card flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#E3EFE0] text-forest flex-shrink-0">
            <BookOpen className="w-5 h-5 text-forest" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forestDark">
              {data.stories.length}
            </div>
            <div className="text-xs text-inkSoft capitalize mt-0.5">
              {t.dashboard.statStories}
            </div>
          </div>
        </div>

        <div className="garden-card flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#F7DDD6] text-terra flex-shrink-0">
            <Mic className="w-5 h-5 text-terra" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forestDark">
              {data.attempts.length}
            </div>
            <div className="text-xs text-inkSoft capitalize mt-0.5">
              {t.dashboard.statAttempts}
            </div>
          </div>
        </div>

        <div className="garden-card flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#FDF0E6] text-[#8A5A27] flex-shrink-0">
            <Brain className="w-5 h-5 text-[#8A5A27]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forestDark">
              {data.dialectRules.length}
            </div>
            <div className="text-xs text-inkSoft capitalize mt-0.5">
              {t.dashboard.statDialectRules}
            </div>
          </div>
        </div>

        <div className="garden-card flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#EAE2B7]/40 text-forest flex-shrink-0">
            <FileText className="w-5 h-5 text-forest" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-forestDark leading-tight line-clamp-1">
              6 Documents
            </div>
            <div className="text-xs text-inkSoft capitalize mt-0.5">
              {t.dashboard.statActiveDoc}
            </div>
          </div>
        </div>
      </div>

      {/* Story in Practice Card */}
      {selectedStory && (
        <div className="garden-card">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-forest" />
              <h2 className="text-lg font-serif font-bold text-forestDark">
                {t.dashboard.currentStoryTitle}
              </h2>
            </div>
            <span className="badge-leaf">
              <Sparkles className="w-3 h-3 mr-1 text-forest" />
              {t.dashboard.suggestedNextStep}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-serif font-bold text-ink">
                {lang === "vi" && selectedStory.titleVi
                  ? selectedStory.titleVi
                  : selectedStory.title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="badge-leaf text-xs">
                  Age {selectedStory.ageRange}
                </span>
                <span className="badge-terra text-xs">
                  {selectedStory.scenes.length} scenes · {selectedStory.defaultArtStyle}
                </span>
              </div>
            </div>

            <p className="text-sm text-inkSoft leading-relaxed">
              {selectedStory.goal}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/story" className="btn-primary">
                <Mic className="w-4 h-4" />
                <span>{t.dashboard.startPracticeBtn}</span>
              </Link>
              <Link href="/schedule" className="btn-ghost">
                <Calendar className="w-4 h-4" />
                <span>{t.dashboard.viewScheduleBtn}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Rhythm Breakdown Card */}
      <div className="garden-card">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-forest" />
            <h2 className="text-lg font-serif font-bold text-forestDark">
              {t.dashboard.weeklyRhythmTitle}
            </h2>
          </div>
          <span className="text-xs text-inkSoft">
            {data.timetable.length} periods · Mon–Fri
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[#E3EFE0]/60 border border-[#C5DEC0]">
            <div className="text-xs font-semibold text-forestDark">
              {t.dashboard.instructionalHours}
            </div>
            <div className="text-xl font-serif font-bold text-forest mt-1">
              {formatHours(hocMinutes)}
            </div>
            <div className="text-[11px] text-inkSoft mt-0.5">
              Main lessons, arts, handwork
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FDF0E6]/70 border border-[#E8D0B8]">
            <div className="text-xs font-semibold text-[#8A5A27]">
              {t.dashboard.routineHours}
            </div>
            <div className="text-xl font-serif font-bold text-[#A65B2E] mt-1">
              {formatHours(sinhHoatMinutes)}
            </div>
            <div className="text-[11px] text-inkSoft mt-0.5">
              Snack, movement, garden care
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F7ECD8]/60 border border-[#E7DCC4]">
            <div className="text-xs font-semibold text-forestDark">
              {t.dashboard.totalWeekTime}
            </div>
            <div className="text-xl font-serif font-bold text-ink mt-1">
              {formatHours(totalMinutes)}
            </div>
            <div className="text-[11px] text-inkSoft mt-0.5">
              Full 08:00–15:00 weekly frame
            </div>
          </div>
        </div>

        <p className="text-xs text-inkSoft italic mb-3">
          {t.dashboard.fixedWeekNotice}
        </p>

        <Link href="/schedule" className="btn-ghost text-xs">
          <span>{t.dashboard.openTimetableBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Seasonal Themes Card */}
      <div className="garden-card">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-line">
          <Compass className="w-4 h-4 text-forest" />
          <h2 className="text-lg font-serif font-bold text-forestDark">
            {t.dashboard.seasonalThemesTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.yearThemes.map((theme, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[#FDFBF5] border border-line flex items-start gap-2.5 text-xs text-ink"
            >
              <div className="w-2 h-2 rounded-full bg-forest mt-1 flex-shrink-0" />
              <span>{theme}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
