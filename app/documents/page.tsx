"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { DemoBanner, PageHeader } from "@/components/PageHeader";
import { DocumentType, JournalEntry } from "@/lib/types";
import { DocumentGenerator } from "@/lib/documents/documentGenerator";
import {
  FileText,
  Copy,
  Download,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Heart,
  Check,
} from "lucide-react";

export default function DocumentsPage() {
  const { data, updateData, t, lang } = useApp();
  const [docType, setDocType] = useState<DocumentType>("overallProgram");
  const [copied, setCopied] = useState(false);

  // Journal form state
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalStudent, setJournalStudent] = useState(data.students[0]?.name || "An (Illustrative)");
  const [journalObservation, setJournalObservation] = useState("");
  const [journalNextStep, setJournalNextStep] = useState("");

  const docTitles: Record<DocumentType, string> = {
    overallProgram: lang === "vi" ? "Chương trình tổng thể" : "Overall Educational Program",
    gradeProgram: lang === "vi" ? "Chương trình theo lớp" : "Grade-Level Detailed Program",
    alignmentMatrix: lang === "vi" ? "Ma trận đối chiếu (GDPT)" : "Alignment Matrix (GDPT)",
    yearPlan: lang === "vi" ? "Kế hoạch năm học" : "Academic Year Education Plan",
    timetable: lang === "vi" ? "Thời khóa biểu tuần" : "Weekly Timetable & Rhythm Plan",
    journalRecords: lang === "vi" ? "Nhật ký & Đánh giá học sinh" : "Teaching Journal & Assessment Records",
  };

  const markdownContent = DocumentGenerator.generateDocument(data, docType, lang);
  const missingHeadings = DocumentGenerator.getMissingHeadings(markdownContent, docType);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docType}-${data.gradeLevel.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddJournalEntry = () => {
    if (!journalObservation.trim()) return;

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      contentDelivered: `Storytelling & artistic session with ${journalStudent}`,
      attendanceNote: "Full attendance (illustrative)",
      observationNote: journalObservation.trim(),
      assignmentNote: "Retell story to family",
      artifactNote: "Main Lesson drawing and color study",
      periodicReportNote: journalNextStep.trim() || "Steady imaginative engagement",
    };

    updateData((prev) => ({
      ...prev,
      journalEntries: [newEntry, ...prev.journalEntries],
    }));

    setJournalObservation("");
    setJournalNextStep("");
    setShowJournalForm(false);
  };

  return (
    <div className="space-y-6">
      <DemoBanner />

      <PageHeader
        title={t.documents.title}
        subtitle={t.documents.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleCopyMarkdown} className="btn-ghost text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.common.copied : t.documents.copyMarkdownBtn}</span>
            </button>
            <button onClick={handleDownloadMarkdown} className="btn-primary text-xs">
              <Download className="w-3.5 h-3.5" />
              <span>{t.documents.downloadMdBtn}</span>
            </button>
          </div>
        }
      />

      {/* Document Type Picker Card */}
      <div className="garden-card space-y-3">
        <label className="block text-xs font-semibold text-forestDark">
          {t.documents.selectDocLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(docTitles) as DocumentType[]).map((key) => (
            <button
              key={key}
              onClick={() => setDocType(key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                docType === key
                  ? "bg-forest text-white shadow-sm"
                  : "bg-white border border-line text-ink hover:bg-forest/5"
              }`}
            >
              {docTitles[key]}
            </button>
          ))}
        </div>

        {/* Completeness Checklist */}
        {missingHeadings.length === 0 ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#E3EFE0] border border-[#BEDEBA] text-xs text-forestDark">
            <CheckCircle className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{t.documents.docCompleteBanner}</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-[#F7DDD6] border border-[#E8A99C] text-xs text-[#8A3527] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-[#8A3527]" />
              <span>{t.documents.docIncompleteBanner}</span>
            </div>
            {missingHeadings.map((h, i) => (
              <p key={i}>• {h}</p>
            ))}
          </div>
        )}
      </div>

      {/* Teaching Journal Quick-Add (Visible on journalRecords) */}
      {docType === "journalRecords" && (
        <div className="garden-card bg-[#FDFBF7] border border-line space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-forestDark flex items-center gap-2">
              <Heart className="w-4 h-4 text-terra" />
              {t.documents.journalSectionTitle}
            </h3>
            <button
              onClick={() => setShowJournalForm(!showJournalForm)}
              className="btn-ghost text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showJournalForm ? t.documents.closeJournalBtn : t.documents.addJournalBtn}</span>
            </button>
          </div>

          {showJournalForm && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forestDark mb-1">
                    {t.documents.studentLabel}
                  </label>
                  <select
                    value={journalStudent}
                    onChange={(e) => setJournalStudent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs font-medium"
                  >
                    {data.students.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-forestDark mb-1">
                    {t.documents.processObservationLabel}
                  </label>
                  <input
                    type="text"
                    value={journalObservation}
                    onChange={(e) => setJournalObservation(e.target.value)}
                    placeholder="e.g. Attentive listener, painted warm golden light with great devotion"
                    className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forestDark mb-1">
                  {t.documents.supportiveNextStepLabel}
                </label>
                <input
                  type="text"
                  value={journalNextStep}
                  onChange={(e) => setJournalNextStep(e.target.value)}
                  placeholder="e.g. Pair with a rhythmic movement circle before writing"
                  className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
                />
              </div>

              <button
                onClick={handleAddJournalEntry}
                disabled={!journalObservation.trim()}
                className="btn-primary text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.documents.saveJournalBtn}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Markdown Document Preview Card */}
      <div className="garden-card space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-forest" />
            <h3 className="font-serif text-lg font-bold text-forestDark">
              {docTitles[docType]}
            </h3>
          </div>
          <span className="badge-leaf text-xs">
            Markdown Preview
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-white border border-line max-h-[640px] overflow-y-auto prose prose-stone text-xs sm:text-sm font-sans leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans text-ink leading-relaxed">
            {markdownContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
