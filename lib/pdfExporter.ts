import { ProceduralIllustrator } from "./art/proceduralIllustrator";
import { buildRepoFileUrl, getCandidateRepoBaseUrls } from "./repoStoryLoader";
import { StoryBookMeta, StoryIllustration, StoryScene, WaldorfStory } from "./types";

export const PRINT_ROOT_ID = "viwaldorf-print-root";
export const PRINT_STYLE_ID = "viwaldorf-print-styles";
export const SEED_PASSAGE_PLACEHOLDER_MARKER =
  "Nội dung toàn văn đang được đồng bộ từ kho GitHub";

export interface PdfExportOptions {
  bookId?: string;
  failedImages?: Record<string, boolean>;
  preferProceduralArt?: boolean;
  lang?: "vi" | "en";
  includeImages?: boolean;
}

export function hasFullStoryPassages(
  story: WaldorfStory | undefined | null
): boolean {
  if (!story || !Array.isArray(story.scenes) || story.scenes.length < 180) {
    return false;
  }
  if (!story.lastSyncedAt) {
    return false;
  }
  return story.scenes.every(
    (sc) =>
      typeof sc.passage === "string" &&
      sc.passage.trim().length > 0 &&
      !sc.passage.includes(SEED_PASSAGE_PLACEHOLDER_MARKER)
  );
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function resolveIllustrationSrcForPdf(
  illustration: StoryIllustration,
  story: WaldorfStory,
  options?: PdfExportOptions
): { src: string; fallbackSrc: string } {
  const fallbackSrc = ProceduralIllustrator.generateArtSVG(illustration, illustration.artStyle);

  if (illustration.imagePath) {
    return { src: illustration.imagePath, fallbackSrc };
  }

  if (!options?.preferProceduralArt && illustration.imageGenerated && illustration.repoImage) {
    const bases = getCandidateRepoBaseUrls(story.rawBaseUrl);
    const orderedBases = story.rawBaseUrl
      ? [story.rawBaseUrl, ...bases.filter((b) => b !== story.rawBaseUrl)]
      : bases;
    const candidates = orderedBases.map((base) =>
      buildRepoFileUrl(illustration.repoImage, base)
    );
    const activeUrl = candidates.find((url) => !options?.failedImages?.[url]);
    if (activeUrl) {
      return { src: activeUrl, fallbackSrc };
    }
  }

  return { src: fallbackSrc, fallbackSrc };
}

function renderParagraphsHtml(text: string): string {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return `<p>${escapeHtml(text)}</p>`;
  }

  return blocks
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function renderIllustrationFigureHtml(
  ill: StoryIllustration,
  story: WaldorfStory,
  options?: PdfExportOptions
): string {
  const { src, fallbackSrc } = resolveIllustrationSrcForPdf(ill, story, options);
  const captionPrefix =
    options?.lang === "en"
      ? `Illustration ${String(ill.ord).padStart(2, "0")}`
      : `Tranh ${String(ill.ord).padStart(2, "0")}`;

  return `<figure class="pdf-illustration" data-illustration-id="${escapeHtml(ill.id)}">
  <div class="pdf-illustration-frame">
    <img src="${escapeHtml(src)}" data-fallback="${escapeHtml(fallbackSrc)}" alt="" onerror="if(this.dataset.fallback && this.src !== this.dataset.fallback){this.src=this.dataset.fallback;this.removeAttribute('data-fallback');}" />
  </div>
  <figcaption>${escapeHtml(captionPrefix)} (${escapeHtml(ill.chaptersRef)}): ${escapeHtml(ill.title)}</figcaption>
</figure>`;
}

function buildSharedPdfDocumentStyles(scopePrefix: string): string {
  const s = scopePrefix;
  return `
    ${s}.pdf-cover {
      min-height: 230mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 20mm 12mm;
      border: 1.5pt solid #d9cbb0;
      background: #fdf8ee;
      border-radius: 8pt;
      text-align: center;
      page-break-after: always;
      break-after: page;
    }
    ${s}.pdf-cover-eyebrow {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #c45c4a;
      margin-bottom: 10pt;
    }
    ${s}.pdf-cover h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24pt;
      font-weight: 700;
      line-height: 1.25;
      color: #1e4028;
      margin: 0 0 12pt 0;
    }
    ${s}.pdf-cover-sub {
      font-size: 12pt;
      color: #4f5e52;
      margin: 0 0 18pt 0;
    }
    ${s}.pdf-cover-meta {
      display: inline-block;
      margin: 0 auto 18pt auto;
      padding: 6pt 14pt;
      border-radius: 999px;
      background: #e3efe0;
      color: #1e4028;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 9.5pt;
      font-weight: 600;
    }
    ${s}.pdf-cover-goal {
      max-width: 130mm;
      margin: 0 auto;
      font-size: 10.5pt;
      color: #4f5e52;
      font-style: italic;
    }
    ${s}.pdf-toc {
      page-break-after: always;
      break-after: page;
      padding-top: 6mm;
    }
    ${s}.pdf-toc h2 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 16pt;
      font-weight: 700;
      color: #1e4028;
      border-bottom: 1pt solid #e7dcc4;
      padding-bottom: 6pt;
      margin: 0 0 12pt 0;
    }
    ${s}.pdf-toc ol {
      list-style: decimal;
      padding-left: 18pt;
      margin: 0;
    }
    ${s}.pdf-toc li {
      margin-bottom: 10pt;
    }
    ${s}.toc-title {
      display: block;
      font-weight: 700;
      color: #1e4028;
    }
    ${s}.toc-meta {
      display: block;
      font-size: 9.5pt;
      color: #6b7a6e;
    }
    ${s}.pdf-book {
      page-break-before: always;
      break-before: page;
    }
    ${s}.pdf-book-header {
      padding: 10pt 12pt;
      margin-bottom: 14pt;
      background: #f7ecd8;
      border-left: 3.5pt solid #2f5d3a;
      border-radius: 4pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    ${s}.pdf-book-badge {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c45c4a;
      margin: 0 0 3pt 0;
    }
    ${s}.pdf-book-header h2 {
      font-family: Georgia, "Times New Roman", serif;
      margin: 0 0 4pt 0;
      font-size: 16pt;
      font-weight: 700;
      color: #1e4028;
    }
    ${s}.pdf-book-subtitle {
      margin: 0;
      font-size: 10.5pt;
      color: #4f5e52;
      font-style: italic;
    }
    ${s}.pdf-book-soul {
      margin-top: 8pt;
      padding-top: 8pt;
      border-top: 0.5pt solid #d9cbb0;
      font-size: 9.5pt;
      color: #2b3a2e;
    }
    ${s}.pdf-book-soul p { margin: 0; }
    ${s}.pdf-section-title {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 13pt;
      font-weight: 700;
      color: #c45c4a;
      border-bottom: 0.75pt solid #e7dcc4;
      padding-bottom: 3pt;
      margin: 16pt 0 10pt 0;
      break-after: avoid;
      page-break-after: avoid;
    }
    ${s}.pdf-illustration {
      margin: 12pt 0 14pt 0;
      padding: 8pt;
      border: 1pt solid #e7dcc4;
      background: #fdf8ee;
      border-radius: 6pt;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    ${s}.pdf-illustration-frame {
      width: 100%;
      overflow: hidden;
      border-radius: 4pt;
    }
    ${s}.pdf-illustration img {
      display: block;
      max-width: 100%;
      max-height: 98mm;
      width: auto;
      height: auto;
      margin: 0 auto;
      object-fit: contain;
    }
    ${s}.pdf-illustration figcaption {
      margin-top: 6pt;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 8.8pt;
      color: #4f5e52;
      font-style: italic;
    }
    ${s}.pdf-chapter {
      margin-bottom: 16pt;
      padding-bottom: 10pt;
      border-bottom: 0.5pt dashed #e7dcc4;
    }
    ${s}.pdf-chapter-title {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e4028;
      margin: 10pt 0 6pt 0;
      break-after: avoid;
      page-break-after: avoid;
    }
    ${s}.pdf-voice-note {
      margin: 0 0 8pt 0;
      padding: 6pt 10pt;
      border-radius: 4pt;
      background: #eef5ec;
      border-left: 2.5pt solid #2f5d3a;
      font-size: 9.4pt;
      color: #26422c;
      font-style: italic;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    ${s}.pdf-voice-label {
      font-family: system-ui, -apple-system, sans-serif;
      font-style: normal;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #2f5d3a;
    }
    ${s}.pdf-voice-body p {
      margin: 2pt 0 0 0;
    }
    ${s}.pdf-passage p {
      margin: 0 0 7pt 0;
      text-align: justify;
    }`;
}

export function buildEmbeddedPrintStyles(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }
    @media screen {
      #${PRINT_ROOT_ID} {
        position: fixed !important;
        left: -20000px !important;
        top: 0 !important;
        width: 210mm !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -1 !important;
        overflow: hidden !important;
      }
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #2b3a2e !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }
      body > *:not(#${PRINT_ROOT_ID}) {
        display: none !important;
      }
      #${PRINT_ROOT_ID} {
        display: block !important;
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        color: #2b3a2e !important;
        background: #ffffff !important;
        font-family: Georgia, "Times New Roman", serif !important;
        font-size: 11.2pt !important;
        line-height: 1.65 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    #${PRINT_ROOT_ID} * {
      box-sizing: border-box;
    }
    ${buildSharedPdfDocumentStyles(`#${PRINT_ROOT_ID} `)}
  `;
}

function buildPrintableBodyContent(
  story: WaldorfStory,
  options?: PdfExportOptions
): { docTitle: string; bodyHtml: string; isEn: boolean; includeImages: boolean } {
  const isEn = options?.lang === "en";
  const includeImages = options?.includeImages !== false;
  const allBooks: StoryBookMeta[] = story.books || [];
  const selectedBookId = options?.bookId && options.bookId !== "all" ? options.bookId : undefined;

  const targetBooks = selectedBookId
    ? allBooks.filter((b) => b.id === selectedBookId)
    : allBooks;

  const scenesByBook = new Map<string, StoryScene[]>();
  for (const sc of story.scenes) {
    if (selectedBookId && sc.bookId !== selectedBookId) continue;
    const list = scenesByBook.get(sc.bookId) || [];
    list.push(sc);
    scenesByBook.set(sc.bookId, list);
  }

  const illustrationMap = new Map((story.illustrations || []).map((il) => [il.id, il]));
  const renderedIllustrationIds = new Set<string>();

  const totalExportChapters = Array.from(scenesByBook.values()).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const totalExportIllustrations = selectedBookId
    ? (story.illustrations || []).filter((il) => il.bookId === selectedBookId).length
    : (story.illustrations || []).length;

  const tocItemsHtml = targetBooks
    .map((bk) => {
      const chCount = (scenesByBook.get(bk.id) || []).length;
      return `<li>
        <span class="toc-title">${escapeHtml(bk.title)}</span>
        <span class="toc-meta">${chCount} ${isEn ? "chapters" : "chương"} · ${escapeHtml(bk.subtitle)}</span>
      </li>`;
    })
    .join("\n");

  const booksBodyHtml = targetBooks
    .map((bk) => {
      const bookScenes = (scenesByBook.get(bk.id) || []).sort((a, b) => a.chapterNumber - b.chapterNumber);
      const bookSoul = story.soul.bookSouls?.[bk.id];

      let lastSection = "";
      const chaptersHtml = bookScenes
        .map((ch) => {
          const parts: string[] = [];

          if (ch.section && ch.section !== lastSection) {
            lastSection = ch.section;
            parts.push(`<h3 class="pdf-section-title">${escapeHtml(ch.section)}</h3>`);
          }

          if (includeImages && ch.illustrationId && !renderedIllustrationIds.has(ch.illustrationId)) {
            const ill = illustrationMap.get(ch.illustrationId);
            if (ill) {
              renderedIllustrationIds.add(ch.illustrationId);
              parts.push(renderIllustrationFigureHtml(ill, story, options));
            }
          }

          parts.push(`<article class="pdf-chapter">
  <h4 class="pdf-chapter-title">${escapeHtml(ch.title)}</h4>
  <div class="pdf-voice-note">
    <span class="pdf-voice-label">${isEn ? "Vocal Delivery Note" : "Lưu ý giọng kể"}:</span>
    <div class="pdf-voice-body">${renderParagraphsHtml(ch.voiceNote)}</div>
  </div>
  <div class="pdf-passage">
    ${renderParagraphsHtml(ch.passage)}
  </div>
</article>`);

          return parts.join("\n");
        })
        .join("\n");

      return `<section class="pdf-book">
  <header class="pdf-book-header">
    <p class="pdf-book-badge">${isEn ? `Book ${bk.number}` : `Quyển ${bk.number}`}</p>
    <h2>${escapeHtml(bk.title)}</h2>
    <p class="pdf-book-subtitle">${escapeHtml(bk.subtitle)}</p>
    ${
      bookSoul
        ? `<div class="pdf-book-soul">
      <p><strong>${isEn ? "Cultural Spirit" : "Tinh thần bối cảnh"}:</strong> ${escapeHtml(bookSoul.culturalSpirit)}</p>
    </div>`
        : ""
    }
  </header>
  ${chaptersHtml}
</section>`;
    })
    .join("\n");

  const docTitle = selectedBookId && targetBooks[0]
    ? `${story.title} — ${targetBooks[0].title}`
    : story.title;

  const bodyHtml = `<section class="pdf-cover">
    <div class="pdf-cover-eyebrow">ViWaldorf · ${escapeHtml(story.styleReference || "Jakob Streit")} · ${escapeHtml(story.targetAge)}</div>
    <h1>${escapeHtml(docTitle)}</h1>
    ${story.titleEn ? `<p class="pdf-cover-sub">${escapeHtml(story.titleEn)}</p>` : ""}
    <div class="pdf-cover-meta">
      ${targetBooks.length} ${isEn ? "Books" : "Quyển"} · ${totalExportChapters} ${isEn ? "Chapters" : "Chương"} · ${
        includeImages
          ? `${totalExportIllustrations} ${isEn ? "Level 4 Illustrations" : "Tranh minh họa Level 4"}`
          : isEn
            ? "Text-Only Edition (No Images)"
            : "Bản thuần chữ (Không kèm ảnh)"
      }
    </div>
    <p class="pdf-cover-goal">${escapeHtml(story.goal)}</p>
  </section>

  <section class="pdf-toc">
    <h2>${isEn ? "Table of Contents" : "Mục Lục Toàn Văn"}</h2>
    <ol>
      ${tocItemsHtml}
    </ol>
  </section>

  ${booksBodyHtml}`;

  return { docTitle, bodyHtml, isEn, includeImages };
}

export function buildFullStoryPrintableHtml(
  story: WaldorfStory,
  options?: PdfExportOptions
): string {
  const { docTitle, bodyHtml, isEn } = buildPrintableBodyContent(story, options);

  return `<!DOCTYPE html>
<html lang="${isEn ? "en" : "vi"}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #2b3a2e;
      background: #ffffff;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 11.2pt;
      line-height: 1.65;
    }
    ${buildSharedPdfDocumentStyles("")}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

function waitForImagesInDocument(root: ParentNode, timeoutMs = 15000): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    const timer = setTimeout(finish, timeoutMs);

    const checkAll = Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resImg) => {
            const done = () => resImg();
            const tryFallback = () => {
              const fb = img.dataset.fallback;
              if (fb && img.src !== fb) {
                img.removeAttribute("data-fallback");
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
                img.src = fb;
              } else {
                done();
              }
            };

            if (img.complete) {
              if (img.naturalWidth > 0) {
                done();
              } else {
                tryFallback();
              }
              return;
            }

            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", tryFallback, { once: true });
          })
      )
    );

    void checkAll.then(() => {
      clearTimeout(timer);
      finish();
    });
  });
}

let activePrintCleanup: (() => void) | null = null;

export async function exportStoryToPdf(
  story: WaldorfStory,
  options?: PdfExportOptions
): Promise<void> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("PDF export is only available in the browser.");
  }

  // Dọn dẹp phiên in trước nếu còn tồn tại để tránh giữ nhầm tiêu đề cũ
  if (activePrintCleanup) {
    activePrintCleanup();
  }
  document.getElementById(PRINT_ROOT_ID)?.remove();
  document.getElementById(PRINT_STYLE_ID)?.remove();

  const { bodyHtml, isEn, includeImages } = buildPrintableBodyContent(story, options);
  const styleEl = document.createElement("style");
  styleEl.id = PRINT_STYLE_ID;
  styleEl.textContent = buildEmbeddedPrintStyles();

  const printRoot = document.createElement("div");
  printRoot.id = PRINT_ROOT_ID;
  printRoot.lang = isEn ? "en" : "vi";
  printRoot.setAttribute("aria-hidden", "true");
  printRoot.innerHTML = bodyHtml;

  document.head.appendChild(styleEl);
  document.body.appendChild(printRoot);

  const prevTitle = document.title;
  const basePrefix =
    options?.bookId && options.bookId !== "all"
      ? `Tu-Sang-The-Den-Giang-Sinh-${options.bookId}`
      : "Tu-Sang-The-Den-Giang-Sinh-Toan-Van";
  const pdfBaseName = includeImages ? basePrefix : `${basePrefix}-Khong-Anh`;

  let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  let afterPrintTimer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    if (afterPrintTimer) {
      clearTimeout(afterPrintTimer);
      afterPrintTimer = null;
    }
    window.removeEventListener("afterprint", onAfterPrint);
    if (activePrintCleanup === cleanup) {
      activePrintCleanup = null;
    }
    document.title = prevTitle;
    try {
      printRoot.remove();
      styleEl.remove();
    } catch {}
  };

  const onAfterPrint = () => {
    // Giữ vùng in thêm 1.5s đề phòng iOS Safari phát afterprint sớm khi đang kết xuất PDF nhiều trang
    if (afterPrintTimer) clearTimeout(afterPrintTimer);
    afterPrintTimer = setTimeout(cleanup, 1500);
  };

  activePrintCleanup = cleanup;

  try {
    if (includeImages) {
      await waitForImagesInDocument(printRoot, 12000);
    } else if (typeof window.requestAnimationFrame === "function") {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    }

    document.title = pdfBaseName;
    window.addEventListener("afterprint", onAfterPrint, { once: true });
    window.focus();
    window.print();

    // Phòng trường hợp trình duyệt không phát sự kiện afterprint
    fallbackTimer = setTimeout(cleanup, 60000);
  } catch (err) {
    cleanup();
    throw err;
  }
}
