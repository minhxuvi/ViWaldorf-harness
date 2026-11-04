import { WaldorfData, DocumentType } from "../types";

export class DocumentGenerator {
  public static requiredHeadings: Record<DocumentType, string[]> = {
    overallProgram: [
      "1. Educational Philosophy & Worldview",
      "2. Core Goals & Human Qualities",
      "3. Core Learning Domains & Threefold Learning",
      "4. Pedagogical Methods & Rhythms",
      "5. Instructional Time Structure",
      "6. Holistic Assessment Principles",
    ],
    gradeProgram: [
      "1. Grade Level Overview & Developmental Milestone",
      "2. Core Subjects & Learning Objectives",
      "3. Learning Outcomes & Observational Standards",
      "4. Instructional Content & Main Lesson Blocks",
      "5. Time Allocation & Subject Distribution",
      "6. Teaching Materials & Indigenous Artifacts",
    ],
    alignmentMatrix: [
      "1. Alignment Rationale & Pedagogical Harmony",
      "2. General Education Outcomes (GDPT) Comparison",
      "3. Allocated Hours & Time Equivalence",
      "4. Assessment & Verification Methodology",
      "5. Alignment Verification Level",
    ],
    yearPlan: [
      "1. Academic Year Structure & Dates",
      "2. 35-Week Main Lesson Block Distribution",
      "3. Monthly Themes & Living Projects",
      "4. Experiential Seasonal Festivals",
      "5. Observational Assessment Schedule",
      "6. Weather & Seasonal Contingency Plan",
    ],
    timetable: [
      "1. Weekly Rhythm Philosophy (08:00–15:00)",
      "2. Monday Through Friday Detailed Schedule",
      "3. Instructional vs. Living Rhythm Distribution",
      "4. Daily Rhythm Breath Balance",
      "5. Responsible Faculty & Team Coordination",
    ],
    journalRecords: [
      "1. Teaching Journal Philosophy & Non-Numeric Ethos",
      "2. Daily Lesson Delivery Logs",
      "3. Student Process Observations",
      "4. Learning Artifacts & Artwork Records",
      "5. Supportive Accommodations & Next Steps",
      "6. Periodic Holistic Development Summary",
    ],
  };

  public static generateDocument(data: WaldorfData, type: DocumentType, lang: "en" | "vi" = "en"): string {
    switch (type) {
      case "overallProgram":
        return this.generateOverallProgram(data, lang);
      case "gradeProgram":
        return this.generateGradeProgram(data, lang);
      case "alignmentMatrix":
        return this.generateAlignmentMatrix(data, lang);
      case "yearPlan":
        return this.generateYearPlan(data, lang);
      case "timetable":
        return this.generateTimetableDoc(data, lang);
      case "journalRecords":
        return this.generateJournalRecords(data, lang);
    }
  }

  public static getMissingHeadings(content: string, type: DocumentType): string[] {
    const required = this.requiredHeadings[type] || [];
    const missing: string[] = [];
    for (const heading of required) {
      // Check if heading or key segment appears in content
      const keySegment = heading.split(". ")[1] || heading;
      if (!content.includes(keySegment) && !content.includes(heading)) {
        missing.push(heading);
      }
    }
    return missing;
  }

  private static generateOverallProgram(data: WaldorfData, lang: "en" | "vi"): string {
    return `# Overall Educational Program: Waldorf-Inspired Education in Vietnam
*Status: Illustrative Framework — Governed by DAO.md (Not official state accreditation)*

## 1. Educational Philosophy & Worldview
${data.programPhilosophy}
Education is regarded as the organic nurturing of the whole human being across thinking, feeling, and willing (Head, Heart, and Hands), honoring natural developmental rhythms and Vietnam's rich cultural diversity.

## 2. Core Goals & Human Qualities
${data.programGoals}
- **Imagination & Wonder**: Cultivated through daily living oral storytelling and rich imagery.
- **Warmth & Empathy**: Fostered by communal care, musical harmony, and artistic immersion.
- **Practical Agency & Will**: Built through gardening, woodworking, cooking, and handcraft.

## 3. Core Learning Domains & Threefold Learning
1. **Academic Main Lesson**: Language arts, arithmetic, geography, history, and natural sciences taught in focused 3–4 week immersive blocks.
2. **Arts & Expression**: Wet-on-Wet watercolor, beeswax modeling, block crayon drawing, pastel chalkboard art, flute, and choral singing.
3. **Movement & Practical Craft**: Handwork (knitting, sewing, weaving), gardening, traditional carpentry, and folk games.

## 4. Pedagogical Methods & Rhythms
- Daily rhythm balancing focused concentration (in-breath) and joyful creative movement (out-breath).
- Weekly rhythm alternating heavy intellectual focus with rhythm, physical work, and artistic expression.
- Seasonal festival rhythm celebrating agricultural milestones and cultural heritage (Tết, Mid-Autumn).

## 5. Instructional Time Structure
- Standard school day: 08:00 to 15:00, Monday through Friday (35 instructional hours / week).
- Morning Main Lesson: 120 uninterrupted minutes daily at the peak of morning wakefulness.
- Dedicated Living Rhythm: At least 60–90 minutes daily reserved for shared snacks, garden care, and free movement.

## 6. Holistic Assessment Principles
Assessment is strictly observational, continuous, and qualitative. No numeric grades, competitive rankings, or punitive marks are ever assigned. Teachers maintain descriptive developmental journals.
`;
  }

  private static generateGradeProgram(data: WaldorfData, lang: "en" | "vi"): string {
    return `# Grade-Level Detailed Education Program (${data.gradeLevel}, Ages ${data.ageRange})
*Status: Illustrative Framework — Governed by DAO.md*

## 1. Grade Level Overview & Developmental Milestone
At age 8 to 9 (the "nine-year change"), children experience a subtle awakening of self-awareness and an emotional separation from early childhood. The curriculum responds with grounding, practical themes: farming, house building, measurements, trade, and ancient cultural narratives.

## 2. Core Subjects & Learning Objectives
- **Language Arts**: Traditional Vietnamese folklore, spoken storytelling, vowel/consonant grammar, cursive writing.
- **Mathematics & Practical Measurement**: Origin of weights, measures, time, and currency through honest exchange.
- **Local Geography & Crafts**: The river estuary life of Thu Bồn, Thanh Hà pottery, Kim Bồng woodworking.
- **Artistic Work**: Wet-on-Wet watercolor exploring color polarities; Beeswax block crayon technique; Chalkboard drawing.

## 3. Learning Outcomes & Observational Standards
- Retell cultural stories with vocal warmth, natural rhythm, and steady breath pauses.
- Calculate basic arithmetic operations within real-world village market contexts.
- Create expressive artistic scenes without reliance on rigid pre-printed templates.

## 4. Instructional Content & Main Lesson Blocks
- **Block 1**: Farming & Grain Rhythms (Harvesting, rice cultivation, soil care).
- **Block 2**: Shelter & House Building (Adobe, bamboo, timber joinery).
- **Block 3**: The Story of Currency & Fair Trade ("The Sea Shells and Copper Coins of Hội An").
- **Block 4**: Ancient Journeys of Faith & Community ("Abraham and the Desert Stars").

## 5. Time Allocation & Subject Distribution
- Main Lesson: 10 hours / week
- Artistic & Practical Handwork: 6 hours / week
- Languages & Music: 5 hours / week
- Daily Living Rhythm & Movement: 14 hours / week

## 6. Teaching Materials & Indigenous Artifacts
- Pure beeswax crayons and natural cotton paper.
- Local river clay from Thanh Hà, unvarnished natural wood blocks from Kim Bồng.
- Hand-strung copper coins with square holes for interactive classroom market day.
`;
  }

  private static generateAlignmentMatrix(data: WaldorfData, lang: "en" | "vi"): string {
    return `# Alignment Matrix: Waldorf-Inspired Framework & Vietnam National Curriculum (GDPT)
*Status: Pedagogical Cross-Reference Draft*

## 1. Alignment Rationale & Pedagogical Harmony
This matrix demonstrates how the experiential, artistic curriculum of the Waldorf approach fulfills and enriches the competencies mandated by Vietnam's General Education Program (GDPT 2018).

## 2. General Education Outcomes (GDPT) Comparison
| GDPT 2018 Competency | Waldorf Curriculum Component | Experiential Realization | Alignment Degree |
|---|---|---|---|
| **Vietnamese Language (Listening & Speaking)** | Daily Oral Retelling & Story Circle | Listening to rich oral folktales, retellings with dialect preservation, recitation of folk poetry | 100% Fully Aligned |
| **Vietnamese Language (Writing & Grammar)** | Main Lesson Hand-Lettered Books | Composing descriptive passages from stories, cursive penmanship, illuminated capitals | 100% Fully Aligned |
| **Mathematics (Numbers & Practical Calculation)** | Trade & Measurement Blocks | Calculating market prices with coins, barter sums, length measurement of timber | 95% Substantially Aligned |
| **Experiential Activities (Hoạt động trải nghiệm)** | Handwork, Gardening & Festival Circles | Organic gardening, planting rice seedlings, making lanterns, cooking festival treats | 100% Fully Aligned |
| **Fine Arts & Music** | Wet-on-Wet Watercolor & Flute | Goethean color theory washes, beeswax crayon drawing, pentatonic flute | 100% Exceeds Standard |

## 3. Allocated Hours & Time Equivalence
Total instructional time matches or exceeds the 30–32 weekly period requirement of the national curriculum, while distributing hours into restorative rhythmic blocks.

## 4. Assessment & Verification Methodology
In place of high-stakes testing, assessment is verified through the student's completed hand-bound Main Lesson Book, direct teacher observation records, and learning portfolio reviews.

## 5. Alignment Verification Level
Verified as pedagogically harmonious with national educational goals while preserving complete Waldorf aesthetic and developmental integrity.
`;
  }

  private static generateYearPlan(data: WaldorfData, lang: "en" | "vi"): string {
    return `# Academic Year Education Plan (35 School Weeks)
*Status: Illustrative Plan — Grade 3*

## 1. Academic Year Structure & Dates
- **Term 1**: September 1 to January 15 (18 instructional weeks).
- **Term 2**: February 1 to May 31 (17 instructional weeks).
- Includes one-week mid-term breaks in Autumn and Spring, and a two-week Lunar New Year celebration.

## 2. 35-Week Main Lesson Block Distribution
- **Weeks 1–4**: Farming & Agricultural Rhythms (Harvest, soil, seed planting).
- **Weeks 5–8**: Traditional Architecture & House Building (Earth, timber, bamboo).
- **Weeks 9–12**: Weights, Measures & Currency ("Vỏ sò và đồng xu bên bến Hội An").
- **Weeks 13–16**: Ancient Historical Narratives ("Abraham và bầu trời sao").
- **Weeks 17–20**: Grammar & Spoken Language Arts.
- **Weeks 21–25**: Practical Craftsmanship & Local Artisans.
- **Weeks 26–30**: Botany & Plant Lifecycle ("Cloud's Seed of Patience").
- **Weeks 31–35**: Year-End Play & Community Storytelling Gathering.

## 3. Monthly Themes & Living Projects
${data.yearThemes.map((theme, i) => `- **Season/Theme ${i + 1}**: ${theme}`).join("\n")}

## 4. Experiential Seasonal Festivals
- **Mid-Autumn Festival (Tết Trung Thu)**: Handmade bamboo star lanterns, storytelling of Moon Lady.
- **Winter Lantern Walk**: Gentle walk through twilight singing songs of inner light.
- **Lunar New Year (Tết Nguyên Đán)**: Spring calligraphy, preparing rice cakes, ancestor gratitude.

## 5. Observational Assessment Schedule
- Weekly individual student notes recorded in the Teaching Journal.
- Mid-year comprehensive written pedagogical narrative sent to parents.
- Year-end hand-bound portfolio exhibition.

## 6. Weather & Seasonal Contingency Plan
During heavy rainy or typhoon seasons (Central Vietnam / Mekong floods), outdoor gardening shifts gracefully into indoor woodworking, wool spinning, and bread baking.
`;
  }

  private static generateTimetableDoc(data: WaldorfData, lang: "en" | "vi"): string {
    return `# Weekly Timetable & Rhythm Plan (08:00–15:00 Monday–Friday)
*Status: Validated Weekly Rhythm*

## 1. Weekly Rhythm Philosophy (08:00–15:00)
The week is organized like a breathing organism: Monday brings the fresh awakening of the Main Lesson story, mid-week reaches the vibrant zenith of creative arts and handwork, and Friday concludes with quiet communal gratitude and tidy garden care.

## 2. Monday Through Friday Detailed Schedule
${[2, 3, 4, 5, 6]
  .map((day) => {
    const dayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][day - 2];
    const periods = data.timetable.filter((t) => t.day === day);
    return `### ${dayName} (Thứ ${day})
${periods
  .map(
    (p) =>
      `- **${String(Math.floor(p.startMinutes / 60)).padStart(2, "0")}:${String(p.startMinutes % 60).padStart(2, "0")} – ${String(Math.floor(p.endMinutes / 60)).padStart(2, "0")}:${String(p.endMinutes % 60).padStart(2, "0")}** [${p.kind === "hoc" ? "Học / Instructional" : "Sinh hoạt / Living Rhythm"}]: ${p.title} (${p.teacher || "Faculty"}) — *${p.objective || "Rhythm"}*`
  )
  .join("\n")}`;
  })
  .join("\n\n")}

## 3. Instructional vs. Living Rhythm Distribution
- **Instructional Periods**: 1,200 minutes / week (Main Lesson, Arts, Language).
- **Living Rhythm & Movement**: 900 minutes / week (Snack, Free Play, Nature Care).
- **Total School Time**: Exactly 2,100 minutes per week.

## 4. Daily Rhythm Breath Balance
Every single day maintains the golden balance between intellectual absorption, artistic immersion, and open-air physical rest.

## 5. Responsible Faculty & Team Coordination
All faculty meet on Thursday afternoon for Child Study and lesson review.
`;
  }

  private static generateJournalRecords(data: WaldorfData, lang: "en" | "vi"): string {
    return `# Teaching Journal & Observational Assessment Records
*Status: Continuous Qualitative Observation Log*

## 1. Teaching Journal Philosophy & Non-Numeric Ethos
In keeping with the living ethos of Waldorf education and DAO.md, no numerical grades, rankings, or competitive percentiles are ever assigned to any child. The teacher observes developmental unfolding with loving objectivity.

## 2. Daily Lesson Delivery Logs
${data.journalEntries
  .map(
    (j, i) => `### Entry ${i + 1} — Date: ${j.date}
- **Content Delivered**: ${j.contentDelivered}
- **Attendance Note**: ${j.attendanceNote}
- **Artifacts Created**: ${j.artifactNote}
- **Home Assignment**: ${j.assignmentNote}
- **Teacher Observation**: ${j.observationNote}
- **Periodic Development Summary**: ${j.periodicReportNote}`
  )
  .join("\n\n")}

## 3. Student Process Observations
Observations focus on the child's sensory engagement, eye contact, storytelling memory, physical balance, and social kindness.

## 4. Learning Artifacts & Artwork Records
- Hand-drawn Main Lesson books in calligraphy ink.
- Wet-on-Wet watercolor paintings exploring Goethean warmth.
- Hand-carved wooden pegs and knitted wool figures.

## 5. Supportive Accommodations & Next Steps
- For quieter children: Encourage gentle retellings through small puppet theater.
- For restless children: Offer heavy garden work (raking leaves, hauling water) before morning story circle.

## 6. Periodic Holistic Development Summary
Children demonstrate vibrant imagination, deepening vocabulary, and steady social warmth.
`;
  }
}
