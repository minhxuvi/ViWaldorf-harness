"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { TimetableEntry } from "@/lib/types";
import {
  Calendar,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Clock,
  User,
} from "lucide-react";

export default function SchedulePage() {
  const { data, updateData, t } = useApp();

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDay, setNewDay] = useState(2);
  const [newKind, setNewKind] = useState<"hoc" | "sinh-hoat">("hoc");
  const [newStartHour, setNewStartHour] = useState(8);
  const [newStartMin, setNewStartMin] = useState(0);
  const [newDuration, setNewDuration] = useState(60);
  const [newTitle, setNewTitle] = useState("");
  const [newTeacher, setNewTeacher] = useState("Teacher Lan");
  const [newObjective, setNewObjective] = useState("");

  const dayNames: Record<number, string> = {
    2: t.schedule.days[2],
    3: t.schedule.days[3],
    4: t.schedule.days[4],
    5: t.schedule.days[5],
    6: t.schedule.days[6],
  };

  // Timetable Integrity Validator
  const validateTimetable = () => {
    const problems: string[] = [];
    const totalMinutes = data.timetable.reduce(
      (sum, e) => sum + (e.endMinutes - e.startMinutes),
      0
    );

    // Check for overlaps per day
    for (let day = 2; day <= 6; day++) {
      const dayPeriods = data.timetable
        .filter((e) => e.day === day)
        .sort((a, b) => a.startMinutes - b.startMinutes);

      for (let i = 0; i < dayPeriods.length - 1; i++) {
        if (dayPeriods[i].endMinutes > dayPeriods[i + 1].startMinutes) {
          problems.push(
            `${dayNames[day]}: Overlap between "${dayPeriods[i].title}" and "${dayPeriods[i + 1].title}"`
          );
        }
      }
    }

    if (totalMinutes !== 2100) {
      problems.push(
        `Total weekly minutes is ${totalMinutes}m (expected standard full week is 2,100 minutes)`
      );
    }

    return problems;
  };

  const problems = validateTimetable();

  const handleAddPeriod = () => {
    if (!newTitle.trim()) return;

    const startMinutes = newStartHour * 60 + newStartMin;
    const endMinutes = startMinutes + newDuration;

    const newEntry: TimetableEntry = {
      id: `period-${Date.now()}`,
      day: newDay,
      startMinutes,
      endMinutes,
      title: newTitle.trim(),
      teacher: newTeacher.trim(),
      objective: newObjective.trim(),
      kind: newKind,
    };

    updateData((prev) => ({
      ...prev,
      timetable: [...prev.timetable, newEntry],
    }));

    setNewTitle("");
    setNewObjective("");
    setShowAddForm(false);
  };

  const handleDeletePeriod = (id: string) => {
    updateData((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((p) => p.id !== id),
    }));
  };

  const formatTime = (minutes: number) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.schedule.title}
        subtitle={t.schedule.subtitle}
        actions={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{showAddForm ? t.schedule.closeAddPeriod : t.schedule.addPeriodBtn}</span>
          </button>
        }
      />

      {/* Validation Banner */}
      {problems.length === 0 ? (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#E3EFE0] border border-[#BEDEBA] text-xs text-forestDark font-medium">
          <CheckCircle className="w-4 h-4 text-forest flex-shrink-0" />
          <span>{t.schedule.validBanner}</span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-[#F7DDD6] border border-[#E8A99C] text-xs text-[#8A3527] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#8A3527]" />
            <span>{t.schedule.problemBanner}</span>
          </div>
          {problems.map((prob, i) => (
            <p key={i}>• {prob}</p>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="badge-leaf font-semibold">● {t.schedule.legendHoc}</span>
        <span className="badge-sand font-semibold">● {t.schedule.legendSinhHoat}</span>
      </div>

      {/* Add Period Form */}
      {showAddForm && (
        <div className="garden-card bg-[#FDFBF7] border-2 border-forest/30 space-y-4">
          <h3 className="font-serif text-lg font-bold text-forestDark">
            {t.schedule.addPeriodTitle}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.schedule.dayLabel}
              </label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs font-medium"
              >
                {[2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {dayNames[d]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.schedule.typeLabel}
              </label>
              <select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as "hoc" | "sinh-hoat")}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs font-medium"
              >
                <option value="hoc">Instructional (Học)</option>
                <option value="sinh-hoat">Living Rhythm (Sinh hoạt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.schedule.startTimeLabel}
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min={8}
                  max={14}
                  value={newStartHour}
                  onChange={(e) => setNewStartHour(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg border border-line bg-white text-xs"
                />
                <span className="self-center">:</span>
                <input
                  type="number"
                  min={0}
                  max={45}
                  step={15}
                  value={newStartMin}
                  onChange={(e) => setNewStartMin(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg border border-line bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.schedule.durationLabel}
              </label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs font-medium"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 hour)</option>
                <option value={90}>90 mins</option>
                <option value={120}>120 mins (2 hours)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.schedule.periodTitleLabel}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Wet-on-Wet Painting / Story Circle"
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.schedule.teacherLabel}
              </label>
              <input
                type="text"
                value={newTeacher}
                onChange={(e) => setNewTeacher(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forestDark mb-1">
              {t.schedule.objectiveLabel}
            </label>
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="e.g. Experience Goethean color warmth and quiet concentration"
              className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
            />
          </div>

          <button onClick={handleAddPeriod} className="btn-primary text-xs">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.schedule.savePeriodBtn}</span>
          </button>
        </div>
      )}

      {/* Monday through Friday Sections */}
      <div className="space-y-4">
        {[2, 3, 4, 5, 6].map((day) => {
          const periods = data.timetable
            .filter((p) => p.day === day)
            .sort((a, b) => a.startMinutes - b.startMinutes);

          return (
            <div key={day} className="garden-card space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="font-serif text-base font-bold text-forestDark flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest" />
                  <span>{dayNames[day]}</span>
                </h3>
                <span className="text-xs text-inkSoft">
                  {periods.length} periods · {periods.reduce((s, p) => s + (p.endMinutes - p.startMinutes), 0)} mins
                </span>
              </div>

              <div className="space-y-2">
                {periods.map((period) => {
                  const isHoc = period.kind === "hoc";
                  return (
                    <div
                      key={period.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition ${
                        isHoc
                          ? "bg-[#E6F2E2] border-[#B7D6AE]"
                          : "bg-[#FDF0E6] border-[#ECD2AE]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="font-serif font-bold text-sm text-ink whitespace-nowrap flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-forest" />
                          <span>
                            {formatTime(period.startMinutes)} – {formatTime(period.endMinutes)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-sm">
                            {period.title}
                          </div>
                          {period.objective && (
                            <p className="text-inkSoft text-[11.5px] mt-0.5">
                              {period.objective}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {period.teacher && (
                          <span className="text-[11px] text-inkSoft flex items-center gap-1">
                            <User className="w-3 h-3 text-forest" />
                            {period.teacher}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHoc ? "bg-[#CBE3C3] text-forestDark" : "bg-[#F7DDD6] text-[#8A5A27]"
                        }`}>
                          {isHoc ? "Học" : "Sinh hoạt"}
                        </span>
                        <button
                          onClick={() => handleDeletePeriod(period.id)}
                          className="text-[#B85C38] hover:text-red-700 p-1"
                          title="Delete Period"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
