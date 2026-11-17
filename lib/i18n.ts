export type Language = "vi" | "en";

export const translations = {
  vi: {
    brand: "ViWaldorf",
    tagline: "Luyện Kể Chuyện Sư Phạm · Từ Sáng Thế Đến Giáng Sinh",
    header: {
      languageLabel: "Ngôn ngữ",
    },
    story: {
      pageTitle: "Từ Sáng Thế Đến Giáng Sinh",
      pageSubtitle:
        "Không gian luyện kể chuyện chuyên biệt cho bộ sử thi 5 Quyển · 180 Chương · 28 Tranh minh họa (phong cách Jakob Streit, độ tuổi 9–10). Luyện tập theo 4 cấp độ từ toàn văn đến tranh thuần hình ảnh, đọc thêm bối cảnh, xuất bản PDF toàn văn kèm tranh và thu âm nghe lại cục bộ — không AI.",
      booksCountSuffix: "Quyển",
      chaptersCountSuffix: "Chương",
      illustrationsCountSuffix: "Tranh gợi nhớ",
      pdf: {
        downloadBtn: "Tải PDF Toàn văn (kèm tranh Level 4)",
        downloadingBtn: "Đang tạo bản PDF...",
        errorNotice: "Không thể khởi tạo bản PDF lúc này. Vui lòng thử lại.",
      },
      repo: {
        syncBtn: "Đồng bộ từ Repo",
        syncing: "Đang tải từ CDN...",
        syncedLabel: "Đã lưu cục bộ · Sẵn sàng ngoại tuyến",
        lastSyncedPrefix: "Đồng bộ gần nhất",
        folderPathLabel: "Thư mục / Tệp nguồn",
        openOnGitHub: "Xem trên GitHub",
        bookFilterLabel: "Chọn Quyển",
        allBooksOption: "Tất cả",
        ancientBooksTitle: "Thư viện Văn bản cổ đọc thêm",
        ancientBooksSubtitle:
          "Đọc trực tiếp từ thư mục level-0-khong-gian-boi-canh/van-ban-co/",
        ancientBookLoading: "Đang tải văn bản cổ từ CDN...",
        closeAncientBook: "Đóng văn bản",
        allCategoriesOption: "Tất cả",
        categories: {
          "cuu-uoc": "Kinh Cựu Ước",
          "tan-uoc": "Kinh Tân Ước",
          "co-thu": "Cổ Thư & Sử Truyền",
        },
      },
      contextSection: {
        openBtn: "Đọc thêm: Bối cảnh & Linh hồn câu chuyện",
        closeBtn: "Thu gọn Bối cảnh & Linh hồn",
        title: "Đọc thêm · Bối cảnh & Linh hồn câu chuyện",
        subtitle:
          "Tư liệu nền từ thư mục level-0-khong-gian-boi-canh/: tinh thần văn hóa, nhịp điệu kể (9–10 tuổi · Jakob Streit), điểm chạm ẩn dụ, cách phát âm tên cổ và 25 văn bản cổ đọc thêm.",
        culturalSpiritTitle: "Tinh thần văn hóa & Không gian bối cảnh",
        rhythmTitle: "Nhịp điệu kể chuyện & Hơi thở",
        metaphorTitle: "Điểm chạm & Ẩn dụ (9–10 tuổi)",
        pronunciationTitle: "Hướng dẫn phát âm tên riêng & địa danh cổ",
        epicOverviewToggleOpen: "Đọc Tổng quan Linh hồn Sử thi",
        epicOverviewToggleClose: "Ẩn Tổng quan Sử thi",
      },
      levels: {
        1: {
          badge: "Level 1",
          shortTitle: "Toàn văn câu chuyện",
          title: "Level 1 · Toàn văn câu chuyện (180 Chương)",
          description:
            "Văn phong kể chuyện đọc thành tiếng hoàn chỉnh cho cả 180 Chương, đi kèm Lưu ý giọng kể riêng cho từng chương.",
        },
        2: {
          badge: "Level 2",
          shortTitle: "Dàn ý chi tiết",
          title: "Level 2 · Dàn ý chi tiết (180 Chương)",
          description:
            "Luyện kể không nhìn toàn văn nhưng giữ trọn nhân vật, hình tượng trung tâm, diễn biến chi tiết và ý nghĩa từng chương.",
        },
        3: {
          badge: "Level 3",
          shortTitle: "Dàn ý tóm tắt",
          title: "Level 3 · Dàn ý tóm tắt (Khung xương 180 Chương)",
          description:
            "1 bản khung xương duy nhất bám sát mạch cốt truyện gốc xuyên suốt 180 Chương.",
        },
        4: {
          badge: "Level 4",
          shortTitle: "Tranh thuần hình ảnh",
          title: "Level 4 · Tranh gợi nhớ thuần hình ảnh (28 Tranh)",
          description:
            "28 bức tranh vẽ tay truyền thống gắn theo các Cụm Chương, hoàn toàn không chữ gợi ý, giúp người kể tự tuôn chảy bằng ngôn ngữ sống của mình.",
        },
      },
      level1: {
        viewByScene: "Xem theo từng chương",
        viewFullFlow: "Xem liền mạch các chương",
        voiceNoteLabel: "Lưu ý giọng kể",
        textSizeLabel: "Cỡ chữ",
        textSizeSmall: "Nhỏ",
        textSizeMedium: "Vừa",
        textSizeLarge: "Lớn",
        openIllustrationBtn: "Mở tranh minh họa cụm này (Level 4)",
      },
      level2: {
        charactersLabel: "Nhân vật & Hình tượng trung tâm",
        localizedDetailsLabel: "Chi tiết bản địa hóa & Nhịp dẫn",
        emotionalRhythmLabel: "Ý nghĩa & Điểm nhấn kể chuyện",
        beatsLabel: "Diễn biến chi tiết cần giữ",
      },
      level3: {
        skeletonHeader: "Khung xương cốt truyện gốc",
        pointsBadge: "ý cốt lõi",
        jumpToSceneHint: "Nhấp vào chương để đánh dấu vị trí đang kể",
        filterCurrentScene: "Tập trung chương đang chọn",
        filterAllScenes: "Tất cả chương",
        openInLevel4Btn: "Mở tranh cụm này (Level 4)",
      },
      level4: {
        illustrationLabel: "Tranh",
        prevIllustration: "Tranh trước",
        nextIllustration: "Tranh sau",
        artStyleLabel: "Chất liệu vẽ tay (dự phòng)",
        styleWetOnWet: "Màu nước ướt-trên-ướt",
        styleCrayon: "Màu sáp ong",
        styleChalkboard: "Phấn bảng đen",
        uploadCustomImageBtn: "Chọn tranh vẽ tay từ máy",
        resetProceduralBtn: "Quay lại tranh từ Repo / mặc định",
        stageModeEnter: "Chế độ Sân khấu",
        stageModeExit: "Thu gọn khung tranh",
        artModeRepoBadge: "Tranh vẽ từ Repo",
        artModeProceduralBadge: "Tranh SVG thuần hình ảnh cục bộ",
        swipeHint:
          "Dùng nút Trước/Sau, phím mũi tên ← / → hoặc vuốt ngang để chuyển tranh gợi nhớ (không hiển thị chữ gợi ý)",
      },
      nav: {
        sceneLabel: "Chương",
        ofWord: "/",
        prevScene: "Chương trước",
        nextScene: "Chương sau",
        prevLevelBtn: "Quay lại Level",
        nextLevelShortBtn: "Sang Level",
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
        currentSceneBadge: "Đang mở",
        micDeniedNotice:
          "Trình duyệt chưa được cấp quyền Micro. Vui lòng cho phép sử dụng Micro để thu âm.",
        unsupportedNotice:
          "Trình duyệt này chưa hỗ trợ ghi âm trực tiếp (MediaRecorder).",
      },
    },
  },
  en: {
    brand: "ViWaldorf",
    tagline: "Pedagogical Storytelling · From Genesis to Nativity",
    header: {
      languageLabel: "Language",
    },
    story: {
      pageTitle: "From Genesis to Nativity",
      pageSubtitle:
        "Dedicated storytelling practice studio for the 5-Book · 180-Chapter · 28-Illustration epic (Jakob Streit style, ages 9–10). Practice across 4 levels from full text to wordless visual art, read optional background context, download the full story as PDF with Level 4 illustrations, and record locally — zero AI.",
      booksCountSuffix: "Books",
      chaptersCountSuffix: "Chapters",
      illustrationsCountSuffix: "Illustrations",
      pdf: {
        downloadBtn: "Download Full Story PDF (with Level 4 Art)",
        downloadingBtn: "Preparing PDF...",
        errorNotice: "Could not prepare the PDF right now. Please try again.",
      },
      repo: {
        syncBtn: "Sync from Repo",
        syncing: "Syncing via CDN...",
        syncedLabel: "Cached locally · Ready offline",
        lastSyncedPrefix: "Last synced",
        folderPathLabel: "Source Path",
        openOnGitHub: "View on GitHub",
        bookFilterLabel: "Select Book",
        allBooksOption: "All Books",
        ancientBooksTitle: "Ancient Reference Texts",
        ancientBooksSubtitle:
          "Loaded from level-0-khong-gian-boi-canh/van-ban-co/",
        ancientBookLoading: "Loading ancient text via CDN...",
        closeAncientBook: "Close Text",
        allCategoriesOption: "All",
        categories: {
          "cuu-uoc": "Old Testament",
          "tan-uoc": "New Testament",
          "co-thu": "Ancient & Traditional Texts",
        },
      },
      contextSection: {
        openBtn: "Read More: Background & Story Soul",
        closeBtn: "Hide Background & Story Soul",
        title: "Further Reading · Background & Story Soul",
        subtitle:
          "Reference material from level-0-khong-gian-boi-canh/: cultural spirit, storytelling rhythm (Ages 9–10 · Jakob Streit), metaphors, ancient name pronunciations, and 25 ancient texts.",
        culturalSpiritTitle: "Cultural Spirit & Context Space",
        rhythmTitle: "Storytelling Rhythm & Breath",
        metaphorTitle: "Touchpoints & Metaphor (Ages 9–10)",
        pronunciationTitle: "Ancient & Cultural Name Pronunciation Guide",
        epicOverviewToggleOpen: "Read Epic Soul Overview",
        epicOverviewToggleClose: "Hide Epic Overview",
      },
      levels: {
        1: {
          badge: "Level 1",
          shortTitle: "Full Story Text",
          title: "Level 1 · Full Story Text (180 Chapters)",
          description:
            "Complete read-aloud storytelling prose across all 180 chapters paired with vocal delivery notes per chapter.",
        },
        2: {
          badge: "Level 2",
          shortTitle: "Detailed Outline",
          title: "Level 2 · Detailed Outline (180 Chapters)",
          description:
            "Retell without the full text while preserving every character, symbolic motif, detailed beat, and core takeaway.",
        },
        3: {
          badge: "Level 3",
          shortTitle: "Summary Skeleton",
          title: "Level 3 · Summary Skeleton Outline (180 Chapters)",
          description:
            "One single unified skeleton outline closely following all 180 chapters of the original plot.",
        },
        4: {
          badge: "Level 4",
          shortTitle: "Pure Visual Art",
          title: "Level 4 · Pure Visual Memory Illustrations (28 Paintings)",
          description:
            "28 traditional hand-drawn cluster illustrations with zero text hints so your living spoken language flows naturally.",
        },
      },
      level1: {
        viewByScene: "Chapter by Chapter",
        viewFullFlow: "Continuous Read-Aloud Flow",
        voiceNoteLabel: "Vocal Delivery Note",
        textSizeLabel: "Text Size",
        textSizeSmall: "S",
        textSizeMedium: "M",
        textSizeLarge: "L",
        openIllustrationBtn: "Open Cluster Art (Level 4)",
      },
      level2: {
        charactersLabel: "Characters & Central Motifs",
        localizedDetailsLabel: "Localized & Sensory Details",
        emotionalRhythmLabel: "Storytelling Meaning & Highlights",
        beatsLabel: "Detailed Story Beats",
      },
      level3: {
        skeletonHeader: "Unified Original Plot Skeleton",
        pointsBadge: "core points",
        jumpToSceneHint: "Click any chapter to mark where you are telling",
        filterCurrentScene: "Focused Chapter",
        filterAllScenes: "All Chapters",
        openInLevel4Btn: "Open Cluster Art (Level 4)",
      },
      level4: {
        illustrationLabel: "Illustration",
        prevIllustration: "Previous Illustration",
        nextIllustration: "Next Illustration",
        artStyleLabel: "Fallback Medium",
        styleWetOnWet: "Wet-on-Wet Watercolor",
        styleCrayon: "Beeswax Crayon",
        styleChalkboard: "Pastel Chalkboard",
        uploadCustomImageBtn: "Upload Hand-Drawn Image",
        resetProceduralBtn: "Use Repo / Default Illustration",
        stageModeEnter: "Stage Mode",
        stageModeExit: "Standard Frame",
        artModeRepoBadge: "Repo Illustration",
        artModeProceduralBadge: "Local Wordless SVG Art",
        swipeHint:
          "Use Prev/Next, arrow keys ← / →, or swipe horizontally to switch illustrations (zero text hints)",
      },
      nav: {
        sceneLabel: "Chapter",
        ofWord: "/",
        prevScene: "Previous Chapter",
        nextScene: "Next Chapter",
        prevLevelBtn: "Back to Level",
        nextLevelShortBtn: "Next: Level",
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
        currentSceneBadge: "Active",
        micDeniedNotice:
          "Microphone access was denied. Please grant permission in your browser to record.",
        unsupportedNotice:
          "This browser does not support direct audio recording (MediaRecorder).",
      },
    },
  },
};
