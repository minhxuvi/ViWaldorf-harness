import { WaldorfArtStyle, StoryScene } from "../types";

export class ProceduralIllustrator {
  /**
   * Generates an authentic SVG data URL representing the chosen Waldorf art style.
   */
  public static generateArtSVG(scene: StoryScene, style: WaldorfArtStyle): string {
    const width = 640;
    const height = 400;
    const seed = scene.ord * 137 + scene.title.length * 31;

    switch (style) {
      case "wet-on-wet":
        return this.renderWetOnWetSVG(width, height, seed, scene.title);
      case "crayon":
        return this.renderCrayonSVG(width, height, seed, scene.title);
      case "chalkboard":
        return this.renderChalkboardSVG(width, height, seed, scene.title);
    }
  }

  private static renderWetOnWetSVG(w: number, h: number, seed: number, title: string): string {
    // Soft flowing Goethean watercolor washes: Lemon yellow (#FFF382), Vermilion rose (#E87A70), Prussian blue (#4A7B9D), Leaf green (#7FA974)
    const y1 = 40 + (seed % 40);
    const y2 = 180 + ((seed * 7) % 50);

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <filter id="watercolor-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <linearGradient id="wet-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FCF6E8" />
          <stop offset="50%" stop-color="#FDF9ED" />
          <stop offset="100%" stop-color="#F7EED8" />
        </linearGradient>
        <radialGradient id="sun-wash" cx="45%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#FFF59E" stop-opacity="0.85" />
          <stop offset="50%" stop-color="#F5B277" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#E27464" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="sky-water" cx="60%" cy="70%" r="55%">
          <stop offset="0%" stop-color="#5B8FB9" stop-opacity="0.75" />
          <stop offset="60%" stop-color="#73A992" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#9BC0A8" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#wet-paper)" />
      <g filter="url(#watercolor-blur)">
        <ellipse cx="${w * 0.45}" cy="${y1}" rx="320" ry="170" fill="url(#sun-wash)" />
        <ellipse cx="${w * 0.55}" cy="${y2}" rx="360" ry="190" fill="url(#sky-water)" />
        <path d="M 0,${h * 0.6} Q ${w * 0.25},${h * 0.52} ${w * 0.5},${h * 0.62} T ${w},${h * 0.58} L ${w},${h} L 0,${h} Z" fill="#6B9675" fill-opacity="0.55" />
        <path d="M 0,${h * 0.72} Q ${w * 0.35},${h * 0.68} ${w * 0.7},${h * 0.76} T ${w},${h * 0.7} L ${w},${h} L 0,${h} Z" fill="#47738F" fill-opacity="0.6" />
      </g>
      <text x="24" y="${h - 22}" font-family="Georgia, serif" font-size="14" fill="#2B3A2E" fill-opacity="0.65" font-style="italic">
        Wet-on-Wet Watercolor: ${this.escapeXml(title)}
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static renderCrayonSVG(w: number, h: number, seed: number, title: string): string {
    // Beeswax block crayon strokes on textured cream paper: Ochre, Terracotta, Forest Green, Warm Gold
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <pattern id="crayon-hatch" width="24" height="24" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#B85C38" stroke-width="3" stroke-opacity="0.18" />
          <line x1="6" y1="0" x2="6" y2="24" stroke="#DDA15E" stroke-width="2.5" stroke-opacity="0.22" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="#2F5D3A" stroke-width="2" stroke-opacity="0.16" />
        </pattern>
        <filter id="crayon-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="grain" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.9   0 0 0 0 0.85   0 0 0 0 0.75   0 0 0 0.12 0" />
          <feComposite in2="SourceGraphic" in="gl" operator="in" />
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="#FFF8EE" />
      <rect width="${w}" height="${h}" fill="url(#crayon-hatch)" />
      <!-- Layered block strokes -->
      <path d="M 40,320 C 140,220 280,240 380,290 C 460,330 540,280 600,310 L 600,380 L 40,380 Z" fill="#C45C4A" fill-opacity="0.65" stroke="#9A3C2A" stroke-width="3" stroke-dasharray="8 4" />
      <path d="M 60,180 C 180,120 320,160 440,110 C 510,80 560,130 600,100 L 600,260 L 60,260 Z" fill="#E9C46A" fill-opacity="0.5" />
      <circle cx="${w * 0.72}" cy="100" r="54" fill="#E76F51" fill-opacity="0.68" />
      <rect x="0" y="0" width="${w}" height="${h}" filter="url(#crayon-grain)" pointer-events="none" />
      <text x="24" y="${h - 22}" font-family="Georgia, serif" font-size="14" fill="#2B3A2E" fill-opacity="0.7" font-weight="600">
        Beeswax Crayon: ${this.escapeXml(title)}
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static renderChalkboardSVG(w: number, h: number, seed: number, title: string): string {
    // Matte dark slate blackboard (#1C2420) with luminous soft pastel chalks (Warm Yellow #FFE270, Glowing Rose #F29089, Soft Azure #8EC5FC)
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <filter id="chalk-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="slate-bg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#26342E" />
          <stop offset="100%" stop-color="#141C18" />
        </radialGradient>
      </defs>
      <!-- Slate Blackboard -->
      <rect width="${w}" height="${h}" fill="url(#slate-bg)" />
      <!-- Radiant Chalk Artwork -->
      <g filter="url(#chalk-glow)">
        <!-- Golden Star / Sun radiance -->
        <circle cx="${w * 0.5}" cy="${h * 0.4}" r="50" fill="#FFF275" fill-opacity="0.4" />
        <circle cx="${w * 0.5}" cy="${h * 0.4}" r="22" fill="#FFFBE0" fill-opacity="0.9" />
        <!-- Radiant rays -->
        ${Array.from({ length: 12 })
          .map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = w * 0.5 + Math.cos(angle) * 36;
            const y1 = h * 0.4 + Math.sin(angle) * 36;
            const x2 = w * 0.5 + Math.cos(angle) * (70 + (i % 3) * 20);
            const y2 = h * 0.4 + Math.sin(angle) * (70 + (i % 3) * 20);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFE66D" stroke-width="3" stroke-linecap="round" stroke-opacity="0.75" />`;
          })
          .join("")}
        <!-- Rolling pastel landscape lines -->
        <path d="M 0,${h * 0.75} Q ${w * 0.25},${h * 0.65} ${w * 0.5},${h * 0.72} T ${w},${h * 0.68}" stroke="#89C2D9" stroke-width="3.5" fill="none" stroke-opacity="0.8" stroke-dasharray="6 3" />
        <path d="M 0,${h * 0.85} Q ${w * 0.35},${h * 0.78} ${w * 0.7},${h * 0.84} T ${w},${h * 0.82}" stroke="#B5E48C" stroke-width="4" fill="none" stroke-opacity="0.7" stroke-dasharray="8 4" />
      </g>
      <text x="24" y="${h - 22}" font-family="Georgia, serif" font-size="14" fill="#E9F0E4" fill-opacity="0.8" font-style="italic">
        Chalkboard Drawing: ${this.escapeXml(title)}
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
  }
}
