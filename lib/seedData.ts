import {
  WaldorfData,
  WaldorfStory,
  StoryScene,
  WaldorfArtStyle,
  PronunciationGuideItem,
} from "./types";

export function getSeedData(): WaldorfData {
  const hoianStory: WaldorfStory = {
    id: "story-hoian-money",
    title: "Vỏ sò và đồng xu bên bến Hội An",
    titleEn: "The Sea Shells and Copper Coins of Hội An",
    sourceInfo: "Khối 3 (8–9 tuổi) · Mạch Tiền tệ & Niềm tin cộng đồng ven sông Thu Bồn",
    ageRange: "8–9 tuổi",
    goal: "Giúp người kể truyền tải hành trình từ trao đổi hiện vật đến đồng tiền giữ chữ tín, khép lại bằng bài học về lòng tin và tình người.",
    defaultArtStyle: "wet-on-wet",
    soul: {
      culturalSpirit:
        "Không gian làng nghề truyền thống xứ Quảng ven dòng sông Thu Bồn hiền hòa: làng gốm Thanh Hà ấm lửa lò nung, làng mộc Kim Bồng vang tiếng đục chạm gỗ mít, và phố cảng Hội An lung linh đèn lồng bên bến thuyền tấp nập. Cốt lõi tinh thần là lối sống trọng nghĩa, quý trọng công sức đôi bàn tay và giữ chữ tín giữa xóm giềng.",
      storytellingRhythm:
        "Nhịp kể khoan thai, dịu dàng như nhịp mái chèo khua nước buổi sớm. Hít vào chậm rãi ở cảnh sinh hoạt thanh bình bên sông; lắng xuống suy tư theo nỗi băn khoăn của bác thợ mộc; mở rộng tươi sáng ở cảnh mọi người đồng lòng nơi bến Hội An; và khép lại thật ấm áp, ngân vang trong lời dặn của bà cụ.",
      ageMetaphor:
        "Phù hợp trẻ 8–9 tuổi (ngưỡng cửa nhận thức thế giới lao động xung quanh): trẻ cảm nhận rằng đồng tiền tự thân không ăn được, mà là biểu tượng của lời hứa công bằng, tôn vinh mồ hôi người lao động; nhưng cao hơn tiền bạc vẫn là lòng tin và món quà làm bằng trái tim.",
      pronunciations: [
        {
          term: "Thu Bồn",
          pronunciation: "Thu Bồn (đọc tròn chữ, ngân nhẹ thanh huyền ở tiếng 'Bồn')",
          meaning: "Dòng sông mẹ hiền hòa bồi đắp phù sa cho vùng đất Quảng Nam.",
        },
        {
          term: "Thanh Hà",
          pronunciation: "Thanh Hà (nhịp nhẹ, sáng ở 'Thanh', lắng dịu ở 'Hà')",
          meaning: "Làng gốm đất nung cổ truyền hơn 500 năm bên bờ sông Thu Bồn.",
        },
        {
          term: "Kim Bồng",
          pronunciation: "Kim Bồng (rõ âm đầu 'K', vang ấm âm cuối 'Bồng')",
          meaning: "Làng mộc truyền thống nổi tiếng với những nghệ nhân chạm khắc tinh xảo.",
        },
        {
          term: "Hội An",
          pronunciation: "Hội An (êm ái, giữ độ mở thanh ngang ở tiếng 'An')",
          meaning: "Phố cảng giao thương cổ kính nơi thuyền buôn và làng nghề hội tụ.",
        },
        {
          term: "Đồng xu lỗ vuông",
          pronunciation: "Đồng xu lỗ vuông (nhấn nhẹ, chậm rãi từng tiếng)",
          meaning: "Tiền đồng cổ tròn ngoài vuông trong — tượng trưng cho trời tròn đất vuông và ước hẹn chung.",
        },
      ],
    },
    scenes: [
      {
        id: "hoian-scene-1",
        ord: 1,
        title: "Phân cảnh 1: Buổi sớm trao đổi bên dòng Thu Bồn",
        passage:
          "Ngày xưa, ở một xóm nhỏ nép mình bên dòng sông Thu Bồn êm ả, nắng mai vừa rải vàng lên những mái ngói rêu phong. Từ sớm tinh mơ, người trồng lúa mang những bao thóc vàng thơm mùi nắng mới, bác thợ gốm làng Thanh Hà gánh những chiếc nồi đất nung đỏ au, còn cô thợ đan mang theo những chiếc rổ tre vàng óng vừa đan xong. Họ gặp nhau dưới bóng cây bàng ven bến nước, cười nói râm ran rồi đổi phần mình làm ra cho nhau: nhà có thóc đổi lấy nồi đất nấu cơm dẻo, nhà có rổ tre đổi lấy bó rau cải xanh non vẫn còn đọng sương sớm.",
        voiceNote:
          "Giọng kể tươi sáng, ấm áp và nhịp nhàng như dòng nước chảy êm. Nhấn nhẹ vào màu sắc và chất liệu (nắng vàng, thóc thơm, nồi đất đỏ au, rổ tre vàng óng) để người nghe hình dung bức tranh buổi sớm sống động.",
        detailedOutline: {
          characters: ["Người nông dân trồng lúa", "Bác thợ gốm làng Thanh Hà", "Cô thợ đan rổ tre"],
          localizedDetails: [
            "Dòng sông Thu Bồn êm ả trong nắng mai, mái ngói rêu phong",
            "Bao thóc vàng thơm nắng, nồi đất nung Thanh Hà đỏ au",
            "Rổ tre vàng óng, bó rau cải xanh non đọng sương dưới bóng cây bàng",
          ],
          emotionalRhythm:
            "Êm đềm, hân hoan và gắn kết cộng đồng — mở ra không khí hít vào nhẹ nhàng cho trẻ 8–9 tuổi.",
          beats: [
            "Giới thiệu xóm nhỏ ven sông Thu Bồn vào buổi sớm tinh mơ.",
            "Lần lượt giới thiệu từng người thợ với thành quả lao động thủ công của họ.",
            "Cảnh tụ họp dưới bóng cây bàng ven bến nước trong tiếng cười nói hiền hòa.",
            "Mọi người trao đổi trực tiếp hiện vật: thóc đổi nồi đất, rổ tre đổi rau xanh.",
          ],
        },
        summaryPoints: [
          "Xóm nhỏ ven sông Thu Bồn đón nắng mai thanh bình.",
          "Nông dân mang thóc, thợ gốm Thanh Hà gánh nồi đất, cô đan mang rổ tre.",
          "Mọi người tụ họp dưới bóng cây bàng bên bến nước.",
          "Trao đổi trực tiếp vật lấy vật: thóc đổi nồi, rổ đổi rau tươi.",
        ],
        artStyle: "wet-on-wet",
      },
      {
        id: "hoian-scene-2",
        ord: 2,
        title: "Phân cảnh 2: Nỗi trăn trở của bác thợ mộc Kim Bồng",
        passage:
          "Một sáng mùa thu se lạnh, bác thợ mộc từ làng Kim Bồng cẩn thận vác ra chợ chiếc ghế gỗ mít vững chãi. Suốt ba ngày liền, bác đã bào nhẵn từng thớ gỗ thơm, ghép mộng thật khít không cần một chiếc đinh sắt nào. Bác chỉ mong đổi được ít muối biển trắng và một hũ dầu phụng để thắp đèn ban đêm. Thế nhưng, bác lái muối lắc đầu vì nhà đã có đủ ghế ngồi rồi; còn nếu đổi cả chiếc ghế nặng nhọc làm suốt ba ngày chỉ lấy một bát muối nhỏ thì thật không xứng với công sức đôi bàn tay. Bác thợ mộc ngồi lặng bên gốc đa, bàn tay chai sần đặt trên mặt ghế gỗ, lòng bâng khuâng suy nghĩ.",
        voiceNote:
          "Chậm lại và hạ tông giọng trầm xuống một chút khi nhắc đến ba ngày lao động nhọc nhằn và sự lúng túng giữa hai người bán. Dừng một nhịp thở lặng (2 giây) sau hình ảnh bác thợ mộc ngồi bên gốc đa.",
        detailedOutline: {
          characters: ["Bác thợ mộc làng Kim Bồng", "Bác lái muối"],
          localizedDetails: [
            "Sáng mùa thu se lạnh, hương gỗ mít thơm ấm",
            "Kỹ thuật ghép mộng khít không dùng đinh sắt của mộc Kim Bồng",
            "Muối biển trắng, hũ dầu phụng thắp đèn, gốc đa cổ thụ",
          ],
          emotionalRhythm:
            "Chùng xuống suy tư, khơi gợi sự đồng cảm với giá trị lao động thủ công và vấn đề bất tiện của đổi chác trực tiếp.",
          beats: [
            "Bác thợ mộc Kim Bồng hoàn thành chiếc ghế gỗ mít sau ba ngày bào đẽo công phu.",
            "Bác mang ghế ra bến chợ với mong muốn đổi lấy muối biển và dầu phụng thắp đèn.",
            "Gặp trắc trở: người bán muối không cần ghế, mà giá trị chiếc ghế quá lớn so với một bát muối.",
            "Khoảnh khắc lặng lẽ suy tư của bác thợ mộc bên gốc đa.",
          ],
        },
        summaryPoints: [
          "Sáng thu, bác thợ mộc Kim Bồng hoàn thành chiếc ghế gỗ mít làm suốt ba ngày.",
          "Bác muốn đổi chiếc ghế lấy muối biển và dầu thắp đèn.",
          "Người bán muối không cần ghế; đổi một bát muối lại quá thiệt thòi.",
          "Bác thợ mộc ngồi suy tư bên gốc đa về cách trao đổi công bằng.",
        ],
        artStyle: "crayon",
      },
      {
        id: "hoian-scene-3",
        ord: 3,
        title: "Phân cảnh 3: Vỏ sò trắng và đồng xu lỗ vuông nơi bến Hội An",
        passage:
          "Chiều hôm ấy, khi ánh đèn lồng bắt đầu hắt xuống mặt nước Hội An lấp lánh, các bậc cao niên và nghệ nhân các làng nghề cùng ngồi lại bên bến thuyền. Họ bàn nhau tìm một vật làm dấu ước hẹn chung. Ban đầu, mọi người chọn những chiếc vỏ sò trắng mịn nhặt từ biển khơi, rồi về sau cùng đúc nên những đồng xu bằng đồng tròn vành, ở giữa có lỗ vuông để dễ xâu thành từng chuỗi bằng dây gai. Đồng xu tự nó chẳng nấu thành cơm, chẳng ăn được, nhưng mỗi đồng xu mang theo lời hứa trang trọng và niềm tin chung của cả cộng đồng: ai làm việc chăm chỉ, sản phẩm xứng đáng bao nhiêu thì sẽ nhận lại bấy nhiêu đồng xu công bằng.",
        voiceNote:
          "Mở giọng sáng dần lên, mang âm hưởng trang trọng và ấm cúng khi miêu tả ánh đèn lồng soi mặt nước. Nhấn chậm, rõ từng chữ ở câu: 'Đồng xu tự nó chẳng ăn được, nhưng mang theo lời hứa và niềm tin chung của cả cộng đồng.'",
        detailedOutline: {
          characters: ["Các bậc cao niên", "Nghệ nhân làng nghề", "Cư dân bến Hội An"],
          localizedDetails: [
            "Ánh đèn lồng phố cổ hắt xuống bến thuyền Hội An buổi hoàng hôn",
            "Vỏ sò trắng mịn từ biển khơi",
            "Đồng xu đồng tròn ngoài lỗ vuông trong, xâu chuỗi bằng dây gai",
          ],
          emotionalRhythm:
            "Thở ra nhẹ nhõm, sáng tạo và trang nghiêm — niềm vui khi tìm thấy giải pháp chung cho cả cộng đồng.",
          beats: [
            "Buổi họp mặt ấm áp của các bậc cao niên và thợ nghề khi đèn lồng Hội An lên đèn.",
            "Giai đoạn đầu chọn vỏ sò trắng mịn từ biển làm vật trung gian trao đổi.",
            "Phát triển thành đồng xu đúc bằng đồng tròn ngoài lỗ vuông, xâu bằng dây gai.",
            "Khẳng định ý nghĩa cốt lõi: đồng xu đại diện cho ước hẹn và giá trị sức lao động.",
          ],
        },
        summaryPoints: [
          "Chiều lên đèn lồng, các bô lão và nghệ nhân họp bàn bên bến Hội An.",
          "Mọi người chọn vỏ sò trắng mịn làm vật ước hẹn ban đầu.",
          "Về sau đúc đồng xu đồng tròn ngoài lỗ vuông, xâu thành chuỗi dây gai.",
          "Đồng xu không ăn được nhưng giữ lời hứa công bằng của cả cộng đồng.",
        ],
        artStyle: "chalkboard",
      },
      {
        id: "hoian-scene-4",
        ord: 4,
        title: "Phân cảnh 4: Phiên chợ minh bạch và kho báu thật sự",
        passage:
          "Từ dạo ấy, mỗi phiên chợ sớm bên bến sông, bác thợ mộc đổi chiếc ghế lấy chuỗi đồng xu sáng bóng rồi ung dung mua muối, mua dầu phụng mà lòng nhẹ tênh. Người mua người bán đếm từng đồng xu, cộng giá rành mạch và trả lại tiền thừa thật minh bạch. Chiều muộn, bên hiên nhà lộng gió sông, bà cụ hiền hậu khẽ xoa đầu bé Mây và các cháu nhỏ, giọng bà êm như tiếng sóng vỗ bờ: 'Các cháu nhớ nhé, đồng tiền giúp người ta trao đổi công bằng cho vừa vặn công sức. Nhưng lòng tin, lời giữ hẹn và món quà các cháu tự tay làm tặng người mình thương yêu — đó mới là kho báu quý giá nhất mà chẳng đồng tiền nào mua nổi.'",
        voiceNote:
          "Đoạn đầu nhịp rộn ràng, dứt khoát theo tiếng đếm xu minh bạch. Khi chuyển sang lời bà cụ nói với bé Mây, hạ tốc độ thật chậm, giọng êm dịu, đầy yêu thương và để khoảng lặng cuối câu chuyện ngân dài.",
        detailedOutline: {
          characters: ["Bác thợ mộc", "Người mua bán chợ phiên", "Bà cụ hiền hậu", "Bé Mây và các cháu nhỏ"],
          localizedDetails: [
            "Phiên chợ sớm bên bến sông, chuỗi đồng xu sáng bóng",
            "Hiên nhà lộng gió sông buổi chiều muộn, tiếng sóng Thu Bồn",
            "Món quà tự tay làm tặng nhau",
          ],
          emotionalRhythm:
            "Trọn vẹn, lắng đọng và ấm áp tình người — khép lại câu chuyện bằng sự bình yên sâu sắc.",
          beats: [
            "Bác thợ mộc đổi ghế lấy đồng xu, dễ dàng mua được muối và dầu phụng.",
            "Không khí chợ phiên đếm tiền, tính toán và thối tiền thừa công bằng, minh bạch.",
            "Khung cảnh chiều muộn yên ả bên hiên nhà của bà cụ và bé Mây.",
            "Lời nhắn nhủ sâu sắc của bà cụ về kho báu không mua được bằng tiền: lòng tin, giữ lời và món quà tự tay làm.",
          ],
        },
        summaryPoints: [
          "Bác thợ mộc bán ghế lấy đồng xu, ung dung mua đủ muối và dầu.",
          "Phiên chợ diễn ra minh bạch, đếm xu và trả tiền thừa sòng phẳng.",
          "Chiều muộn bên sông, bà cụ trò chuyện ấm áp cùng bé Mây.",
          "Bà dặn: tiền giúp công bằng, nhưng lòng tin, giữ hẹn và tình thương là kho báu vô giá.",
        ],
        artStyle: "wet-on-wet",
      },
    ],
  };

  const abrahamStory: WaldorfStory = {
    id: "story-abraham-stars",
    title: "Abraham và bầu trời sao sa mạc",
    titleEn: "Abraham and the Desert Stars",
    sourceInfo: "Khối 3 (8–9 tuổi) · Hành trình đức tin, sự nhường nhịn và bầu trời sao cổ đại",
    ageRange: "8–9 tuổi",
    goal: "Luyện nhịp kể chậm rãi, sâu lắng, thể hiện hình ảnh mênh mông của sa mạc và lòng bao dung rộng lượng.",
    defaultArtStyle: "chalkboard",
    soul: {
      culturalSpirit:
        "Bối cảnh cổ đại Lưỡng Hà và sa mạc Trung Đông mênh mông: thành cổ Ur trù phú bên dòng đại hà, đoàn lữ hành lặng lẽ vượt qua những triền cát vàng dưới ánh mặt trời rực rỡ, thung lũng sông Jordan xanh mướt và bầu trời đêm sa mạc thẳm sâu rực sáng ngàn sao.",
      storytellingRhythm:
        "Nhịp kể trầm hùng, chững chạc và rộng mở. Giọng đọc đều đặn như bước chân lạc đà đi trên cát ấm, chú ý lấy hơi sâu trước những khung cảnh thiên nhiên rộng lớn và giữ sự điềm tĩnh trong lời nói của Abraham.",
      ageMetaphor:
        "Giúp trẻ 8–9 tuổi cảm nhận sức mạnh của lòng bao dung: thà nhường phần đất màu mỡ cho anh em để giữ trọn hòa khí gia đình còn hơn tranh giành mà đánh mất bình an trong tâm hồn.",
      pronunciations: [
        {
          term: "Ur",
          pronunciation: "Ua-rơ (tròn âm 'Ua', lướt nhẹ 'rơ')",
          meaning: "Thành phố cổ kính giàu có ven sông Euphrates ở vùng Lưỡng Hà.",
        },
        {
          term: "Abraham",
          pronunciation: "A-bra-ham (đọc rõ 3 âm tiết, nhấn nhẹ ở âm đầu)",
          meaning: "Vị tộc trưởng hiền minh dẫn dắt gia đình bước vào hành trình niềm tin.",
        },
        {
          term: "Sarah",
          pronunciation: "Sa-ra (mềm mại, thanh thoát)",
          meaning: "Người bạn đời kiên trung đồng hành cùng Abraham.",
        },
        {
          term: "Lot",
          pronunciation: "Lót (gọn, rõ âm cuối)",
          meaning: "Người cháu trai đi cùng Abraham trên chặng đường du mục.",
        },
        {
          term: "Jordan",
          pronunciation: "Giô-đan (trầm ấm)",
          meaning: "Thung lũng xanh tươi có dòng sông mát lành và nhiều đồng cỏ.",
        },
      ],
    },
    scenes: [
      {
        id: "abraham-scene-1",
        ord: 1,
        title: "Phân cảnh 1: Rời khỏi thành cổ Ur",
        passage:
          "Thuở xa xưa, tại thành phố Ur trù phú nằm bên dòng sông lớn, Abraham sống yên ấm cùng gia đình. Một đêm thanh vắng, ông lắng nghe tiếng gọi dịu dàng nhưng kiên định từ sâu thẳm trái tim mình. Sáng hôm sau, khi rạng đông vừa ửng hồng trên mái nhà đất nung, Abraham cùng vợ là bà Sarah và người cháu trai tên Lot thu xếp hành trang, dắt đàn cừu trắng muốt lên đường. Họ bước qua cổng thành cổ, hướng về miền đất hứa xa xôi phía bên kia sa mạc cát vàng mênh mông.",
        voiceNote:
          "Giọng kể trầm ấm, trang nghiêm. Khắc họa rõ sự đối lập giữa thành cổ Ur yên ấm trong đêm vắng và bước chân quả quyết lúc bình minh lên.",
        detailedOutline: {
          characters: ["Abraham", "Bà Sarah", "Cháu trai Lot"],
          localizedDetails: [
            "Thành cổ Ur bên dòng sông lớn",
            "Ánh rạng đông ửng hồng trên mái nhà đất nung",
            "Đàn cừu trắng và dải cát vàng sa mạc mênh mông",
          ],
          emotionalRhythm: "Tĩnh lặng, quả quyết và mang khát vọng lên đường.",
          beats: [
            "Cuộc sống yên ấm của gia đình Abraham tại thành phố cổ Ur.",
            "Đêm thanh vắng, Abraham lắng nghe tiếng gọi nội tâm lên đường.",
            "Bình minh ửng hồng, cùng Sarah, Lot và đàn cừu rời cổng thành.",
            "Khởi đầu hành trình băng qua vùng sa mạc rộng lớn.",
          ],
        },
        summaryPoints: [
          "Abraham sống yên ấm cùng gia đình tại thành cổ Ur bên sông lớn.",
          "Một đêm thanh vắng, ông lắng nghe tiếng gọi nội tâm lên đường.",
          "Bình minh lên, Abraham, Sarah và Lot dẫn đàn cừu rời khỏi thành.",
          "Đoàn người tiến bước qua sa mạc cát vàng hướng về miền đất mới.",
        ],
        artStyle: "crayon",
      },
      {
        id: "abraham-scene-2",
        ord: 2,
        title: "Phân cảnh 2: Nỗi buồn trên đồi cỏ khô hạn",
        passage:
          "Tháng ngày qua đi, đàn cừu và đàn dê của cả hai chú cháu sinh sôi ngày càng đông đúc. Thế nhưng, vùng đồi đá nơi họ dừng chân lại bước vào mùa khô hạn. Cỏ xanh thưa dần, những dòng suối mát cũng trở nên ít ỏi. Chẳng bao lâu, những người chăn cừu của Abraham và những người chăn cừu của Lot bắt đầu to tiếng tranh giành từng vạt cỏ non và từng vũng nước trong hiếm hoi. Tiếng cãi vã vang lên giữa nắng trưa gay gắt khiến không khí trong trại du mục nặng nề nỗi buồn.",
        voiceNote:
          "Tăng nhịp nhẹ ở đoạn hai nhóm chăn cừu tranh giành nhưng không gắt gỏng; giữ âm sắc lo âu, trắc ẩn để trẻ cảm nhận sự buồn bã khi tình thân bị rạn nứt.",
        detailedOutline: {
          characters: ["Những người chăn cừu của Abraham", "Những người chăn cừu của Lot"],
          localizedDetails: [
            "Đồi đá mùa khô hạn, cỏ thưa và suối cạn nước",
            "Ánh nắng trưa sa mạc gay gắt",
            "Khu trại du mục ồn ào nỗi buồn",
          ],
          emotionalRhythm: "Căng thẳng nhẹ và xót xa trước sự bất hòa.",
          beats: [
            "Đàn gia súc của cả Abraham và Lot đều phát triển đông đúc.",
            "Đồi cỏ trở nên khô hạn, nguồn nước và thức ăn khan hiếm.",
            "Người chăn cừu hai bên xảy ra mâu thuẫn, tranh giành suối và cỏ.",
            "Nỗi buồn bao trùm khu trại lều du mục.",
          ],
        },
        summaryPoints: [
          "Đàn cừu của Abraham và Lot ngày càng đông đúc.",
          "Vùng đồi khô hạn khiến cỏ xanh và nước suối trở nên khan hiếm.",
          "Người chăn cừu hai bên bắt đầu cãi vã, tranh giành bãi cỏ và nguồn nước.",
          "Bầu không khí trong trại du mục trở nên nặng nề, buồn bã.",
        ],
        artStyle: "crayon",
      },
      {
        id: "abraham-scene-3",
        ord: 3,
        title: "Phân cảnh 3: Sự nhường nhịn bên thung lũng Jordan",
        passage:
          "Thấy vậy, Abraham dịu dàng gọi Lot cùng bước lên ngọn đồi cao nhìn xuống khắp bốn phương. Trước mắt hai chú cháu là hai cảnh tượng khác hẳn nhau: một bên là thung lũng Jordan xanh mướt cỏ cây, dòng sông uốn lượn ngập tràn hơi nước mát lành; bên kia là những triền đồi đá khô cằn phủ bụi nắng. Abraham đặt tay lên vai người cháu, giọng trầm ấm mà vững chãi: 'Lot này, chú cháu mình là người một nhà, đừng để mảnh đất chia lìa tình thân. Cả vùng đất rộng lớn trước mắt kia, cháu hãy chọn trước đi. Nếu cháu đi về hướng trái, chú sẽ sang phải; nếu cháu chọn bên phải, chú sẽ đi về bên trái.' Lot ngước nhìn dòng sông xanh biếc và chọn ngay thung lũng Jordan màu mỡ, còn Abraham lặng lẽ dẫn đàn cừu quay về phía đồi đá khô cằn.",
        voiceNote:
          "Giọng Abraham cần thật điềm tĩnh, độ lượng, ấm áp tình thương người lớn tuổi. Đọc rõ từng vế 'cháu đi hướng trái, chú sang phải' để tạo sự cân bằng hài hòa.",
        detailedOutline: {
          characters: ["Abraham", "Lot"],
          localizedDetails: [
            "Đỉnh đồi cao nhìn xuống hai miền đối lập",
            "Thung lũng Jordan xanh mướt với dòng sông uốn lượn",
            "Triền đồi đá khô cằn phủ bụi nắng",
          ],
          emotionalRhythm: "Giải tỏa căng thẳng, tỏa sáng đức tính nhường nhịn và lòng quảng đại.",
          beats: [
            "Abraham mời Lot lên đỉnh đồi cao cùng quan sát vùng đất rộng.",
            "Một bên là thung lũng Jordan trù phú xanh tươi, bên kia là đồi khô cằn.",
            "Abraham ân cần khuyên nhủ giữ tình ruột thịt và nhường Lot quyền chọn trước.",
            "Lot chọn thung lũng Jordan màu mỡ; Abraham bằng lòng ở lại vùng đồi khô.",
          ],
        },
        summaryPoints: [
          "Abraham đưa Lot lên đỉnh đồi cao quan sát cả vùng đất rộng lớn.",
          "Ông khuyên cháu không để đất đai làm sứt mẻ tình anh em ruột thịt.",
          "Abraham rộng lượng nhường quyền chọn đất tốt cho Lot trước.",
          "Lot chọn thung lũng Jordan xanh tươi; Abraham bình thản giữ vùng đồi khô.",
        ],
        artStyle: "wet-on-wet",
      },
      {
        id: "abraham-scene-4",
        ord: 4,
        title: "Phân cảnh 4: Lời hứa dưới bầu trời ngàn sao",
        passage:
          "Đêm ấy, khi màn sương lạnh buông xuống sườn đồi đá vắng lặng, Abraham một mình bước ra khỏi lều vải. Ông ngước mặt nhìn lên bầu trời đêm sa mạc sâu thẳm. Trên cao kia, hàng vạn ngôi sao vàng lấp lánh như những hạt ánh sáng rải khắp tấm nhung đen vô tận. Trong sự tĩnh mịch tuyệt đối của đất trời, một cảm giác bình an mênh mông tràn ngập trái tim ông. Abraham mỉm cười nhớ rằng: hòa thuận trong gia đình và niềm tin vào con đường mình bước đi luôn quý giá hơn mọi đồng cỏ xanh tươi nhất trần gian.",
        voiceNote:
          "Hạ tốc độ rất chậm, giọng nhỏ nhẹ nhưng có độ ngân sâu. Tạo cảm giác ngước nhìn lên bầu trời sao bao la và kết thúc bằng sự thanh thản tuyệt đối.",
        detailedOutline: {
          characters: ["Abraham"],
          localizedDetails: [
            "Đêm sương lạnh bên sườn đồi đá vắng lặng, căn lều vải",
            "Bầu trời đêm sa mạc sâu thẳm như tấm nhung đen",
            "Hàng vạn ngôi sao vàng rực sáng lấp lánh",
          ],
          emotionalRhythm: "Tĩnh tại, thiêng liêng và ngập tràn niềm bình an nội tâm.",
          beats: [
            "Đêm xuống trên sườn đồi vắng, Abraham bước ra khỏi lều vải.",
            "Ngước nhìn lên bầu trời sa mạc sâu thẳm rực sáng ngàn sao.",
            "Cảm nhận sự bình an lớn lao tràn ngập tâm hồn trong đêm tĩnh mịch.",
            "Khẳng định giá trị vĩnh cửu của hòa khí gia đình và niềm tin.",
          ],
        },
        summaryPoints: [
          "Đêm thanh vắng, Abraham một mình bước ra ngoài lều vải trên đồi đá.",
          "Ông ngước nhìn bầu trời đêm sa mạc rực sáng muôn ngàn vì sao.",
          "Lòng ông tràn ngập sự bình an giữa không gian rộng lớn.",
          "Nhận ra tình thương và đức tin quý giá hơn mọi đồng cỏ trù phú.",
        ],
        artStyle: "chalkboard",
      },
    ],
  };

  const cloudSeedStory: WaldorfStory = {
    id: "story-cloud-seed",
    title: "Hạt giống kiên nhẫn của bé Mây",
    titleEn: "Cloud's Seed of Patience",
    sourceInfo: "Khối 1–2 (6–8 tuổi) · Nhịp thở bốn mùa, chăm sóc sự sống và lòng kiên nhẫn",
    ageRange: "6–8 tuổi",
    goal: "Nuôi dưỡng giọng kể êm dịu, lặp lại có vần điệu giúp trẻ nhỏ cảm nhận sự kỳ diệu của thiên nhiên.",
    defaultArtStyle: "wet-on-wet",
    soul: {
      culturalSpirit:
        "Khu vườn quê Việt Nam thanh bình bên hiên nhà gỗ mộc mạc: đất vườn nâu ẩm sau cơn mưa xuân, tiếng chim sâu ríu rít trong vòm lá và tình cảm ấm áp, gần gũi giữa hai bà cháu.",
      storytellingRhythm:
        "Nhịp kể trong trẻo, nâng niu như lời ru êm ái. Các câu có độ lặp lại tự nhiên theo chu kỳ mỗi sáng tưới nước – hát khẽ – chờ đợi để trẻ nhỏ dễ đắm mình vào nhịp sinh trưởng của cây.",
      ageMetaphor:
        "Dành cho trẻ 6–8 tuổi: giúp trẻ học sự kiên nhẫn không vội vã, biết lắng nghe đất trời và tin rằng tình yêu thương bền bỉ mỗi ngày sẽ làm nảy nở điều đẹp đẽ nhất.",
      pronunciations: [
        {
          term: "Bé Mây",
          pronunciation: "Bé Mây (nhẹ, bồng bềnh và thân thương)",
          meaning: "Nhân vật em nhỏ hiền hậu thích lắng nghe bà kể chuyện bên hiên nhà.",
        },
        {
          term: "Sương mai",
          pronunciation: "Sương mai (trong trẻo, giữ nhẹ âm 's')",
          meaning: "Những giọt nước mát lành đọng trên lá cỏ lúc trời vừa sáng.",
        },
        {
          term: "Chồi xanh",
          pronunciation: "Chồi xanh (ngân nhẹ như mầm cây vươn dậy)",
          meaning: "Mầm lá non đầu tiên nhú lên khỏi mặt đất nâu.",
        },
      ],
    },
    scenes: [
      {
        id: "cloud-scene-1",
        ord: 1,
        title: "Phân cảnh 1: Món quà hạt giống nhỏ của bà",
        passage:
          "Ngày xửa ngày xưa, ở một ngôi làng yên ả bên triền sông, có cô bé tên là Mây rất thích ngồi tựa vào lòng bà nghe kể chuyện mỗi buổi chiều. Một sáng mùa xuân ấm áp, khi giọt sương mai còn long lanh trên ngọn cỏ, bà khẽ mở bàn tay nhăn nheo và đặt vào lòng tay Mây một hạt giống nâu bé xíu. Bà mỉm cười thì thầm: 'Cháu hãy đặt hạt giống nhỏ này vào lòng đất ấm, tưới cho nó một chút nước mát mỗi sớm mai và chờ đợi bằng cả trái tim yêu thương nhé.'",
        voiceNote:
          "Giọng dịu dàng, thì thầm ấm áp ở câu nói của bà để tạo cảm giác nâng niu một bí mật quý giá trong lòng bàn tay.",
        detailedOutline: {
          characters: ["Bé Mây", "Bà ngoại hiền hậu"],
          localizedDetails: [
            "Ngôi làng yên ả bên triền sông vào sáng mùa xuân",
            "Giọt sương mai long lanh trên cỏ",
            "Hạt giống nâu bé xíu trong lòng bàn tay nhăn nheo của bà",
          ],
          emotionalRhythm: "Ấm áp, dịu dàng và khơi gợi niềm háo hức trong trẻo.",
          beats: [
            "Giới thiệu bé Mây và thói quen nghe bà kể chuyện bên hiên nhà.",
            "Buổi sáng mùa xuân đọng sương mai, bà trao cho Mây một hạt giống nhỏ.",
            "Bà dặn cách gieo hạt xuống đất ấm, tưới nước mỗi sớm và kiên nhẫn chờ đợi.",
          ],
        },
        summaryPoints: [
          "Bé Mây sống ở làng quê yên ả, thích nghe bà kể chuyện.",
          "Sáng mùa xuân, bà tặng Mây một hạt giống nâu bé xíu.",
          "Bà dặn Mây đặt hạt vào đất ấm và tưới nước mỗi sớm mai.",
          "Bà nhắc cháu hãy kiên nhẫn chờ đợi bằng cả trái tim yêu thương.",
        ],
        artStyle: "wet-on-wet",
      },
      {
        id: "cloud-scene-2",
        ord: 2,
        title: "Phân cảnh 2: Những ngày tưới nước và hát ru đất ấm",
        passage:
          "Bé Mây nâng niu vùi hạt giống nhỏ xuống góc vườn đất nâu mềm mịn. Ngày thứ nhất, Mây xách gáo nước nhỏ tưới nhẹ lên mặt đất rồi cúi xuống lắng nghe — đất vẫn im lìm ngủ say. Ngày thứ hai, rồi ngày thứ ba, nắng lên rồi mưa nhẹ bay, Mây vẫn đều đặn tưới nước mỗi bình minh và hát khe khẽ một khúc đồng dao ru đất ấm. Dù mặt đất chưa thấy động đậy gì, cô bé vẫn mỉm cười kiên nhẫn tin rằng hạt giống đang lắng nghe tiếng hát của mình.",
        voiceNote:
          "Giữ nhịp kể đều đặn, ngân nga chậm rãi ở 'Ngày thứ nhất... Ngày thứ hai... Ngày thứ ba...' để thể hiện vòng tuần hoàn thời gian êm ả.",
        detailedOutline: {
          characters: ["Bé Mây"],
          localizedDetails: [
            "Góc vườn đất nâu mềm mịn, gáo nước nhỏ",
            "Khúc đồng dao hát khẽ mỗi bình minh",
            "Mặt đất ẩm tĩnh lặng đón nắng và mưa xuân",
          ],
          emotionalRhythm: "Bền bỉ, tin cậy và an yên trong sự chờ đợi.",
          beats: [
            "Bé Mây cẩn thận vùi hạt giống xuống lớp đất nâu mềm trong vườn.",
            "Mỗi bình minh đều đặn xách gáo nước nhỏ tưới nhẹ cho đất.",
            "Mây hát khe khẽ khúc đồng dao cho lòng đất ấm dù chưa thấy cây mọc.",
            "Giữ vững nụ cười và niềm tin kiên nhẫn qua từng ngày.",
          ],
        },
        summaryPoints: [
          "Mây cẩn thận gieo hạt giống xuống góc vườn đất nâu mềm.",
          "Mỗi sớm mai đều đặn tưới nước mát cho mảnh đất nhỏ.",
          "Bé hát khe khẽ đồng dao ru đất ấm dù hạt vẫn ngủ yên.",
          "Mây giữ niềm tin dịu dàng và không hề sốt ruột.",
        ],
        artStyle: "crayon",
      },
      {
        id: "cloud-scene-3",
        ord: 3,
        title: "Phân cảnh 3: Chồi xanh thức giấc đón nắng mai",
        passage:
          "Rồi một buổi sáng trong veo, khi tiếng chim sâu vừa hót vang trên cành bưởi, bé Mây chạy ra góc vườn như mọi ngày. Ôi kìa! Lớp đất nâu khẽ tách nhẹ ra, một chiếc chồi xanh non mơn mởn vừa thức giấc, khẽ vươn hai chiếc lá bé xíu đón tia nắng ban mai đầu tiên. Giọt sương sớm long lanh đậu trên mép lá xanh như đang mỉm cười chào cô bé. Bé Mây nín thở vì vui sướng, khẽ khàng đưa tay che gió cho mầm non.",
        voiceNote:
          "Tươi tắn và mở rộng giọng đầy ngạc nhiên hạnh phúc ở tiếng reo nhẹ 'Ôi kìa!', sau đó hạ giọng thật dịu khi Mây đưa tay che gió cho mầm cây.",
        detailedOutline: {
          characters: ["Bé Mây", "Chồi non xanh biếc"],
          localizedDetails: [
            "Tiếng chim sâu trên cành bưởi buổi sáng trong veo",
            "Lớp đất nâu tách nhẹ nhô lên hai lá non mơn mởn",
            "Giọt sương sớm đậu trên mép lá dưới nắng ban mai",
          ],
          emotionalRhythm: "Ngạc nhiên vỡ òa, nâng niu và tràn đầy sức sống.",
          beats: [
            "Buổi sáng trong veo với tiếng chim sâu trên cành bưởi.",
            "Bé Mây phát hiện lớp đất nâu khẽ tách mở.",
            "Chiếc chồi xanh non với hai lá nhỏ vươn mình đón ánh nắng sớm.",
            "Mây vui sướng khẽ khàng che gió cho mầm cây mới nhú.",
          ],
        },
        summaryPoints: [
          "Một sáng trong veo, tiếng chim sâu hót vang ngoài vườn bưởi.",
          "Lớp đất nâu khẽ tách mở để lộ mầm xanh non mơn mởn.",
          "Hai chiếc lá nhỏ vươn ra đón ánh nắng vàng và sương sớm.",
          "Bé Mây nín thở vui sướng, nhẹ nhàng đưa tay che gió cho chồi.",
        ],
        artStyle: "wet-on-wet",
      },
      {
        id: "cloud-scene-4",
        ord: 4,
        title: "Phân cảnh 4: Đóa hoa thơm dâng tặng bà",
        passage:
          "Từ chiếc chồi non ngày ấy, cây lớn dần theo từng cơn mưa hạ và làn gió mát, thân vươn cao xanh thẫm rồi kết thành một nụ hoa tròn đầy. Đến một sáng rực rỡ, bông hoa bung nở những cánh mỏng thơm ngát hương xuân khắp mảnh vườn nhỏ. Bé Mây hái đóa hoa tươi thắm nhất mang đến dâng tặng bà. Bà đón lấy bông hoa, mắt ánh lên niềm vui dịu hiền rồi khẽ nói: 'Cháu thấy không, tình yêu thương và lòng kiên nhẫn đã biến hạt giống nhỏ xíu thành vẻ đẹp rạng ngời.'",
        voiceNote:
          "Nhịp kể mở rộng rạng rỡ khi hoa nở, rồi dịu lại thật ấm áp và khép màn bằng nụ cười hiền hậu trong lời bà.",
        detailedOutline: {
          characters: ["Bé Mây", "Bà ngoại"],
          localizedDetails: [
            "Cây lớn qua mưa hạ gió mát, kết nụ tròn đầy",
            "Đóa hoa nở rộ tỏa hương thơm ngát khắp mảnh vườn",
            "Khoảnh khắc hai bà cháu mỉm cười bên hiên nhà",
          ],
          emotionalRhythm: "Tròn đầy, biết ơn và ngọt ngào tình cảm gia đình.",
          beats: [
            "Cây non lớn dần qua mưa nắng, vươn cao và kết nụ tròn.",
            "Đóa hoa bung nở rực rỡ, lan tỏa hương thơm khắp vườn.",
            "Bé Mây nâng niu mang bông hoa đẹp nhất dâng tặng bà.",
            "Bà mỉm cười nhắc bài học về sức mạnh của tình yêu và lòng kiên nhẫn.",
          ],
        },
        summaryPoints: [
          "Cây non lớn dần qua mưa nắng và kết thành nụ hoa tròn đầy.",
          "Đóa hoa bung nở rạng ngời, tỏa hương thơm ngát khắp vườn.",
          "Bé Mây mang bông hoa tươi thắm nhất dâng tặng cho bà.",
          "Bà mỉm cười: tình yêu và kiên nhẫn biến hạt nhỏ thành vẻ đẹp.",
        ],
        artStyle: "chalkboard",
      },
    ],
  };

  return {
    stories: [hoianStory, abrahamStory, cloudSeedStory],
    updatedAt: new Date().toISOString(),
    version: "2.0-storytelling-only",
  };
}

/**
 * Tách và chuyển văn bản truyện người dùng nhập thành đầy đủ cấu trúc 5 Level (Level 0–4)
 * hoàn toàn cục bộ trên trình duyệt (không sử dụng AI).
 */
export function segmentStoryLocally(params: {
  title: string;
  ageRange: string;
  artStyle: WaldorfArtStyle;
  rawText: string;
  culturalSpirit?: string;
  storytellingRhythm?: string;
  ageMetaphor?: string;
  pronunciations?: PronunciationGuideItem[];
}): WaldorfStory {
  const clean = (params.rawText || "").trim();
  const title =
    params.title.trim() ||
    (clean.split("\n")[0] || "Câu chuyện mới").slice(0, 60).trim();

  // Tách đoạn theo dòng trống trước; nếu ít hơn 3 đoạn thì tách theo câu
  let chunks = clean
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (chunks.length < 2) {
    const sentences = clean
      .split(/(?<=[.?!…])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length >= 4) {
      const target = Math.min(6, Math.max(3, Math.ceil(sentences.length / 2)));
      chunks = [];
      for (let i = 0; i < target; i++) {
        const start = Math.floor((i * sentences.length) / target);
        const end = Math.floor(((i + 1) * sentences.length) / target);
        const slice = sentences.slice(start, end);
        if (slice.length > 0) chunks.push(slice.join(" "));
      }
    } else if (sentences.length > 0) {
      chunks = sentences;
    } else {
      chunks = [clean || "Nội dung câu chuyện đang được biên soạn."];
    }
  }

  // Giới hạn tối đa 6 phân cảnh để giữ khung xương gọn gàng
  if (chunks.length > 6) {
    const merged: string[] = [];
    for (let i = 0; i < 6; i++) {
      const start = Math.floor((i * chunks.length) / 6);
      const end = Math.floor(((i + 1) * chunks.length) / 6);
      merged.push(chunks.slice(start, end).join("\n\n"));
    }
    chunks = merged;
  }

  const scenes: StoryScene[] = chunks.map((passage, idx) => {
    const ord = idx + 1;
    const rawSentences = passage
      .split(/(?<=[.?!…])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const firstLine = (rawSentences[0] || passage).slice(0, 48).trim();
    const sceneTitle = `Phân cảnh ${ord}: ${firstLine}${
      (rawSentences[0] || passage).length > 48 ? "..." : ""
    }`;

    // Tạo 4–6 ý khung xương bám sát đoạn gốc cho Level 3
    const summaryPoints = buildSummaryPoints(rawSentences, passage, ord, chunks.length);

    return {
      id: `scene-${Date.now()}-${ord}`,
      ord,
      title: sceneTitle,
      passage,
      voiceNote:
        ord === 1
          ? "Mở đầu khoan thai, lấy hơi sâu và giữ giọng ấm áp để dẫn người nghe bước vào bối cảnh."
          : ord === chunks.length
          ? "Chậm rãi ở đoạn kết, giữ khoảng lặng nhẹ sau câu cuối cùng để dư âm câu chuyện lắng đọng."
          : "Ngắt nhịp tự nhiên theo dấu chấm câu, nhấn nhẹ vào hành động và hình ảnh nổi bật của phân cảnh.",
      detailedOutline: {
        characters: extractLikelyNames(passage),
        localizedDetails: extractSensorySnippets(passage),
        emotionalRhythm: `Giữ mạch cảm xúc tự nhiên cho lứa tuổi ${params.ageRange || "6–9 tuổi"} (phân cảnh ${ord}/${chunks.length}).`,
        beats: rawSentences.slice(0, 5).length > 0 ? rawSentences.slice(0, 5) : [passage],
      },
      summaryPoints,
      artStyle: params.artStyle,
    };
  });

  return {
    id: `story-${Date.now()}`,
    title,
    sourceInfo: "Truyện do người kể tự thêm vào thư viện cục bộ",
    ageRange: params.ageRange || "6–9 tuổi",
    goal: "Luyện kể chuyện từ thấu hiểu bối cảnh đến tranh gợi nhớ thuần hình ảnh.",
    defaultArtStyle: params.artStyle,
    soul: {
      culturalSpirit:
        params.culturalSpirit?.trim() ||
        `Không gian văn hóa và hình ảnh sống động của câu chuyện "${title}". Hãy hình dung rõ cảnh vật, âm thanh và màu sắc trước khi cất lời.`,
      storytellingRhythm:
        params.storytellingRhythm?.trim() ||
        "Nhịp kể tự nhiên theo hơi thở: hít vào chậm ở những đoạn lắng đọng, mở rộng nhẹ nhàng ở các cao trào và giữ khoảng lặng chuyển cảnh.",
      ageMetaphor:
        params.ageMetaphor?.trim() ||
        `Thông điệp nuôi dưỡng tâm hồn, lòng nhân ái và trí tưởng tượng phù hợp với lứa tuổi ${params.ageRange || "6–9 tuổi"}.`,
      pronunciations:
        params.pronunciations && params.pronunciations.length > 0
          ? params.pronunciations
          : [
              {
                term: title,
                pronunciation: `${title} (đọc rõ ràng, ấm áp ngay từ tiếng mở đầu)`,
                meaning: "Tên gọi chính của câu chuyện.",
              },
            ],
    },
    scenes,
  };
}

function buildSummaryPoints(
  sentences: string[],
  passage: string,
  ord: number,
  total: number
): string[] {
  const clauses = passage
    .split(/[.?!;…]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 3);

  const rawPoints = sentences.length >= 4 ? sentences : clauses;
  const trimmed = rawPoints
    .map((p) => (p.length > 90 ? `${p.slice(0, 87).trim()}...` : p))
    .slice(0, 6);

  if (trimmed.length >= 4) {
    return trimmed;
  }

  // Đảm bảo mỗi phân cảnh luôn có tối thiểu 4 ý khung xương rõ ràng
  const padded = [...trimmed];
  const scaffolds = [
    `Mở ra khung cảnh và nhân vật của phân cảnh ${ord}.`,
    `Diễn biến sự việc chính trong đoạn ${ord}/${total}.`,
    `Điểm nhấn cảm xúc và chi tiết gợi hình ảnh cần giữ.`,
    ord === total
      ? "Khép lại câu chuyện với dư âm lắng đọng."
      : `Chuyển mạch tự nhiên sang phân cảnh ${ord + 1}.`,
  ];

  for (const s of scaffolds) {
    if (padded.length >= 4) break;
    padded.push(s);
  }

  return padded.slice(0, 6);
}

function extractLikelyNames(text: string): string[] {
  const regex = /(?:^|\s)([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]+(?:\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]+)*)/g;
  const found: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const candidate = match[1].trim();
    if (candidate.length > 1) found.push(candidate);
  }
  const unique = Array.from(new Set(found)).slice(0, 4);
  return unique.length > 0 ? unique : ["Nhân vật chính trong phân cảnh"];
}

function extractSensorySnippets(text: string): string[] {
  const parts = text
    .split(/[,.;?!]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);
  if (parts.length > 0) return parts.slice(0, 3);
  return [text.slice(0, 80)];
}
