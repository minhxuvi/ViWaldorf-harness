import { ProceduralIllustrator } from "./art/proceduralIllustrator";
import { buildRepoFileUrl, getCandidateRepoBaseUrls } from "./repoStoryLoader";
import { StoryBookMeta, StoryIllustration, StoryScene, WaldorfStory } from "./types";

export interface PdfExportOptions {
  bookId?: string;
  failedImages?: Record<string, boolean>;
  preferProceduralArt?: boolean;
  lang?: "vi" | "en";
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

export function buildFullStoryPrintableHtml(
  story: WaldorfStory,
  options?: PdfExportOptions
): string {
  const isEn = options?.lang === "en";
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

          if (ch.illustrationId && !renderedIllustrationIds.has(ch.illustrationId)) {
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
    .pdf-cover {
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
    }
    .pdf-cover-eyebrow {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #c45c4a;
      margin-bottom: 10pt;
    }
    .pdf-cover h1 {
      font-size: 24pt;
      line-height: 1.25;
      color: #1e4028;
      margin: 0 0 12pt 0;
    }
    .pdf-cover-sub {
      font-size: 12pt;
      color: #4f5e52;
      margin: 0 0 18pt 0;
    }
    .pdf-cover-meta {
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
    .pdf-cover-goal {
      max-width: 130mm;
      margin: 0 auto;
      font-size: 10.5pt;
      color: #4f5e52;
      font-style: italic;
    }
    .pdf-toc {
      page-break-after: always;
      padding-top: 6mm;
    }
    .pdf-toc h2 {
      font-size: 16pt;
      color: #1e4028;
      border-bottom: 1pt solid #e7dcc4;
      padding-bottom: 6pt;
      margin-bottom: 12pt;
    }
    .pdf-toc ol {
      padding-left: 16pt;
      margin: 0;
    }
    .pdf-toc li {
      margin-bottom: 10pt;
    }
    .toc-title {
      display: block;
      font-weight: 700;
      color: #1e4028;
    }
    .toc-meta {
      display: block;
      font-size: 9.5pt;
      color: #6b7a6e;
    }
    .pdf-book {
      page-break-before: always;
    }
    .pdf-book-header {
      padding: 10pt 12pt;
      margin-bottom: 14pt;
      background: #f7ecd8;
      border-left: 3.5pt solid #2f5d3a;
      border-radius: 4pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .pdf-book-badge {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c45c4a;
      margin: 0 0 3pt 0;
    }
    .pdf-book-header h2 {
      margin: 0 0 4pt 0;
      font-size: 16pt;
      color: #1e4028;
    }
    .pdf-book-subtitle {
      margin: 0;
      font-size: 10.5pt;
      color: #4f5e52;
      font-style: italic;
    }
    .pdf-book-soul {
      margin-top: 8pt;
      padding-top: 8pt;
      border-top: 0.5pt solid #d9cbb0;
      font-size: 9.5pt;
      color: #2b3a2e;
    }
    .pdf-book-soul p { margin: 0; }
    .pdf-section-title {
      font-size: 13pt;
      color: #c45c4a;
      border-bottom: 0.75pt solid #e7dcc4;
      padding-bottom: 3pt;
      margin: 16pt 0 10pt 0;
      break-after: avoid;
      page-break-after: avoid;
    }
    .pdf-illustration {
      margin: 12pt 0 14pt 0;
      padding: 8pt;
      border: 1pt solid #e7dcc4;
      background: #fdf8ee;
      border-radius: 6pt;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .pdf-illustration-frame {
      width: 100%;
      overflow: hidden;
      border-radius: 4pt;
    }
    .pdf-illustration img {
      display: block;
      max-width: 100%;
      max-height: 98mm;
      width: auto;
      height: auto;
      margin: 0 auto;
      object-fit: contain;
    }
    .pdf-illustration figcaption {
      margin-top: 6pt;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 8.8pt;
      color: #4f5e52;
      font-style: italic;
    }
    .pdf-chapter {
      margin-bottom: 16pt;
      padding-bottom: 10pt;
      border-bottom: 0.5pt dashed #e7dcc4;
    }
    .pdf-chapter-title {
      font-size: 12.5pt;
      color: #1e4028;
      margin: 10pt 0 6pt 0;
      break-after: avoid;
      page-break-after: avoid;
    }
    .pdf-voice-note {
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
    .pdf-voice-label {
      font-family: system-ui, -apple-system, sans-serif;
      font-style: normal;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #2f5d3a;
    }
    .pdf-voice-body p {
      margin: 2pt 0 0 0;
    }
    .pdf-passage p {
      margin: 0 0 7pt 0;
      text-align: justify;
    }
  </style>
</head>
<body>
  <section class="pdf-cover">
    <div class="pdf-cover-eyebrow">ViWaldorf · ${escapeHtml(story.styleReference || "Jakob Streit")} · ${escapeHtml(story.targetAge)}</div>
    <h1>${escapeHtml(docTitle)}</h1>
    ${story.titleEn ? `<p class="pdf-cover-sub">${escapeHtml(story.titleEn)}</p>` : ""}
    <div class="pdf-cover-meta">
      ${targetBooks.length} ${isEn ? "Books" : "Quyển"} · ${totalExportChapters} ${isEn ? "Chapters" : "Chương"} · ${totalExportIllustrations} ${isEn ? "Level 4 Illustrations" : "Tranh minh họa Level 4"}
    </div>
    <p class="pdf-cover-goal">${escapeHtml(story.goal)}</p>
  </section>

  <section class="pdf-toc">
    <h2>${isEn ? "Table of Contents" : "Mục Lục Toàn Văn"}</h2>
    <ol>
      ${tocItemsHtml}
    </ol>
  </section>

  ${booksBodyHtml}
</body>
</html>`;
}

function waitForImagesInDocument(doc: Document, timeoutMs = 15000): Promise<void> {
  const imgs = Array.from(doc.querySelectorAll("img"));
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

export async function exportStoryToPdf(
  story: WaldorfStory,
  options?: PdfExportOptions
): Promise<void> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("PDF export is only available in the browser.");
  }

  const html = buildFullStoryPrintableHtml(story, options);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const prevTitle = document.title;
  const pdfBaseName =
    options?.bookId && options.bookId !== "all"
      ? `Tu-Sang-The-Den-Giang-Sinh-${options.bookId}`
      : "Tu-Sang-The-Den-Giang-Sinh-Toan-Van";

  const cleanup = () => {
    document.title = prevTitle;
    try {
      iframe.remove();
    } catch {}
  };

  try {
    const doc = iframe.contentDocument;
    if (!doc) {
      throw new Error("Không thể khởi tạo khung in PDF trên trình duyệt.");
    }
    doc.open();
    doc.write(html);
    doc.close();

    await waitForImagesInDocument(doc, 15000);

    document.title = pdfBaseName;
    const win = iframe.contentWindow;
    if (!win) {
      throw new Error("Không thể mở hộp thoại in PDF.");
    }

    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();

    // Phòng trường hợp trình duyệt không phát sự kiện afterprint
    setTimeout(cleanup, 60000);
  } catch (err) {
    cleanup();
    throw err;
  }
}
