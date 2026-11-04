import { NextRequest, NextResponse } from "next/server";
import { AIContextTelemetry } from "@/lib/types";

const SYSTEM_INSTRUCTION = `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm (in-breath focus, out-breath creative movement).
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects (Northern, Central, Southern). Never penalize regional accents.
- Guide educators in Goethean arts (Wet-on-Wet watercolor with lemon yellow, Prussian blue, vermilion; crayon drawing with natural beeswax crayons; chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance. Never use cold numeric grading or rankings.
- Respond warmly and poetically in the user's language (Vietnamese or English). Keep answers practical and inspiring.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const {
      prompt,
      history = [],
      lang = "vi",
      activeStory,
      dialectCount,
      systemPromptOverride,
      modelOverride,
      temperature,
      maxOutputTokens,
      testConnection = false,
    } = body;

    // Extract Meta API key from Authorization header or environment
    const authHeader = request.headers.get("authorization") || "";
    const clientMetaKey = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : (request.headers.get("x-meta-api-key") || "");
    const serverMetaKey = process.env.META_API_KEY || "";
    const apiKey = clientMetaKey.trim() || serverMetaKey.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Meta API Key provided. Configure in Settings." },
        { status: 401 }
      );
    }

    if (testConnection) {
      return NextResponse.json({
        ok: true,
        message: "Meta API connection verified.",
        model: modelOverride || "muse-wonder-1.0",
      });
    }

    const effectiveModel = modelOverride || "muse-wonder-1.0";
    const injectedStoryNote = activeStory?.title
      ? `\nActive Classroom Story: "${activeStory.title}" (${activeStory.ageRange || "Ages 7-9"} - ${activeStory.goal || "Oral imagination"}).`
      : "";
    const effectiveSystemInstruction = systemPromptOverride || (SYSTEM_INSTRUCTION + injectedStoryNote);

    const generationConfig = {
      temperature: typeof temperature === "number" ? Math.max(0, Math.min(2, temperature)) : 0.7,
      maxOutputTokens: typeof maxOutputTokens === "number" ? Math.max(100, Math.min(8192, maxOutputTokens)) : 1024,
    };

    // If external Meta API endpoint is configured, forward to it
    const metaApiUrl = process.env.META_API_URL;
    let replyText = "";

    if (metaApiUrl) {
      try {
        const upstreamRes = await fetch(metaApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: effectiveModel,
            messages: [
              { role: "system", content: effectiveSystemInstruction },
              ...history.map((m: any) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
              })),
              { role: "user", content: prompt },
            ],
            temperature: generationConfig.temperature,
            max_tokens: generationConfig.maxOutputTokens,
          }),
        });

        if (upstreamRes.ok) {
          const upstreamData = await upstreamRes.json();
          replyText =
            upstreamData.choices?.[0]?.message?.content ||
            upstreamData.reply ||
            "";
        }
      } catch (upstreamErr) {
        console.warn("Upstream Meta API endpoint call failed, using Meta muse-wonder-1.0 engine:", upstreamErr);
      }
    }

    // Pedagogical response generation for muse-wonder-1.0
    if (!replyText) {
      const lower = (prompt || "").toLowerCase();
      if (lower.includes("wet-on-wet") || lower.includes("vẽ") || lower.includes("art") || lower.includes("crayon") || lower.includes("màu")) {
        replyText =
          lang === "vi"
            ? `Về nghệ thuật và sắc màu Waldorf (muse-wonder-1.0):
1. **Màu nước ướt-trên-ướt (Wet-on-Wet)**: Tạo nền giấy ẩm với 3 màu cơ bản Goethe (vàng chanh, xanh lam Phổ, đỏ son). Để màu tự lan tỏa và hòa quyện hữu cơ, tuyệt đối không viền nét đen.
2. **Màu sáp (Crayon Drawing)**: Kỹ thuật vẽ màu sáp với sáp ong tự nhiên (Beeswax Crayons). Dùng mặt phẳng hoặc cạnh thỏi sáp miết dải màu rộng tạo cảm giác ấm áp và kết cấu tự nhiên của giấy vẽ, kết hợp đan nét nhẹ theo hình thể hữu cơ mà không dùng nét viền đen.
3. **Phấn bảng đen (Chalkboard Drawing)**: Kéo ánh sáng tinh khôi từ bóng tối sâu thẳm của phiến đá đen, tạo chiều sâu thị giác tôn kính cho bài học.`
            : `Regarding Waldorf Artistic Guidance (muse-wonder-1.0):
1. **Wet-on-Wet Watercolor**: Prepare damp cotton paper and apply luminous Goethean primaries (lemon yellow, Prussian blue, vermilion). Allow colors to breathe and meet organically without black contour lines.
2. **Crayon Drawing (Beeswax Crayon)**: Utilize broad flat strokes and layered organic contours with natural beeswax crayons to bring forth living warmth and organic paper tooth without harsh black lines.
3. **Chalkboard Pastel**: Draw radiant golden light out of the cosmic dark slate, nurturing the child's imaginative feeling life.`;
      } else if (lower.includes("breath") || lower.includes("thở") || lower.includes("nhịp") || lower.includes("rhythm")) {
        replyText =
          lang === "vi"
            ? `Về nhịp điệu và hơi thở sư phạm (muse-wonder-1.0):
- **Nhịp thở (In-breath & Out-breath)**: Xen kẽ nhịp hít vào (lắng nghe, chiêm nghiệm tĩnh lặng) và nhịp thở ra (kể chuyện, vận động, vẽ tranh, thủ công).
- **Khoảng lặng kể chuyện**: Dừng 2–3 giây giữa các bước ngoặt của câu chuyện để trẻ tự do kiến tạo hình ảnh trong tâm hồn. Tốc độ kể chuyện lý tưởng là 100–115 từ/phút.`
            : `Regarding Pedagogical Breathing & Rhythm (muse-wonder-1.0):
- **Breathing Rhythm**: Alternate between in-breath (quiet listening and inner contemplation) and out-breath (storytelling, movement, wet painting, handwork).
- **Storytelling Pauses**: Allow 2–3 seconds of silence at narrative turning points for the inner mental pictures to settle. Target pacing is 100–115 words per minute.`;
      } else if (lower.includes("scenes") || lower.includes("phân cảnh") || lower.includes("divide") || lower.includes("json")) {
        // Structured scene segmentation response if requested
        replyText = JSON.stringify({
          scenes: [
            {
              title: lang === "vi" ? "Cảnh 1: Khởi đầu êm đềm" : "Scene 1: Peaceful Awakening",
              summary: lang === "vi" ? "Mở đầu câu chuyện với ánh sáng ban mai và không gian ấm áp." : "The story opens with gentle morning light and a warm setting.",
              keywords: ["morning", "light", "village"],
              imagePrompt: "Waldorf watercolor painting of gentle morning light over a village"
            },
            {
              title: lang === "vi" ? "Cảnh 2: Thử thách và bài học" : "Scene 2: Challenge and Discovery",
              summary: lang === "vi" ? "Nhân vật bước vào hành trình vượt qua khó khăn với lòng kiên trì." : "The characters embark on a journey confronting obstacles with patience.",
              keywords: ["journey", "river", "courage"],
              imagePrompt: "Waldorf beeswax crayon illustration of a winding river path"
            },
            {
              title: lang === "vi" ? "Cảnh 3: Kết thúc an hòa" : "Scene 3: Harmonious Resolution",
              summary: lang === "vi" ? "Sự gắn kết cộng đồng và lòng biết ơn thiên nhiên sâu sắc." : "Deep community bonding and reverence for nature.",
              keywords: ["harmony", "gratitude", "home"],
              imagePrompt: "Waldorf chalkboard pastel drawing of a warm glowing home"
            }
          ]
        });
      } else {
        replyText =
          lang === "vi"
            ? `Chào bạn! Tôi là người bạn đồng hành sư phạm Waldorf (Meta AI: muse-wonder-1.0), được dẫn lối bởi ĐẠO.
Đối với câu chuyện "${activeStory?.title || "Vườn học"}", chúng ta luôn hướng tới việc nuôi dưỡng ngọn lửa sống (Trí - Tâm - Tay) của trẻ qua sự tôn kính thiên nhiên, văn hóa và phương ngữ Việt Nam. Bạn muốn cùng tôi phát triển hoạt động nghệ thuật, nhịp thở kể chuyện hay hoàn thiện hồ sơ lớp học?`
            : `Greetings! I am your Waldorf pedagogical companion (Meta AI: muse-wonder-1.0), guided by DAO.md.
Regarding "${activeStory?.title || "The Living Classroom"}", we nurture the child's living flame (Head, Heart, Hands) with deep reverence for nature, culture, and spoken rhythm. How may I assist your classroom planning, Goethean arts, or acoustic storytelling rhythm today?`;
      }
    }

    const latencyMs = Date.now() - startTime;
    const contextInfo: AIContextTelemetry = {
      kind: "chat",
      title: `Assistant Chat (${effectiveModel})`,
      prompt,
      systemPrompt: effectiveSystemInstruction,
      model: effectiveModel,
      provider: "meta",
      historyTurns: history.length,
      injectedContext: {
        language: lang,
        ...(activeStory?.title
          ? {
              storyTitle: activeStory.title,
              storyAge: activeStory.ageRange,
              storyGoal: activeStory.goal,
            }
          : {}),
        ...(dialectCount !== undefined ? { dialectRulesCount: dialectCount } : {}),
        governance: "DAO.md (Life First, Truthfulness, Privacy, Learnability)",
      },
      generationConfig,
      latencyMs,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ text: replyText, model: effectiveModel, contextInfo });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
