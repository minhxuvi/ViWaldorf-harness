import { WaldorfArtStyle, StoryScene } from "../types";

type SceneMotif =
  | "creation-light"
  | "eden-garden"
  | "noah-ark-rainbow"
  | "babel-tower"
  | "jacob-ladder"
  | "red-sea-sinai"
  | "david-harp"
  | "solomon-temple"
  | "jonah-whale"
  | "nativity-manger"
  | "nicholas-winter"
  | "river-market"
  | "carpenter-bench"
  | "lantern-coins"
  | "grandmother-sunset"
  | "desert-journey"
  | "green-valley"
  | "starry-night"
  | "seed-earth"
  | "sprout-rain"
  | "blossom"
  | "landscape";

const NIGHT_MOTIFS = new Set<SceneMotif>([
  "starry-night",
  "creation-light",
  "jacob-ladder",
  "nativity-manger",
  "nicholas-winter",
]);

/**
 * Tạo tranh minh họa vẽ tay truyền thống bằng SVG cục bộ cho Level 4.
 * TUYỆT ĐỐI KHÔNG chứa chữ (<text>) để người kể tự do cảm nhận hình ảnh và tuôn chảy ngôn ngữ sống.
 */
export class ProceduralIllustrator {
  public static generateArtSVG(scene: StoryScene, style: WaldorfArtStyle): string {
    const width = 640;
    const height = 400;
    const headText = `${scene.slug || ""} ${scene.title}`.toLowerCase();
    const corpus = `${headText} ${scene.passage} ${scene.summaryPoints.join(" ")}`.toLowerCase();
    const motif = this.detectMotif(headText, corpus, scene.ord);

    switch (style) {
      case "wet-on-wet":
        return this.renderWetOnWetSVG(width, height, scene.ord, motif);
      case "crayon":
        return this.renderCrayonSVG(width, height, scene.ord, motif);
      case "chalkboard":
        return this.renderChalkboardSVG(width, height, scene.ord, motif);
    }
  }

  private static detectMotif(headText: string, text: string, ord: number): SceneMotif {
    // 1. Mạch sử thi 28 phân cảnh (ưu tiên đối chiếu tiêu đề & slug phân cảnh để tránh trùng từ khóa dẫn truyện chung)
    if (headText.includes("nicholas") || headText.includes("ông già noel") || headText.includes("áo choàng đỏ") || headText.includes("myra")) {
      return "nicholas-winter";
    }
    if (headText.includes("nhà thông thái") || headText.includes("mục đồng") || headText.includes("nazareth") || headText.includes("báo tin") || headText.includes("giáng sinh") || headText.includes("sông jordan")) {
      return "nativity-manger";
    }
    if (headText.includes("jonah") || headText.includes("giô-na") || headText.includes("bụng cá") || headText.includes("cá khổng lồ")) {
      return "jonah-whale";
    }
    if (headText.includes("solomon") || headText.includes("đền thờ") || headText.includes("elijah") || headText.includes("tobias") || headText.includes("isaiah") || headText.includes("jeremiah") || headText.includes("daniel") || headText.includes("maccabeus") || headText.includes("job")) {
      return "solomon-temple";
    }
    if (headText.includes("david") || headText.includes("đa-vít") || headText.includes("saul") || headText.includes("đàn chăn cừu") || headText.includes("cây thế giới")) {
      return "david-harp";
    }
    if (headText.includes("moses") || headText.includes("mô-sê") || headText.includes("biển đỏ") || headText.includes("sinai") || headText.includes("mười điều răn") || headText.includes("bụi gai")) {
      return "red-sea-sinai";
    }
    if (headText.includes("jacob") || headText.includes("gia-cốp") || headText.includes("thang ánh sáng") || headText.includes("joseph") || headText.includes("áo ngũ sắc")) {
      return "jacob-ladder";
    }
    if (headText.includes("abraham") && headText.includes("trời sao")) {
      return "starry-night";
    }
    if (headText.includes("babel") || headText.includes("nimrod") || headText.includes("abram") || headText.includes("lò lửa")) {
      return "babel-tower";
    }
    if (headText.includes("noah") || headText.includes("nô-ê") || headText.includes("đại hồng thủy") || headText.includes("cầu vồng") || headText.includes("enoch")) {
      return "noah-ark-rainbow";
    }
    if (headText.includes("khởi nguyên") || headText.includes("bảy ngày sáng thế") || headText.includes("michael") || headText.includes("mi-kha-en")) {
      return "creation-light";
    }
    if (headText.includes("địa đàng") || headText.includes("trái cấm") || headText.includes("muôn hoa") || headText.includes("cain") || headText.includes("abel")) {
      return "eden-garden";
    }

    // 2. Mạch truyện dân gian & tự nhiên Việt Nam / truyện tự thêm
    if (text.includes("vỏ sò") || text.includes("đồng xu") || text.includes("lỗ vuông") || text.includes("đèn lồng") || text.includes("lantern") || text.includes("shells") || text.includes("coins")) {
      return "lantern-coins";
    }
    if (text.includes("thợ mộc") || text.includes("kim bồng") || text.includes("ghế gỗ") || text.includes("carpenter") || text.includes("bench")) {
      return "carpenter-bench";
    }
    if (text.includes("bà cụ") || text.includes("bé mây") || text.includes("kho báu") || text.includes("grandmother") || text.includes("hoàng hôn")) {
      if (text.includes("bông hoa") || text.includes("nở hoa") || text.includes("blossom") || text.includes("flower")) {
        return "blossom";
      }
      if (text.includes("hạt giống") || text.includes("gieo") || text.includes("seed")) {
        return "seed-earth";
      }
      return "grandmother-sunset";
    }
    if (text.includes("bầu trời sao") || text.includes("ngàn sao") || text.includes("ánh sao") || text.includes("trời sao") || text.includes("stars") || text.includes("đêm sa mạc")) {
      return "starry-night";
    }
    if (text.includes("thung lũng") || text.includes("jordan") || text.includes("đồng cỏ") || text.includes("valley")) {
      return "green-valley";
    }
    if (text.includes("sa mạc") || text.includes("lữ hành") || text.includes("cát vàng") || text.includes("desert") || text.includes("ur") || text.includes("abraham")) {
      return "desert-journey";
    }
    if (text.includes("chồi xanh") || text.includes("mầm non") || text.includes("nảy mầm") || text.includes("tưới nước") || text.includes("shoot")) {
      return "sprout-rain";
    }
    if (text.includes("bông hoa") || text.includes("đóa hoa") || text.includes("blossom") || text.includes("flower")) {
      return "blossom";
    }
    if (text.includes("hạt giống") || text.includes("lòng đất") || text.includes("seed")) {
      return "seed-earth";
    }
    if (text.includes("thu bồn") || text.includes("sông") || text.includes("gốm") || text.includes("bến thuyền") || text.includes("river")) {
      return "river-market";
    }

    const fallbackOrder: SceneMotif[] = ["landscape", "river-market", "green-valley", "starry-night"];
    return fallbackOrder[(ord - 1) % fallbackOrder.length];
  }

  private static renderMotifShapes(
    w: number,
    h: number,
    motif: SceneMotif,
    palette: {
      accent: string;
      warm: string;
      earth: string;
      water: string;
      glow: string;
      dark: string;
    },
    isChalk: boolean
  ): string {
    const strokeAttr = isChalk ? `stroke="${palette.glow}" stroke-width="3" fill="none"` : "";

    switch (motif) {
      case "creation-light":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.34}" r="110" fill="${palette.glow}" fill-opacity="0.32" />
          <circle cx="${w * 0.5}" cy="${h * 0.34}" r="66" fill="${palette.warm}" fill-opacity="0.65" />
          <circle cx="${w * 0.5}" cy="${h * 0.34}" r="34" fill="${palette.glow}" fill-opacity="0.95" />
          <!-- Radiant light pillar & archangel wing arcs -->
          <path d="M ${w * 0.5},${h * 0.14} L ${w * 0.5},${h * 0.80}" stroke="${palette.glow}" stroke-width="8" stroke-linecap="round" />
          <path d="M ${w * 0.34},${h * 0.44} Q ${w * 0.5},${h * 0.24} ${w * 0.66},${h * 0.44}" stroke="${palette.accent}" stroke-width="5" stroke-linecap="round" fill="none" />
          <path d="M ${w * 0.24},${h * 0.52} Q ${w * 0.5},${h * 0.18} ${w * 0.76},${h * 0.52}" stroke="${palette.warm}" stroke-width="3" stroke-opacity="0.8" fill="none" />
          <path d="M 0,${h * 0.78} Q ${w * 0.5},${h * 0.68} ${w},${h * 0.78} L ${w},${h} L 0,${h} Z" fill="${palette.dark}" fill-opacity="0.72" />
        `;

      case "eden-garden":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.26}" r="58" fill="${palette.glow}" fill-opacity="0.76" />
          <path d="M 0,${h * 0.68} Q ${w * 0.35},${h * 0.58} ${w * 0.68},${h * 0.66} T ${w},${h * 0.64} L ${w},${h} L 0,${h} Z" fill="${palette.earth}" fill-opacity="0.68" />
          <!-- Tree of Life -->
          <path d="M ${w * 0.48},${h * 0.74} Q ${w * 0.49},${h * 0.56} ${w * 0.47},${h * 0.42} L ${w * 0.53},${h * 0.42} Q ${w * 0.51},${h * 0.56} ${w * 0.53},${h * 0.74} Z" fill="${palette.dark}" fill-opacity="0.72" />
          <circle cx="${w * 0.5}" cy="${h * 0.38}" r="56" fill="${palette.earth}" fill-opacity="0.78" />
          <circle cx="${w * 0.43}" cy="${h * 0.42}" r="40" fill="${palette.warm}" fill-opacity="0.48" />
          <circle cx="${w * 0.57}" cy="${h * 0.42}" r="40" fill="${palette.warm}" fill-opacity="0.48" />
          <circle cx="${w * 0.46}" cy="${h * 0.36}" r="9" fill="${palette.accent}" fill-opacity="0.92" />
          <circle cx="${w * 0.55}" cy="${h * 0.39}" r="8" fill="${palette.accent}" fill-opacity="0.92" />
          <circle cx="${w * 0.50}" cy="${h * 0.30}" r="8" fill="${palette.glow}" fill-opacity="0.95" />
          <path d="M ${w * 0.18},${h * 0.84} Q ${w * 0.5},${h * 0.76} ${w * 0.84},${h * 0.84} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.62" />
        `;

      case "noah-ark-rainbow":
        return `
          <!-- Covenant Rainbow Arcs -->
          <path d="M ${w * 0.12},${h * 0.66} A ${w * 0.38},${h * 0.48} 0 0 1 ${w * 0.88},${h * 0.66}" stroke="${palette.accent}" stroke-width="10" stroke-opacity="0.78" fill="none" />
          <path d="M ${w * 0.16},${h * 0.66} A ${w * 0.34},${h * 0.43} 0 0 1 ${w * 0.84},${h * 0.66}" stroke="${palette.glow}" stroke-width="10" stroke-opacity="0.82" fill="none" />
          <path d="M ${w * 0.20},${h * 0.66} A ${w * 0.30},${h * 0.38} 0 0 1 ${w * 0.80},${h * 0.66}" stroke="${palette.earth}" stroke-width="9" stroke-opacity="0.72" fill="none" />
          <!-- Ark silhouette on calm waters -->
          <path d="M ${w * 0.30},${h * 0.62} L ${w * 0.70},${h * 0.62} L ${w * 0.64},${h * 0.74} L ${w * 0.36},${h * 0.74} Z" fill="${palette.dark}" fill-opacity="0.82" />
          <rect x="${w * 0.39}" y="${h * 0.52}" width="${w * 0.22}" height="${h * 0.10}" rx="4" fill="${palette.warm}" fill-opacity="0.86" />
          <path d="M 0,${h * 0.70} Q ${w * 0.25},${h * 0.64} ${w * 0.5},${h * 0.71} T ${w},${h * 0.68} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.82" />
        `;

      case "babel-tower":
        return `
          <circle cx="${w * 0.76}" cy="${h * 0.24}" r="42" fill="${palette.glow}" fill-opacity="0.74" />
          <path d="M 0,${h * 0.74} Q ${w * 0.5},${h * 0.66} ${w},${h * 0.74} L ${w},${h} L 0,${h} Z" fill="${palette.warm}" fill-opacity="0.72" />
          <!-- Stepped Ziggurat -->
          <rect x="${w * 0.28}" y="${h * 0.60}" width="${w * 0.44}" height="${h * 0.16}" rx="4" fill="${palette.accent}" fill-opacity="0.82" />
          <rect x="${w * 0.34}" y="${h * 0.48}" width="${w * 0.32}" height="${h * 0.13}" rx="4" fill="${palette.accent}" fill-opacity="0.74" />
          <rect x="${w * 0.40}" y="${h * 0.36}" width="${w * 0.20}" height="${h * 0.13}" rx="4" fill="${palette.warm}" fill-opacity="0.85" />
          <rect x="${w * 0.45}" y="${h * 0.26}" width="${w * 0.10}" height="${h * 0.11}" rx="3" fill="${palette.glow}" fill-opacity="0.88" />
        `;

      case "jacob-ladder":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.20}" r="54" fill="${palette.glow}" fill-opacity="0.8" />
          <!-- Ladder of golden light -->
          <line x1="${w * 0.41}" y1="${h * 0.76}" x2="${w * 0.47}" y2="${h * 0.18}" stroke="${palette.glow}" stroke-width="5" stroke-linecap="round" />
          <line x1="${w * 0.59}" y1="${h * 0.76}" x2="${w * 0.53}" y2="${h * 0.18}" stroke="${palette.glow}" stroke-width="5" stroke-linecap="round" />
          <line x1="${w * 0.42}" y1="${h * 0.66}" x2="${w * 0.58}" y2="${h * 0.66}" stroke="${palette.warm}" stroke-width="4" />
          <line x1="${w * 0.435}" y1="${h * 0.54}" x2="${w * 0.565}" y2="${h * 0.54}" stroke="${palette.warm}" stroke-width="4" />
          <line x1="${w * 0.45}" y1="${h * 0.42}" x2="${w * 0.55}" y2="${h * 0.42}" stroke="${palette.warm}" stroke-width="4" />
          <line x1="${w * 0.46}" y1="${h * 0.30}" x2="${w * 0.54}" y2="${h * 0.30}" stroke="${palette.glow}" stroke-width="4" />
          <path d="M 0,${h * 0.74} Q ${w * 0.5},${h * 0.66} ${w},${h * 0.74} L ${w},${h} L 0,${h} Z" fill="${palette.dark}" fill-opacity="0.72" />
        `;

      case "red-sea-sinai":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.22}" r="42" fill="${palette.glow}" fill-opacity="0.86" />
          <!-- Sinai peak & parted sea walls -->
          <polygon points="${w * 0.32},${h * 0.68} ${w * 0.5},${h * 0.28} ${w * 0.68},${h * 0.68}" fill="${palette.accent}" fill-opacity="0.78" />
          <path d="M 0,${h * 0.54} Q ${w * 0.28},${h * 0.46} ${w * 0.36},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.86" />
          <path d="M ${w},${h * 0.54} Q ${w * 0.72},${h * 0.46} ${w * 0.64},${h} L ${w},${h} Z" fill="${palette.water}" fill-opacity="0.86" />
          <path d="M ${w * 0.36},${h} L ${w * 0.44},${h * 0.68} L ${w * 0.56},${h * 0.68} L ${w * 0.64},${h} Z" fill="${palette.warm}" fill-opacity="0.88" />
        `;

      case "david-harp":
        return `
          <circle cx="${w * 0.74}" cy="${h * 0.26}" r="46" fill="${palette.glow}" fill-opacity="0.78" />
          <path d="M 0,${h * 0.66} Q ${w * 0.45},${h * 0.54} ${w},${h * 0.68} L ${w},${h} L 0,${h} Z" fill="${palette.earth}" fill-opacity="0.72" />
          <!-- Golden shepherd's harp -->
          <path d="M ${w * 0.38},${h * 0.68} Q ${w * 0.34},${h * 0.34} ${w * 0.58},${h * 0.36} Q ${w * 0.54},${h * 0.56} ${w * 0.52},${h * 0.70} Z" fill="none" stroke="${palette.warm}" stroke-width="8" stroke-linejoin="round" />
          <line x1="${w * 0.42}" y1="${h * 0.42}" x2="${w * 0.42}" y2="${h * 0.68}" stroke="${palette.glow}" stroke-width="2.5" />
          <line x1="${w * 0.46}" y1="${h * 0.38}" x2="${w * 0.46}" y2="${h * 0.68}" stroke="${palette.glow}" stroke-width="2.5" />
          <line x1="${w * 0.50}" y1="${h * 0.37}" x2="${w * 0.50}" y2="${h * 0.69}" stroke="${palette.glow}" stroke-width="2.5" />
        `;

      case "solomon-temple":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.28}" r="64" fill="${palette.glow}" fill-opacity="0.74" />
          <!-- Temple sanctuary & sacred flame -->
          <rect x="${w * 0.28}" y="${h * 0.40}" width="${w * 0.44}" height="${h * 0.34}" rx="4" fill="${palette.warm}" fill-opacity="0.78" />
          <polygon points="${w * 0.24},${h * 0.40} ${w * 0.5},${h * 0.24} ${w * 0.76},${h * 0.40}" fill="${palette.accent}" fill-opacity="0.86" />
          <rect x="${w * 0.33}" y="${h * 0.44}" width="16" height="${h * 0.28}" rx="3" fill="${palette.glow}" fill-opacity="0.88" />
          <rect x="${w * 0.67 - 16}" y="${h * 0.44}" width="16" height="${h * 0.28}" rx="3" fill="${palette.glow}" fill-opacity="0.88" />
          <ellipse cx="${w * 0.5}" cy="${h * 0.58}" rx="18" ry="28" fill="${palette.accent}" fill-opacity="0.88" />
          <ellipse cx="${w * 0.5}" cy="${h * 0.60}" rx="9" ry="16" fill="${palette.glow}" fill-opacity="0.96" />
          <path d="M 0,${h * 0.74} L ${w},${h * 0.74} L ${w},${h} L 0,${h} Z" fill="${palette.dark}" fill-opacity="0.58" />
        `;

      case "jonah-whale":
        return `
          <circle cx="${w * 0.26}" cy="${h * 0.26}" r="40" fill="${palette.glow}" fill-opacity="0.78" />
          <!-- Great wave & gentle whale silhouette -->
          <path d="M 0,${h * 0.58} Q ${w * 0.28},${h * 0.46} ${w * 0.58},${h * 0.58} T ${w},${h * 0.54} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.76" />
          <path d="M ${w * 0.26},${h * 0.66} Q ${w * 0.48},${h * 0.44} ${w * 0.72},${h * 0.62} Q ${w * 0.80},${h * 0.54} ${w * 0.84},${h * 0.50} Q ${w * 0.80},${h * 0.66} ${w * 0.72},${h * 0.72} Q ${w * 0.48},${h * 0.80} ${w * 0.26},${h * 0.66} Z" fill="${palette.dark}" fill-opacity="0.78" />
          <path d="M 0,${h * 0.74} Q ${w * 0.35},${h * 0.66} ${w * 0.70},${h * 0.75} T ${w},${h * 0.72} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.86" />
        `;

      case "nativity-manger":
        return `
          <!-- Guiding star & radiant rays -->
          <circle cx="${w * 0.5}" cy="${h * 0.20}" r="42" fill="${palette.glow}" fill-opacity="0.45" />
          <circle cx="${w * 0.5}" cy="${h * 0.20}" r="14" fill="${palette.glow}" fill-opacity="0.98" />
          <line x1="${w * 0.5}" y1="${h * 0.08}" x2="${w * 0.5}" y2="${h * 0.34}" stroke="${palette.glow}" stroke-width="4" stroke-linecap="round" />
          <line x1="${w * 0.40}" y1="${h * 0.20}" x2="${w * 0.60}" y2="${h * 0.20}" stroke="${palette.glow}" stroke-width="4" stroke-linecap="round" />
          <polygon points="${w * 0.5},${h * 0.22} ${w * 0.34},${h * 0.68} ${w * 0.66},${h * 0.68}" fill="${palette.warm}" fill-opacity="0.24" />
          <!-- Warm shelter & golden manger glow -->
          <path d="M 0,${h * 0.72} Q ${w * 0.5},${h * 0.64} ${w},${h * 0.72} L ${w},${h} L 0,${h} Z" fill="${palette.dark}" fill-opacity="0.74" />
          <ellipse cx="${w * 0.5}" cy="${h * 0.66}" rx="48" ry="26" fill="${palette.glow}" fill-opacity="0.85" />
          <path d="M ${w * 0.42},${h * 0.66} L ${w * 0.58},${h * 0.66} L ${w * 0.55},${h * 0.75} L ${w * 0.45},${h * 0.75} Z" fill="${palette.accent}" fill-opacity="0.86" />
        `;

      case "nicholas-winter":
        return `
          <circle cx="${w * 0.78}" cy="${h * 0.22}" r="28" fill="${palette.glow}" fill-opacity="0.85" />
          <circle cx="${w * 0.22}" cy="${h * 0.18}" r="5" fill="${palette.glow}" fill-opacity="0.8" />
          <circle cx="${w * 0.38}" cy="${h * 0.28}" r="4" fill="${palette.glow}" fill-opacity="0.75" />
          <circle cx="${w * 0.60}" cy="${h * 0.16}" r="5" fill="${palette.glow}" fill-opacity="0.8" />
          <!-- Winter snow hills & warm crimson cloak silhouette with lantern glow -->
          <path d="M 0,${h * 0.70} Q ${w * 0.45},${h * 0.60} ${w},${h * 0.72} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.52" />
          <path d="M ${w * 0.42},${h * 0.76} Q ${w * 0.45},${h * 0.42} ${w * 0.50},${h * 0.42} Q ${w * 0.56},${h * 0.42} ${w * 0.60},${h * 0.76} Z" fill="${palette.accent}" fill-opacity="0.90" />
          <circle cx="${w * 0.50}" cy="${h * 0.36}" r="16" fill="${palette.warm}" fill-opacity="0.90" />
          <circle cx="${w * 0.63}" cy="${h * 0.56}" r="18" fill="${palette.glow}" fill-opacity="0.88" />
          <circle cx="${w * 0.34}" cy="${h * 0.74}" r="10" fill="${palette.warm}" fill-opacity="0.90" />
          <circle cx="${w * 0.38}" cy="${h * 0.76}" r="9" fill="${palette.glow}" fill-opacity="0.92" />
        `;

      case "river-market":
        return `
          <circle cx="${w * 0.24}" cy="${h * 0.26}" r="42" fill="${palette.glow}" fill-opacity="0.72" />
          <path d="M 0,${h * 0.56} Q ${w * 0.25},${h * 0.45} ${w * 0.55},${h * 0.55} T ${w},${h * 0.50} L ${w},${h} L 0,${h} Z" fill="${palette.earth}" fill-opacity="0.58" />
          <path d="M 0,${h * 0.68} Q ${w * 0.35},${h * 0.62} ${w * 0.72},${h * 0.70} T ${w},${h * 0.66} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.72" />
          <!-- Wooden river boat silhouette -->
          <path d="M ${w * 0.36},${h * 0.73} Q ${w * 0.5},${h * 0.80} ${w * 0.66},${h * 0.73} Q ${w * 0.52},${h * 0.76} ${w * 0.36},${h * 0.73} Z" fill="${palette.dark}" fill-opacity="0.72" />
          <ellipse cx="${w * 0.78}" cy="${h * 0.62}" rx="20" ry="26" fill="${palette.warm}" fill-opacity="0.82" />
          <ellipse cx="${w * 0.84}" cy="${h * 0.65}" rx="15" ry="20" fill="${palette.accent}" fill-opacity="0.76" />
        `;

      case "carpenter-bench":
        return `
          <circle cx="${w * 0.28}" cy="${h * 0.26}" r="76" fill="${palette.earth}" fill-opacity="0.52" />
          <circle cx="${w * 0.42}" cy="${h * 0.22}" r="64" fill="${palette.earth}" fill-opacity="0.45" />
          <path d="M ${w * 0.32},${h * 0.34} Q ${w * 0.34},${h * 0.56} ${w * 0.30},${h * 0.78} L ${w * 0.38},${h * 0.78} Q ${w * 0.37},${h * 0.54} ${w * 0.38},${h * 0.34} Z" fill="${palette.dark}" fill-opacity="0.58" />
          <path d="M 0,${h * 0.72} Q ${w * 0.5},${h * 0.64} ${w},${h * 0.72} L ${w},${h} L 0,${h} Z" fill="${palette.earth}" fill-opacity="0.65" />
          <!-- Handcrafted wooden bench -->
          <rect x="${w * 0.48}" y="${h * 0.62}" width="${w * 0.30}" height="18" rx="6" fill="${palette.warm}" fill-opacity="0.88" />
          <rect x="${w * 0.52}" y="${h * 0.66}" width="12" height="44" rx="4" fill="${palette.dark}" fill-opacity="0.75" />
          <rect x="${w * 0.72}" y="${h * 0.66}" width="12" height="44" rx="4" fill="${palette.dark}" fill-opacity="0.75" />
          <circle cx="${w * 0.76}" cy="${h * 0.28}" r="36" fill="${palette.glow}" fill-opacity="0.7" />
        `;

      case "lantern-coins":
        return `
          <path d="M 0,${h * 0.64} Q ${w * 0.5},${h * 0.58} ${w},${h * 0.64} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.72" />
          <!-- Warm glowing lanterns -->
          <ellipse cx="${w * 0.28}" cy="${h * 0.26}" rx="28" ry="34" fill="${palette.glow}" fill-opacity="0.88" />
          <ellipse cx="${w * 0.72}" cy="${h * 0.24}" rx="24" ry="30" fill="${palette.accent}" fill-opacity="0.84" />
          <!-- Sea shells and square-holed coin -->
          <path d="M ${w * 0.25},${h * 0.78} Q ${w * 0.32},${h * 0.68} ${w * 0.39},${h * 0.78} Z" fill="${palette.glow}" fill-opacity="0.85" />
          <circle cx="${w * 0.56}" cy="${h * 0.54}" r="42" fill="${palette.warm}" fill-opacity="0.88" ${strokeAttr} />
          <rect x="${w * 0.56 - 12}" y="${h * 0.54 - 12}" width="24" height="24" rx="2" fill="${palette.dark}" fill-opacity="0.75" />
        `;

      case "grandmother-sunset":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.34}" r="68" fill="${palette.glow}" fill-opacity="0.78" />
          <path d="M 0,${h * 0.64} Q ${w * 0.45},${h * 0.57} ${w},${h * 0.64} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.6" />
          <!-- Archetypal elder & child silhouettes -->
          <ellipse cx="${w * 0.43}" cy="${h * 0.66}" rx="28" ry="56" fill="${palette.accent}" fill-opacity="0.78" />
          <circle cx="${w * 0.43}" cy="${h * 0.49}" r="18" fill="${palette.warm}" fill-opacity="0.85" />
          <ellipse cx="${w * 0.54}" cy="${h * 0.72}" rx="20" ry="38" fill="${palette.earth}" fill-opacity="0.82" />
          <circle cx="${w * 0.54}" cy="${h * 0.60}" r="14" fill="${palette.glow}" fill-opacity="0.9" />
        `;

      case "desert-journey":
        return `
          <circle cx="${w * 0.75}" cy="${h * 0.26}" r="48" fill="${palette.glow}" fill-opacity="0.82" />
          <path d="M 0,${h * 0.58} Q ${w * 0.28},${h * 0.44} ${w * 0.62},${h * 0.60} T ${w},${h * 0.52} L ${w},${h} L 0,${h} Z" fill="${palette.warm}" fill-opacity="0.7" />
          <path d="M 0,${h * 0.74} Q ${w * 0.36},${h * 0.65} ${w * 0.76},${h * 0.76} T ${w},${h * 0.70} L ${w},${h} L 0,${h} Z" fill="${palette.accent}" fill-opacity="0.65" />
          <!-- Journeying figures along the ridge -->
          <ellipse cx="${w * 0.34}" cy="${h * 0.55}" rx="12" ry="26" fill="${palette.dark}" fill-opacity="0.68" />
          <ellipse cx="${w * 0.42}" cy="${h * 0.57}" rx="10" ry="22" fill="${palette.dark}" fill-opacity="0.62" />
          <ellipse cx="${w * 0.50}" cy="${h * 0.59}" rx="14" ry="18" fill="${palette.dark}" fill-opacity="0.56" />
        `;

      case "green-valley":
        return `
          <path d="M 0,${h * 0.48} Q ${w * 0.24},${h * 0.36} ${w * 0.46},${h * 0.62} L 0,${h} Z" fill="${palette.warm}" fill-opacity="0.62" />
          <path d="M ${w},${h * 0.45} Q ${w * 0.74},${h * 0.34} ${w * 0.54},${h * 0.62} L ${w},${h} Z" fill="${palette.earth}" fill-opacity="0.72" />
          <path d="M ${w * 0.44},${h * 0.60} Q ${w * 0.52},${h * 0.78} ${w * 0.42},${h} L ${w * 0.62},${h} Q ${w * 0.56},${h * 0.78} ${w * 0.54},${h * 0.60} Z" fill="${palette.water}" fill-opacity="0.76" />
          <circle cx="${w * 0.5}" cy="${h * 0.24}" r="38" fill="${palette.glow}" fill-opacity="0.76" />
        `;

      case "starry-night":
        return `
          <path d="M 0,${h * 0.74} Q ${w * 0.5},${h * 0.64} ${w},${h * 0.74} L ${w},${h} L 0,${h} Z" fill="${palette.dark}" fill-opacity="0.76" />
          <ellipse cx="${w * 0.5}" cy="${h * 0.66}" rx="14" ry="30" fill="${palette.accent}" fill-opacity="0.78" />
          <circle cx="${w * 0.5}" cy="${h * 0.56}" r="11" fill="${palette.glow}" fill-opacity="0.86" />
          <!-- Luminous constellations -->
          <circle cx="${w * 0.20}" cy="${h * 0.22}" r="9" fill="${palette.glow}" fill-opacity="0.92" />
          <circle cx="${w * 0.36}" cy="${h * 0.16}" r="6" fill="${palette.glow}" fill-opacity="0.88" />
          <circle cx="${w * 0.52}" cy="${h * 0.26}" r="11" fill="${palette.glow}" fill-opacity="0.95" />
          <circle cx="${w * 0.68}" cy="${h * 0.18}" r="7" fill="${palette.glow}" fill-opacity="0.88" />
          <circle cx="${w * 0.82}" cy="${h * 0.28}" r="8" fill="${palette.glow}" fill-opacity="0.92" />
          <circle cx="${w * 0.28}" cy="${h * 0.36}" r="5" fill="${palette.warm}" fill-opacity="0.82" />
          <circle cx="${w * 0.62}" cy="${h * 0.38}" r="5" fill="${palette.warm}" fill-opacity="0.82" />
          <circle cx="${w * 0.76}" cy="${h * 0.42}" r="6" fill="${palette.glow}" fill-opacity="0.85" />
        `;

      case "seed-earth":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.24}" r="58" fill="${palette.glow}" fill-opacity="0.75" />
          <path d="M 0,${h * 0.58} Q ${w * 0.5},${h * 0.46} ${w},${h * 0.58} L ${w},${h} L 0,${h} Z" fill="${palette.warm}" fill-opacity="0.72" />
          <path d="M 0,${h * 0.70} Q ${w * 0.5},${h * 0.62} ${w},${h * 0.70} L ${w},${h} L 0,${h} Z" fill="${palette.dark}" fill-opacity="0.58" />
          <!-- Warm seed resting inside earth -->
          <ellipse cx="${w * 0.5}" cy="${h * 0.72}" rx="24" ry="18" fill="${palette.glow}" fill-opacity="0.92" />
          <ellipse cx="${w * 0.5}" cy="${h * 0.72}" rx="12" ry="9" fill="${palette.accent}" fill-opacity="0.88" />
        `;

      case "sprout-rain":
        return `
          <circle cx="${w * 0.72}" cy="${h * 0.24}" r="44" fill="${palette.glow}" fill-opacity="0.78" />
          <path d="M 0,${h * 0.72} Q ${w * 0.5},${h * 0.64} ${w},${h * 0.72} L ${w},${h} L 0,${h} Z" fill="${palette.warm}" fill-opacity="0.7" />
          <!-- Tender green sprout -->
          <path d="M ${w * 0.5},${h * 0.72} Q ${w * 0.49},${h * 0.56} ${w * 0.5},${h * 0.44}" stroke="${palette.earth}" stroke-width="10" stroke-linecap="round" fill="none" />
          <ellipse cx="${w * 0.42}" cy="${h * 0.47}" rx="34" ry="16" transform="rotate(-24 ${w * 0.42} ${h * 0.47})" fill="${palette.earth}" fill-opacity="0.88" />
          <ellipse cx="${w * 0.58}" cy="${h * 0.44}" rx="34" ry="16" transform="rotate(24 ${w * 0.58} ${h * 0.44})" fill="${palette.earth}" fill-opacity="0.84" />
          <circle cx="${w * 0.34}" cy="${h * 0.26}" r="6" fill="${palette.water}" fill-opacity="0.75" />
          <circle cx="${w * 0.42}" cy="${h * 0.32}" r="5" fill="${palette.water}" fill-opacity="0.75" />
          <circle cx="${w * 0.54}" cy="${h * 0.22}" r="6" fill="${palette.water}" fill-opacity="0.75" />
        `;

      case "blossom":
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.38}" r="96" fill="${palette.glow}" fill-opacity="0.48" />
          <path d="M 0,${h * 0.76} Q ${w * 0.5},${h * 0.68} ${w},${h * 0.76} L ${w},${h} L 0,${h} Z" fill="${palette.earth}" fill-opacity="0.68" />
          <path d="M ${w * 0.5},${h * 0.76} Q ${w * 0.52},${h * 0.58} ${w * 0.5},${h * 0.42}" stroke="${palette.earth}" stroke-width="10" stroke-linecap="round" fill="none" />
          <!-- Radiant blossom petals -->
          <circle cx="${w * 0.5}" cy="${h * 0.30}" r="26" fill="${palette.accent}" fill-opacity="0.82" />
          <circle cx="${w * 0.42}" cy="${h * 0.38}" r="26" fill="${palette.accent}" fill-opacity="0.78" />
          <circle cx="${w * 0.58}" cy="${h * 0.38}" r="26" fill="${palette.accent}" fill-opacity="0.78" />
          <circle cx="${w * 0.45}" cy="${h * 0.46}" r="24" fill="${palette.warm}" fill-opacity="0.82" />
          <circle cx="${w * 0.55}" cy="${h * 0.46}" r="24" fill="${palette.warm}" fill-opacity="0.82" />
          <circle cx="${w * 0.5}" cy="${h * 0.38}" r="18" fill="${palette.glow}" fill-opacity="0.95" />
        `;

      default:
        return `
          <circle cx="${w * 0.5}" cy="${h * 0.32}" r="58" fill="${palette.glow}" fill-opacity="0.78" />
          <path d="M 0,${h * 0.58} Q ${w * 0.3},${h * 0.48} ${w * 0.62},${h * 0.62} T ${w},${h * 0.56} L ${w},${h} L 0,${h} Z" fill="${palette.earth}" fill-opacity="0.62" />
          <path d="M 0,${h * 0.72} Q ${w * 0.4},${h * 0.66} ${w * 0.75},${h * 0.76} T ${w},${h * 0.70} L ${w},${h} L 0,${h} Z" fill="${palette.water}" fill-opacity="0.58" />
        `;
    }
  }

  private static renderWetOnWetSVG(w: number, h: number, ord: number, motif: SceneMotif): string {
    const isNight = NIGHT_MOTIFS.has(motif);
    const palette = isNight
      ? {
          top: "#263B59",
          mid: "#6A5A9E",
          bottom: "#1B263B",
          accent: "#E09F3E",
          warm: "#F4D35E",
          earth: "#3D5A80",
          water: "#293241",
          glow: "#FFF3B0",
          dark: "#121A24",
        }
      : {
          top: "#FFF59E",
          mid: "#F5B277",
          bottom: "#4A7B9D",
          accent: "#E07A5F",
          warm: "#F2CC8F",
          earth: "#6B9675",
          water: "#4A7B9D",
          glow: "#FFF382",
          dark: "#4E3D2E",
        };

    const shapes = this.renderMotifShapes(w, h, motif, palette, false);
    const uid = `wet-${ord}-${motif}`;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <filter id="blur-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <linearGradient id="paper-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${isNight ? "#1E2D45" : "#FCF6E8"}" />
          <stop offset="100%" stop-color="${isNight ? "#141D2B" : "#F7EED8"}" />
        </linearGradient>
        <radialGradient id="wash-${uid}" cx="50%" cy="32%" r="68%">
          <stop offset="0%" stop-color="${palette.top}" stop-opacity="0.92" />
          <stop offset="55%" stop-color="${palette.mid}" stop-opacity="0.68" />
          <stop offset="100%" stop-color="${palette.bottom}" stop-opacity="0.38" />
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#paper-${uid})" />
      <g filter="url(#blur-${uid})">
        <ellipse cx="${w * 0.5}" cy="${h * 0.35}" rx="${w * 0.62}" ry="${h * 0.44}" fill="url(#wash-${uid})" />
        ${shapes}
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static renderCrayonSVG(w: number, h: number, ord: number, motif: SceneMotif): string {
    const isNight = NIGHT_MOTIFS.has(motif);
    const palette = {
      accent: "#E76F51",
      warm: "#E9C46A",
      earth: "#2A9D8F",
      water: "#3D7094",
      glow: "#FFF382",
      dark: "#4A3525",
    };

    const shapes = this.renderMotifShapes(w, h, motif, palette, false);
    const uid = `crayon-${ord}-${motif}`;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <pattern id="hatch-${uid}" width="18" height="18" patternTransform="rotate(42 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="18" stroke="#B85C38" stroke-width="2.5" stroke-opacity="0.16" />
          <line x1="9" y1="0" x2="9" y2="18" stroke="#DDA15E" stroke-width="2" stroke-opacity="0.2" />
        </pattern>
        <filter id="grain-${uid}">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="grain" />
          <feColorMatrix type="matrix" in="grain" result="tinted" values="0 0 0 0 0.85 0 0 0 0 0.80 0 0 0 0 0.70 0 0 0 0.14 0" />
          <feComposite in2="SourceGraphic" in="tinted" operator="in" />
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="${isNight ? "#242B3E" : "#FFF8EE"}" />
      <rect width="${w}" height="${h}" fill="url(#hatch-${uid})" />
      <g opacity="0.92">
        ${shapes}
      </g>
      <rect x="0" y="0" width="${w}" height="${h}" filter="url(#grain-${uid})" pointer-events="none" />
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static renderChalkboardSVG(w: number, h: number, ord: number, motif: SceneMotif): string {
    const palette = {
      accent: "#F29089",
      warm: "#F4C07A",
      earth: "#81B29A",
      water: "#8EC5FC",
      glow: "#FFE270",
      dark: "#2C3B35",
    };

    const shapes = this.renderMotifShapes(w, h, motif, palette, true);
    const uid = `chalk-${ord}-${motif}`;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <filter id="glow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="#1A2420" />
      <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="8" fill="none" stroke="#8EB285" stroke-width="2" stroke-dasharray="10 8" stroke-opacity="0.45" />
      <g filter="url(#glow-${uid})">
        ${shapes}
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  public static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
