export type Language = "vi" | "en";

export const translations = {
  vi: {
    brand: "ViWaldorf",
    tagline: "Không gian Luyện Kể Chuyện Sư Phạm",
    header: {
      resetSeedBtn: "Khôi phục truyện mẫu",
      resetConfirm: "Khôi phục lại 3 truyện mẫu ban đầu? Các truyện tự thêm sẽ bị xóa.",
      languageLabel: "Ngôn ngữ",
    },
    story: {
      pageTitle: "Luyện Kể Chuyện",
      pageSubtitle:
        "Đi qua 5 cấp độ từ thấu hiểu linh hồn câu chuyện đến kể tự do bằng tranh gợi nhớ thuần hình ảnh. Thu âm và tự lắng nghe lại giọng kể của chính mình — hoàn toàn cục bộ, không AI chấm điểm.",
      selectStory: "Chọn câu chuyện",
      scenesCountSuffix: "phân cảnh",
      uploadFileBtn: "Tải truyện (.txt / .md)",
      addManualBtn: "Thêm truyện mới",
      closeFormBtn: "Đóng khung nhập",
      addFormTitle: "Thêm câu chuyện mới vào thư viện",
      addFormSubtitle:
        "Nhập toàn văn câu chuyện (ngắt đoạn bằng dòng trống cho từng phân cảnh). Hệ thống tách sẵn cục bộ thành đầy đủ 5 cấp độ luyện tập.",
      fieldTitle: "Tên câu chuyện",
      fieldAge: "Lứa tuổi phù hợp",
      fieldStyle: "Chất liệu tranh mặc định (Level 4)",
      fieldCulturalSpirit: "Tinh thần văn hóa & bối cảnh (tùy chọn cho Level 0)",
      fieldRhythm: "Nhịp điệu kể (tùy chọn cho Level 0)",
      fieldMetaphor: "Thông điệp ẩn dụ theo lứa tuổi (tùy chọn cho Level 0)",
      fieldFullText: "Toàn văn câu chuyện",
      saveStoryBtn: "Lưu & Tạo 5 Level luyện tập",
      levels: {
        0: {
          badge: "Level 0",
          shortTitle: "Bối cảnh & Linh hồn",
          title: "Level 0 · Không gian bối cảnh & Linh hồn câu chuyện",
          description:
            "Nắm tinh thần văn hóa, nhịp điệu kể, thông điệp ẩn dụ theo lứa tuổi và cách phát âm tên cổ trước khi đọc văn bản.",
        },
        1: {
          badge: "Level 1",
          shortTitle: "Toàn văn câu chuyện",
          title: "Level 1 · Toàn văn câu chuyện",
          description:
            "Văn phong kể chuyện đọc thành tiếng hoàn chỉnh, giàu hình ảnh và đi kèm Lưu ý giọng kể cho từng phân cảnh.",
        },
        2: {
          badge: "Level 2",
          shortTitle: "Dàn ý chi tiết",
          title: "Level 2 · Dàn ý chi tiết",
          description:
            "Luyện kể không nhìn toàn văn nhưng giữ trọn nhân vật, chi tiết bản địa hóa và nhịp cảm xúc theo lứa tuổi.",
        },
        3: {
          badge: "Level 3",
          shortTitle: "Dàn ý tóm tắt",
          title: "Level 3 · Dàn ý tóm tắt (Khung xương)",
          description:
            "1 bản khung xương duy nhất bám sát cốt truyện gốc (4–6 ý/phân cảnh).",
        },
        4: {
          badge: "Level 4",
          shortTitle: "Tranh thuần hình ảnh",
          title: "Level 4 · Tranh gợi nhớ thuần hình ảnh",
          description:
            "Mỗi phân cảnh 1 bức tranh vẽ tay truyền thống, không chữ gợi ý, giúp người kể tự tuôn chảy bằng ngôn ngữ sống của mình.",
        },
      },
      level0: {
        culturalSpiritTitle: "Tinh thần văn hóa & Không gian bối cảnh",
        rhythmTitle: "Nhịp điệu kể & Hơi thở",
        metaphorTitle: "Thông điệp ẩn dụ theo lứa tuổi",
        pronunciationTitle: "Cách phát âm tên cổ & Từ ngữ văn hóa",
        nextLevelBtn: "Bước sang Level 1: Đọc toàn văn câu chuyện",
      },
      level1: {
        viewByScene: "Xem theo từng phân cảnh",
        viewFullFlow: "Xem liền mạch toàn truyện",
        voiceNoteLabel: "Lưu ý giọng kể",
      },
      level2: {
        charactersLabel: "Nhân vật trong phân cảnh",
        localizedDetailsLabel: "Chi tiết bản địa hóa & Giác quan",
        emotionalRhythmLabel: "Nhịp cảm xúc theo lứa tuổi",
        beatsLabel: "Diễn biến chi tiết cần giữ",
      },
      level3: {
        skeletonHeader: "Khung xương cốt truyện gốc",
        pointsBadge: "ý cốt lõi",
        jumpToSceneHint: "Nhấp vào phân cảnh để đánh dấu vị trí đang kể",
      },
      level4: {
        artStyleLabel: "Chất liệu vẽ tay",
        styleWetOnWet: "Màu nước ướt-trên-ướt",
        styleCrayon: "Màu sáp ong",
        styleChalkboard: "Phấn bảng đen",
        uploadCustomImageBtn: "Chọn tranh vẽ tay từ máy",
        resetProceduralBtn: "Dùng tranh vẽ minh họa mặc định",
        swipeHint: "Dùng nút Trước/Sau, phím mũi tên ← / → hoặc vuốt ngang để chuyển phân cảnh",
      },
      nav: {
        sceneLabel: "Phân cảnh",
        ofWord: "/",
        prevScene: "Phân cảnh trước",
        nextScene: "Phân cảnh sau",
      },
      recorder: {
        recordBtn: "Thu âm",
        stopBtn: "Dừng thu",
        recordingStatus: "Đang thu âm...",
        noRecordingYet: "Nhấn Thu âm để ghi lại giọng kể của bạn và tự nghe lại.",
        latestTakeLabel: "Bản thu vừa ghi",
        takesCountLabel: "bản thu trong phiên",
        showTakesBtn: "Danh sách bản thu",
        hideTakesBtn: "Thu gọn",
        downloadTake: "Tải về",
        deleteTake: "Xóa",
        micDeniedNotice:
          "Trình duyệt chưa được cấp quyền Micro. Vui lòng cho phép sử dụng Micro để thu âm.",
        unsupportedNotice:
          "Trình duyệt này chưa hỗ trợ ghi âm trực tiếp (MediaRecorder).",
      },
    },
  },
  en: {
    brand: "ViWaldorf",
    tagline: "Pedagogical Storytelling Practice Space",
    header: {
      resetSeedBtn: "Reset Sample Stories",
      resetConfirm: "Restore the 3 original sample stories? Custom stories will be removed.",
      languageLabel: "Language",
    },
    story: {
      pageTitle: "Storytelling Practice",
      pageSubtitle:
        "Progress through 5 levels from absorbing the story's cultural soul to speaking freely from wordless hand-drawn illustrations. Record and listen back to your own voice — 100% local, zero AI grading.",
      selectStory: "Select Story",
      scenesCountSuffix: "scenes",
      uploadFileBtn: "Upload Story (.txt / .md)",
      addManualBtn: "Add New Story",
      closeFormBtn: "Close Form",
      addFormTitle: "Add a New Story to Local Library",
      addFormSubtitle:
        "Paste your story text (separate scenes with blank lines). It will be structured locally across all 5 practice levels without AI.",
      fieldTitle: "Story Title",
      fieldAge: "Target Age",
      fieldStyle: "Default Art Medium (Level 4)",
      fieldCulturalSpirit: "Cultural Spirit & Context (optional for Level 0)",
      fieldRhythm: "Storytelling Rhythm (optional for Level 0)",
      fieldMetaphor: "Age-Appropriate Metaphor (optional for Level 0)",
      fieldFullText: "Full Story Text",
      saveStoryBtn: "Save & Build 5 Practice Levels",
      levels: {
        0: {
          badge: "Level 0",
          shortTitle: "Context & Soul",
          title: "Level 0 · Context Space & Story Soul",
          description:
            "Absorb the cultural spirit, storytelling rhythm, age-appropriate metaphor, and ancient name pronunciations before reading the text.",
        },
        1: {
          badge: "Level 1",
          shortTitle: "Full Story Text",
          title: "Level 1 · Full Story Text",
          description:
            "Complete read-aloud storytelling prose rich in imagery paired with vocal delivery notes per scene.",
        },
        2: {
          badge: "Level 2",
          shortTitle: "Detailed Outline",
          title: "Level 2 · Detailed Outline",
          description:
            "Retell without the full text while preserving every character, localized detail, and age-appropriate emotional rhythm.",
        },
        3: {
          badge: "Level 3",
          shortTitle: "Summary Skeleton",
          title: "Level 3 · Summary Skeleton Outline",
          description:
            "One single unified skeleton outline closely following the original plot (4–6 points per scene).",
        },
        4: {
          badge: "Level 4",
          shortTitle: "Pure Visual Art",
          title: "Level 4 · Pure Visual Memory Illustrations",
          description:
            "One traditional hand-drawn picture per scene with zero text hints so your living spoken language flows naturally.",
        },
      },
      level0: {
        culturalSpiritTitle: "Cultural Spirit & Context Space",
        rhythmTitle: "Storytelling Rhythm & Breath",
        metaphorTitle: "Age-Appropriate Metaphor",
        pronunciationTitle: "Ancient & Cultural Name Pronunciation Guide",
        nextLevelBtn: "Continue to Level 1: Full Story Text",
      },
      level1: {
        viewByScene: "Scene by Scene",
        viewFullFlow: "Continuous Read-Aloud Flow",
        voiceNoteLabel: "Vocal Delivery Note",
      },
      level2: {
        charactersLabel: "Characters in Scene",
        localizedDetailsLabel: "Localized & Sensory Details",
        emotionalRhythmLabel: "Age-Appropriate Emotional Rhythm",
        beatsLabel: "Detailed Story Beats",
      },
      level3: {
        skeletonHeader: "Unified Original Plot Skeleton",
        pointsBadge: "core points",
        jumpToSceneHint: "Click any scene to mark where you are telling",
      },
      level4: {
        artStyleLabel: "Traditional Medium",
        styleWetOnWet: "Wet-on-Wet Watercolor",
        styleCrayon: "Beeswax Crayon",
        styleChalkboard: "Pastel Chalkboard",
        uploadCustomImageBtn: "Upload Hand-Drawn Image",
        resetProceduralBtn: "Use Default Illustration",
        swipeHint: "Use Prev/Next, arrow keys ← / →, or swipe horizontally to switch scenes",
      },
      nav: {
        sceneLabel: "Scene",
        ofWord: "/",
        prevScene: "Previous Scene",
        nextScene: "Next Scene",
      },
      recorder: {
        recordBtn: "Record",
        stopBtn: "Stop",
        recordingStatus: "Recording...",
        noRecordingYet: "Press Record to capture your voice and listen back immediately.",
        latestTakeLabel: "Latest Recording",
        takesCountLabel: "session takes",
        showTakesBtn: "Session Takes",
        hideTakesBtn: "Hide",
        downloadTake: "Download",
        deleteTake: "Delete",
        micDeniedNotice:
          "Microphone access was denied. Please grant permission in your browser to record.",
        unsupportedNotice:
          "This browser does not support direct audio recording (MediaRecorder).",
      },
    },
  },
};
