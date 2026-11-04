import { WaldorfArtStyle, StoryScene } from "../types";

export class ProceduralIllustrator {
  /**
   * Generates an authentic SVG data URL representing the chosen Waldorf art style,
   * uniquely harmonized with the narrative content of the specific scene.
   */
  public static generateArtSVG(scene: StoryScene, style: WaldorfArtStyle): string {
    const width = 640;
    const height = 400;
    const textCorpus = (scene.title + " " + scene.summary).toLowerCase();

    switch (style) {
      case "wet-on-wet":
        return this.renderWetOnWetSVG(width, height, scene.ord, scene.title, textCorpus);
      case "crayon":
        return this.renderCrayonSVG(width, height, scene.ord, scene.title, textCorpus);
      case "chalkboard":
        return this.renderChalkboardSVG(width, height, scene.ord, scene.title, textCorpus);
    }
  }

  private static renderWetOnWetSVG(
    w: number,
    h: number,
    ord: number,
    title: string,
    text: string
  ): string {
    // Narrative-specific Goethean palettes & shapes
    const isPillarOrGod = text.includes("pillar") || text.includes("god") || text.includes("cột") || text.includes("thần");
    const isCosmicOrChaos = text.includes("universe") || text.includes("void") || text.includes("dark") || text.includes("chaos") || text.includes("vũ trụ");
    const isHeavenEarth = text.includes("heaven") || text.includes("earth") || text.includes("separated") || text.includes("trời") || text.includes("đất");

    let topColor = "#FFF59E"; // warm lemon
    let midColor = "#F5B277"; // warm amber
    let bottomColor = "#4A7B9D"; // Prussian blue
    let earthColor = "#6B9675"; // leaf green

    if (isCosmicOrChaos) {
      topColor = "#F39C12"; // primordial flame
      midColor = "#8E44AD"; // deep cosmic violet
      bottomColor = "#1B2631"; // deep void blue
      earthColor = "#2C3E50";
    } else if (isPillarOrGod) {
      topColor = "#F9E79F"; // divine light
      midColor = "#E67E22"; // terracotta strength
      bottomColor = "#2980B9"; // heavenly vault
      earthColor = "#7D6608"; // foundation earth
    } else if (isHeavenEarth) {
      topColor = "#AED6F1"; // open sky
      midColor = "#F5CBA7"; // horizon dawn
      bottomColor = "#52BE80"; // living earth
      earthColor = "#1E8449";
    } else if (ord % 3 === 1) {
      topColor = "#FFF382";
      midColor = "#E87A70";
      bottomColor = "#4A7B9D";
    } else if (ord % 3 === 2) {
      topColor = "#FAD7A0";
      midColor = "#85C1E9";
      bottomColor = "#58D68D";
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <filter id="wet-blur-${ord}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <linearGradient id="wet-paper-${ord}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FCF6E8" />
          <stop offset="100%" stop-color="#F7EED8" />
        </linearGradient>
        <radialGradient id="sun-glow-${ord}" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stop-color="${topColor}" stop-opacity="0.9" />
          <stop offset="55%" stop-color="${midColor}" stop-opacity="0.65" />
          <stop offset="100%" stop-color="${bottomColor}" stop-opacity="0.3" />
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#wet-paper-${ord})" />
      <g filter="url(#wet-blur-${ord})">
        <!-- Living sky wash -->
        <ellipse cx="${w * 0.5}" cy="${h * 0.35}" rx="${w * 0.6}" ry="${h * 0.4}" fill="url(#sun-glow-${ord})" />
        
        ${
          isPillarOrGod
            ? `<!-- Towering Pillar of Light & Stone -->
               <rect x="${w * 0.42}" y="${h * 0.15}" width="${w * 0.16}" height="${h * 0.75}" rx="30" fill="${midColor}" fill-opacity="0.75" />
               <ellipse cx="${w * 0.5}" cy="${h * 0.18}" rx="${w * 0.28}" ry="${h * 0.14}" fill="${topColor}" fill-opacity="0.8" />`
            : ""
        }

        ${
          isHeavenEarth
            ? `<!-- Vault of Heaven arched over the Earth -->
               <path d="M 0,${h * 0.55} Q ${w * 0.5},${h * 0.25} ${w},${h * 0.55} L ${w},${h} L 0,${h} Z" fill="${earthColor}" fill-opacity="0.65" />`
            : `<!-- Rolling gentle Goethean landscape waves -->
               <path d="M 0,${h * 0.58} Q ${w * 0.3},${h * 0.5} ${w * 0.6},${h * 0.62} T ${w},${h * 0.56} L ${w},${h} L 0,${h} Z" fill="${earthColor}" fill-opacity="0.6" />
               <path d="M 0,${h * 0.72} Q ${w * 0.4},${h * 0.66} ${w * 0.75},${h * 0.76} T ${w},${h * 0.7} L ${w},${h} L 0,${h} Z" fill="${bottomColor}" fill-opacity="0.55" />`
        }
      </g>
      <text x="24" y="${h - 20}" font-family="Georgia, serif" font-size="13" fill="#2B3A2E" fill-opacity="0.7" font-style="italic">
        Wet-on-Wet Watercolor: ${this.escapeXml(title)}
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static renderCrayonSVG(
    w: number,
    h: number,
    ord: number,
    title: string,
    text: string
  ): string {
    const isPillar = text.includes("pillar") || text.includes("cột") || text.includes("god");
    const isHeavenEarth = text.includes("heaven") || text.includes("earth") || text.includes("trời");

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <pattern id="crayon-hatch-${ord}" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="20" stroke="#B85C38" stroke-width="2.5" stroke-opacity="0.18" />
          <line x1="10" y1="0" x2="10" y2="20" stroke="#DDA15E" stroke-width="2" stroke-opacity="0.22" />
        </pattern>
        <filter id="crayon-grain-${ord}">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="grain" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.9 0 0 0 0 0.85 0 0 0 0 0.75 0 0 0 0.12 0" />
          <feComposite in2="SourceGraphic" in="gl" operator="in" />
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="#FFF8EE" />
      <rect width="${w}" height="${h}" fill="url(#crayon-hatch-${ord})" />
      
      <!-- Tactile Beeswax Crayon Layers -->
      ${
        isPillar
          ? `<rect x="${w * 0.42}" y="60" width="${w * 0.16}" height="300" fill="#B85C38" fill-opacity="0.7" rx="8" />
             <circle cx="${w * 0.5}" cy="60" r="50" fill="#E9C46A" fill-opacity="0.75" />
             <path d="M 40,320 C 180,280 420,290 600,320 L 600,400 L 40,400 Z" fill="#2A9D8F" fill-opacity="0.65" />`
          : isHeavenEarth
          ? `<path d="M 0,160 Q ${w * 0.5},80 ${w},160 L ${w},400 L 0,400 Z" fill="#E76F51" fill-opacity="0.5" />
             <circle cx="${w * 0.3}" cy="100" r="45" fill="#E9C46A" fill-opacity="0.8" />
             <path d="M 0,260 Q ${w * 0.5},220 ${w},260 L ${w},400 L 0,400 Z" fill="#264653" fill-opacity="0.65" />`
          : `<circle cx="${w * 0.7}" cy="110" r="50" fill="#E76F51" fill-opacity="0.7" />
             <path d="M 40,240 C 160,180 340,220 580,180 L 580,380 L 40,380 Z" fill="#E9C46A" fill-opacity="0.6" />
             <path d="M 20,310 C 180,260 380,310 620,270 L 620,400 L 20,400 Z" fill="#2A9D8F" fill-opacity="0.7" />`
      }
      <rect x="0" y="0" width="${w}" height="${h}" filter="url(#crayon-grain-${ord})" pointer-events="none" />
      <text x="24" y="${h - 20}" font-family="Georgia, serif" font-size="13" fill="#2B3A2E" fill-opacity="0.75" font-weight="600">
        Beeswax Crayon: ${this.escapeXml(title)}
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static renderChalkboardSVG(
    w: number,
    h: number,
    ord: number,
    title: string,
    text: string
  ): string {
    const isPillar = text.includes("pillar") || text.includes("cột");

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs>
        <filter id="chalk-glow-${ord}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <!-- Slate Chalkboard Base -->
      <rect width="${w}" height="${h}" fill="#1A2420" />
      
      <!-- Luminous Pastel Chalk Elements -->
      <g filter="url(#chalk-glow-${ord})">
        ${
          isPillar
            ? `<!-- Giant Pillar holding the Sky -->
               <line x1="${w * 0.5}" y1="40" x2="${w * 0.5}" y2="350" stroke="#FFE270" stroke-width="12" stroke-linecap="round" stroke-opacity="0.85" />
               <circle cx="${w * 0.5}" cy="50" r="40" stroke="#8EC5FC" stroke-width="4" fill="none" stroke-opacity="0.8" />
               <path d="M 40,350 Q ${w * 0.5},310 ${w - 40},350" stroke="#F29089" stroke-width="6" fill="none" stroke-linecap="round" />`
            : `<!-- Radiant Dawn / Horizon -->
               <circle cx="${w * 0.5}" cy="${h * 0.4}" r="55" stroke="#FFE270" stroke-width="5" fill="none" stroke-opacity="0.85" />
               <path d="M 60,${h * 0.65} Q ${w * 0.5},${h * 0.5} ${w - 60},${h * 0.65}" stroke="#8EC5FC" stroke-width="5" fill="none" stroke-linecap="round" />
               <path d="M 40,${h * 0.8} Q ${w * 0.45},${h * 0.72} ${w - 40},${h * 0.8}" stroke="#F29089" stroke-width="5" fill="none" stroke-linecap="round" />`
        }
      </g>
      <text x="24" y="${h - 20}" font-family="Georgia, serif" font-size="13" fill="#F7ECD8" fill-opacity="0.85" font-style="italic">
        Pastel Chalkboard: ${this.escapeXml(title)}
      </text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
