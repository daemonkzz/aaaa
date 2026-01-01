import type { MainCategory } from "@/types/rules";

// Kaze-Z Kurallar - 31.12.2024 tarihli versiyon
export const kazeRulesData: MainCategory[] = [
  {
    id: "1",
    title: "Genel Bakış",
    subCategories: [
      {
        id: "1.1",
        title: "Giriş ve Genel Yaptırım Çerçevesi",
        description: "Kaze-Z topluluk kuralları ve yaptırım esasları.",
        rules: [
          {
            id: "1.1.1",
            title: "Amaç ve Kapsam",
            description: "Kaze-Z; topluluk içi iletişimi düzenlemek, sunucu uyumunu korumak ve roleplay deneyimini sürdürülebilir kılmak için işletilmektedir. Bu kural kitabındaki maddeler, Discord dahil oyun içindeki tüm alanlar için geçerli ve bağlayıcıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.2",
            title: "Katılım ve Kabul Beyanı",
            description: "Sunucuya katılan her üye, bu metindeki kuralların tamamını okumuş, anlamış ve koşulsuz şekilde kabul etmiş sayılır. Sunucuya katılım; Kaze-Z topluluk değerlerine, rol düzenine ve evrenin (lore) bütünlüğünü korumaya yönelik açık bir söz niteliğindedir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.3",
            title: "Kural Hiyerarşisi ve Yorum Yetkisi",
            description: "Kural uygulama sırası şu şekildedir: Özel kural veya duyurular → İlgili bölüm kuralları → Genel maddeler. Kurallarda belirsizlik olması durumunda yönetimin yorumu esas alınır. Gerekli görülen durumlarda, geçmiş benzer olaylar ve sunucu çıkarı doğrultusunda yorumlayıcı kararlar verilebilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.4",
            title: "Yaptırım Türleri",
            description: "İhlalin türüne ve etkisine bağlı olarak uygulanabilecek yaptırımlar şunlardır:\n• Uyarı (sözlü veya yazılı)\n• Geçici susturma (mute)\n• Geçici uzaklaştırma (Kick / WL cezası)\n• Kalıcı yasaklama (perma ban)",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.5",
            title: "Yaptırım Ölçütleri",
            description: "Uygulanacak yaptırımlar; ihlalin ağırlığı, tekrar durumu, mevcut kanıtlar, topluluk ve rol düzeni üzerindeki etkisi ile oyuncunun geçmiş sicili göz önünde bulundurularak belirlenir. Yaptırımların amacı cezalandırmak değil; topluluk düzenini ve rol bütünlüğünü korumaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.6",
            title: "Delil ve Kayıt Esası",
            description: "Tüm yaptırım kararları; kayıt, görüntü, log ve benzeri somut kanıtlara dayanarak verilir. Sunucu kayıtları, ekran görüntüleri, video kayıtları, sistem logları ve yetkili gözlemleri geçerli kanıt olarak sayılır. Yönetim, gerekli gördüğü durumlarda ek kanıt talep etme ve bu kayıtları arşivleme hakkını saklı tutar.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.7",
            title: "İtiraz ve Başvuru Yolu",
            description: "Yaptırım kararlarına itirazlar, sadece ticket sistemi üzerinden ve kayıt altına alınarak değerlendirilir. İtiraz sürecinde saygılı bir üslup kullanılması ve iddiaların kanıtlarla desteklenmesi zorunludur. Yetkililere özel mesaj (DM) yoluyla yapılan başvurular işleme alınmaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.8",
            title: "Güncelleme ve Yürürlük",
            description: "Yönetim ekibi, kuralları güncelleme, değiştirme veya yeni kurallar ekleme hakkına sahiptir. Yapılan değişiklikler duyurulduğu andan itibaren yürürlüğe girer ve sunucudaki tüm üyeler için bağlayıcı sayılır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.9",
            title: "Yetki ve Takdir Hakkı",
            description: "Yönetim, sunucu düzenini, güvenliğini ve rol bütünlüğünü korumak için gerekli gördüğü her türlü önleyici ve düzeltici tedbiri alma yetkisine sahiptir. Bu yetki, topluluk huzuru ve adalet ilkesi gözetilerek kullanılır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.1.10",
            title: "Bilmemek Mazeret Değildir",
            description: "\"Haberim yoktu\" veya \"farkında değildim\" gibi gerekçeler geçerli sayılmaz. Sunucuya katılan her üye, güncel kuralları takip etmek ve bu kurallara eksiksiz uymakla yükümlüdür.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.2",
        title: "Saygı ve Topluluk Düzeni",
        description: "Topluluk içi iletişim ve davranış kuralları.",
        rules: [
          {
            id: "1.2.1",
            title: "Genel Yükümlülük",
            description: "Kaze-Z topluluğuna katılan her üye; topluluk huzurunu korumak, yapıcı bir iletişim ortamını sürdürmek ve roleplay bütünlüğünü desteklemekle yükümlüdür. Sunucu içindeki tüm iletişimlerde temel kriterler saygı, nezaket ve yapıcılıktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.2",
            title: "Hakaret ve Kişisel Saldırı Yasağı",
            description: "Hakaret, aşağılama, tehdit, kişisel sataşma ve aşağılayıcı her türlü ifade kesinlikle yasaktır. Tüm iletişim, karşılıklı saygı ve nezaket çerçevesinde yürütülmek zorundadır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.3",
            title: "Kışkırtıcı ve Ortam Bozucu Davranışlar",
            description: "Kavga çıkartma amacı güden, kışkırtıcı veya topluluk huzurunu bozan tutum ve davranışlar yasaklanmıştır. Bu tür eylemler, doğrudan yaptırım sebebi oluşturur. Yapıcı tartışmalar desteklense de; gerginlik oluşturan, kişiselleştirmeye dayalı veya tahrik edici tutumlar rol ortamına zarar verdiği için hoş görülmez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.4",
            title: "Irkçılık, Ayrımcılık ve Nefret Söylemi",
            description: "Din, dil, ırk, siyasi görüş, cinsiyet, cinsel yönelim veya benzeri konular üzerinden yapılan her türlü ayrımcı söylem ve nefret söylemi asla kabul edilmez. Bu davranışlar, Kaze-Z topluluk değerlerini doğrudan ihlal eden ciddi kural ihlalleri olarak değerlendirilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.5",
            title: "Küfür ve Hakaret Politikası",
            description: "Rol içerisindeki taraflar arasında gelişen diyaloglar sonrası edilen küfür ile, hiçbir diyalog yaşamamış iki karakter arasında gerçekleşen küfür aynı kapsamda değerlendirilmez.\n\n• ADK (Ailevi Değerlere Küfür): Uygun rol ortamında kullanılması serbesttir.\n• DDK (Dini ve Manevi Değerlere Küfür): Kalıcı uzaklaştırma sebebidir, kesinlikle yasaktır.\n• Cinsiyetçi Küfürler: Cinsiyet fark etmeksizin aşırı seviyede taciz boyutuna varan söylemler en ağır cezalarla sonuçlanır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.6",
            title: "Yetkililere Saygı",
            description: "Sunucu yetkilileri gönüllülük esasıyla görev yapmaktadır. Yetkililere yönelik tehdit, baskı, küçümseyici tavır, sorgulayıcı veya kışkırtıcı üslup kabul edilemez olup yaptırıma tabidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.7",
            title: "Topluluk Düzenine Zarar Verme",
            description: "Sürekli olarak ortamı germek, sohbet veya rol akışını aksatmak ya da topluluğu bölmeye yönelik davranışlar sergilemek ağır yaptırımlarla sonuçlanır. Her üye, yalnızca kendi deneyimini değil; topluluğun genel huzurunu ve düzenini de gözetmekle yükümlüdür.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.8",
            title: "Ortak Sorumluluk İlkesi",
            description: "Saygı ve düzen anlayışı sadece Discord ortamıyla sınırlı değildir; oyun içi roleplay sürecinde de aynı şekilde geçerlidir. Her üye, huzurlu ve güvenli bir topluluk yapısının devamı için aktif sorumluluk üstlenmekle yükümlüdür.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.2.9",
            title: "Kışkırtma, Tahrik ve Manipülasyon",
            description: "Bir oyuncunun kural ihlali yapması kadar, onu bu ihlale sürükleyen, bilinçli biçimde kışkırtan ve ortamı geren davranışlar da suç sayılır. Karşı tarafı küfür etmeye, kural ihlali yapmaya veya saldırganlaşmaya zorlayacak şekilde sürekli tacizde bulunmak yasaktır. Olayı başlatan kişi de eşit derecede sorumlu kabul edilir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.3",
        title: "IC/OOC Ayrımı ve Olay Taşıma",
        description: "Karakter içi ve karakter dışı davranış kuralları.",
        rules: [
          {
            id: "1.3.1",
            title: "Ayrımın Önemi",
            description: "Kaze-Z, roleplay odaklı bir topluluktur. Bu nedenle IC (Karakter İçi) ile OOC (Karakter Dışı) ayrımına dikkatle uyulması zorunludur. Rol deneyiminin kalitesi, bu sınırın korunmasına bağlıdır. Oyuncunun tutumları yalnızca karakterine özgü olmalı; gerçek hayattaki niyet ve duygular role yansıtılmamalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.3.2",
            title: "Metagaming Yasağı",
            description: "OOC ortamda edinilen bilgiler IC ortamda kullanılamaz. Bu durum, rol bütünlüğünü bozan en ciddi ihlallerden biridir.\n\nÖrnekler:\n• Discord üzerinden öğrenilen bir konumu oyun içinde kullanmak\n• Yayın takip ederek diğer oyuncuların konumuna gitmek\n• Özel mesaj yoluyla alınan bilgiyi IC'de kullanmak",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.3.3",
            title: "Olay Taşıma Yasağı",
            description: "IC ortamında yaşanan olaylar OOC'ye taşınamaz. OOC'deki kişisel husumetler IC'ye yansıtılamaz. Rol içinde gelişen tüm olaylar karakterler arasında kalmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.3.4",
            title: "Kışkırtıcı Paylaşım ve Tartışmalar",
            description: "Oyun içi olayların Discord'da paylaşılması, yorumlanması veya kışkırtıcı bir üslupla gündeme getirilmesi yasaktır. \"Ekran görüntüsü atıp olayı yaymak\" veya \"yayında izletip yorum toplamak\" role değil, tartışmayı alevlendirmeye hizmet eder.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.3.5",
            title: "Kişisel Tartışmaların Rol Dışına Taşınmaması",
            description: "Oyun içi çatışmalar, anlaşmazlıklar veya rol kaynaklı sorunlar OOC tartışmaya dönüştürülemez. Her oyuncu, yaşadığı olayları karakter bakış açısından ele almalı; kişisel gerginliğe dönüştürmemelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.3.6",
            title: "Saygı Çerçevesi",
            description: "Karakterler arası anlaşmazlıklar, oyuncular arasında kişisel gerginliğe dönüşemez. Oyuncular her koşulda karşılıklı saygıyı korumalıdır. IC'de yaşanan her şey IC sınırları içinde kalmalıdır.\n\n\"Kaze-Z'de karakterlerin birbirine düşman olması, oyuncuların düşman olduğu anlamına gelmez. Rol biter; saygı kalır.\"",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.3.7",
            title: "Cezai Yaptırımlar",
            description: "IC/OOC ayrımının ihlali, rol bütünlüğünü doğrudan bozan ağır bir kusurdur. Uygulanabilecek yaptırımlar: Uyarı, Geçici uzaklaştırma veya Kalıcı yasaklama.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.4",
        title: "Mesaj ve İletişim Düzeni",
        description: "Discord iletişim kuralları.",
        rules: [
          {
            id: "1.4.1",
            title: "Spam Yasağı",
            description: "Aynı mesajın peş peşe gönderilmesi, birden fazla üye tarafından toplu tekrarlar veya sohbet akışını aksatacak içerikler yasaktır. Sohbetin akıcı, anlaşılır ve düzenli ilerlemesi esastır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.4.2",
            title: "Etiket Kullanımı",
            description: "Yetkili, geliştirici veya topluluk rollerini gereksiz yere etiketlemek yasaktır. Etiket, sadece gerçekten gerekli durumlarda yönlendirme ya da bilgilendirme için kullanılmalıdır. Gereksiz etiket, iletişim düzenini bozduğu için uyarı veya geçici susturma ile sonuçlanabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.4.3",
            title: "Hata ve Bug Bildirimi",
            description: "Hata ve bug bildirimleri sadece ilgili kanallar üzerinden yapılmalıdır. Genel sohbetlerde bu tür konuların gündeme getirilmesi sohbet bütünlüğünü bozar. Hata raporları için #bug-bildiri; öneriler için #istek-öneri kullanılmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.4.4",
            title: "Destek Talepleri",
            description: "IC veya OOC fark etmeksizin tüm destek talepleri yalnızca ticket sistemi üzerinden kabul edilir. Ticket dışındaki kanallardan iletilen talepler dikkate alınmaz. Ticket'larda sıralama önceliği geçerlidir; sabırlı olunması gerekir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.4.5",
            title: "Özel Mesaj (DM) Yasağı",
            description: "Yetkililere doğrudan DM göndermek yasaktır. Tüm süreçler ticket üzerinden yürütülür. Bu kural, hem iş yükünü düzenlemek hem de işlemleri kayıt altına almak için gereklidir. Ticket dışı DM'ler görmezden gelinebilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.4.6",
            title: "Bağlayıcılık",
            description: "Bu kurallar, Discord iletişiminin düzenli, şeffaf ve işlevsel sürdürülmesi için bağlayıcıdır. Her üye, kanalları amacına uygun kullanmakla yükümlüdür.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.5",
        title: "Reklam ve Paylaşım Kuralları",
        description: "Paylaşım ve içerik kuralları.",
        rules: [
          {
            id: "1.5.1",
            title: "Reklam Yasağı",
            description: "Her türlü dış yönlendirme (Discord/Telegram grubu, sosyal medya bağlantısı, yayın kanalı vb.) paylaşımı yasaktır. Partnerlik/iş birliği talepleri yalnızca üst yönetimle ve ticket sistemi üzerinden görüşülür. Sadece yayın duyuruları, yayıncılar tarafından yayın duyuru kanalına iletilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.2",
            title: "Müstehcenlik ve Taciz İçerikleri",
            description: "Taciz, cinsel ima, uygunsuz görsel veya durum mesajları yasaktır. Bu tür paylaşımlar, Kaze-Z'nin değerlerini ve güvenli ortam ilkesini ihlal eder. \"Şaka amacıyla\" bile olsa kabul edilmez ve ağır yaptırımlar uygulanır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.3",
            title: "Profil Kullanımı",
            description: "Kullanıcı adı, profil fotoğrafı veya durum mesajı; müstehcen, kışkırtıcı, yanıltıcı, hakaret içeren veya tahrik edici olamaz. \"Kaze-Z Staff\" gibi yanıltıcı isimler yasaktır. Aşırı politik/erotik görseller doğrudan yaptırım sebebidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.4",
            title: "Topluluk Düzenini Bozan Paylaşımlar",
            description: "Sohbet bütünlüğünü bozan, rahatsız edici veya kışkırtıcı görsel, GIF ya da mesajların paylaşılması yasaktır. Her paylaşım, topluluk huzurunu gözetmelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.5",
            title: "DM Üzerinden Reklam veya Taciz",
            description: "DM yoluyla reklam veya taciz yasaktır. Şikâyet olduğunda konu ticket üzerinden incelenir; kanıt sunulursa kalıcı yaptırım uygulanır. DM ile başka sunuculara davet göndermek de reklam kapsamındadır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.6",
            title: "OOC Dolandırıcılık",
            description: "Rol dışı (OOC) alanlarda dolandırıcılık yasaktır. Bu davranış, topluluk güvenliğini ihlal eden en ağır suçlardandır ve kalıcı uzaklaştırma sebebidir. Örnek: Gerçek para veya oyun içi eşyaları OOC takasla aldatmak.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.7",
            title: "Oyunculara ve Topluluk Üyelerine Saygı",
            description: "Kaze-Z, güvenli ve eşitlikçi bir ortam ilkesini benimser. Kadın oyunculara veya erkek oyunculara yönelik müstehcen tavır, taciz edici yaklaşım ve rahatsız edici davranışlar kesinlikle yasaktır. Bu konularda sıfır tolerans politikası uygulanır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.5.8",
            title: "Bağlayıcılık",
            description: "Paylaşımlar, hem Discord kurallarına hem de topluluk huzuruna uygun olmalıdır. Aksi durumda yaptırım kaçınılmazdır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.6",
        title: "Destek Sistemi ve Yetkili İletişimi",
        description: "Ticket ve destek süreçleri kuralları.",
        rules: [
          {
            id: "1.6.1",
            title: "Destek Başvurularının Yöntemi",
            description: "IC ya da OOC her türlü sorun, talep ve şikâyet yalnızca ticket yoluyla iletilmelidir. Ticket dışı kanallardan yapılan başvurular işleme alınmaz. Ticket başlığının kısa, öz ve açıklayıcı olması süreci hızlandıracaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.2",
            title: "Delil ve Kayıt Şartı",
            description: "Kanıt (ekran görüntüsü, video kaydı, log veya detaylı açıklama) içermeyen ticket'lara destek sağlanamaz. Yetkililer açıklamayı dinler, mevcut verileri inceler ve süreci buna göre belirler. SS veya kısa video kaydı yoksa RDM bildirimi değerlendirmeye alınmaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.3",
            title: "Sabır ve Bekleme Yükümlülüğü",
            description: "Ticket süreci, talebin içeriğine ve yoğunluğa göre zaman alabilir. Cevap gecikebilir; bu sürede sabırlı olmak esastır. Sürekli \"ne zaman bakılacak\" tarzı mesajlar işleyişi yavaşlatır. Öncelik durumu, aciliyet ve konunun niteliğine göre belirlenir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.4",
            title: "Hatalı veya Yanıltıcı Beyan",
            description: "Yetkilileri yanlış yönlendirmek, sahte kanıt sunmak veya olayı çarpıtmak yasaktır. \"Bende görünmedi\", \"öyle demek istemedim\", \"şakaydı\" gibi savunmalar geçersizdir. Ticket sürecinin kötüye kullanılması ağır yaptırımlara yol açar.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.5",
            title: "DM (Özel Mesaj) Kullanımı",
            description: "Yetkililere DM göndermek yasaktır; tüm iletişim ticket üzerinden sağlanır. Bu kural, sürecin şeffaf, kayıtlı ve adil yürümesi için zorunludur. \"Hızlı yanıt almak istedim\" bahanesi, DM kuralı ihlalini haklı çıkarmaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.6",
            title: "Destek Sürecine Müdahale",
            description: "Yetkililerin ticket yönetme yöntemi tartışmaya açılamaz. Geliştirici/yönetim ekibi, süreci kendi inisiyatifiyle yönetir. Karara müdahale etmeye çalışmak veya tartışmayı uzatmak cezai işlem gerektirebilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.7",
            title: "Sistemin Suistimali",
            description: "Gereksiz ticket oluşturmak, aynı konuyu ısıtıp gündeme getirmek veya başkalarının vaktini çalmak yasaktır. Bu davranış, yetkililerin zamanını israf eder ve hak kaybına sebep olur. Sistemi istismar edenlere geçici veya kalıcı uzaklaştırma uygulanabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.6.8",
            title: "Yükümlülük ve Bağlayıcılık",
            description: "Ticket sistemi, topluluk düzenini ve adalet ilkesini korumak için zorunludur. Bu sürece uymak her üyenin sorumluluğundadır. Destek aşamasında saygılı, sabırlı ve dürüst davranmak çok önemlidir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.7",
        title: "Gizlilik ve Kişisel Veriler",
        description: "Kişisel bilgi koruma kuralları.",
        rules: [
          {
            id: "1.7.1",
            title: "Kişisel Bilgi Paylaşımı",
            description: "Herhangi bir üyenin isim-soyisim, adres, telefon numarası, e-posta adresi, sosyal medya hesabı, fotoğrafı veya özel yaşamına dair veriler ifşa edilemez. Bu tür bilgiler, sadece kişinin açık rızası dahilinde paylaşılabilir. \"Profili zaten herkese açık\" gibi bahaneler kabul edilmez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.2",
            title: "Doxing (İfşa)",
            description: "Bir üyenin kimlik bilgilerini, özel yazışmalarını, ekran görüntülerini veya kişisel materyallerini izni dışında yaymak en ağır ihlal sayılır. Bu eylem doğrudan süresiz uzaklaştırma nedenidir; gerektiğinde hukuki mercilere bildirilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.3",
            title: "Özel Görüşmelerin Yayılması",
            description: "Discord üzerinden yapılan özel mesajlaşmalar, sesli görüşmeler veya yazılı sohbetler, tarafların izni olmaksızın ifşa edilemez. \"Şaka yapıyordum\" savunması geçersizdir. Kişisel sınırların ihlali topluluk güvenliğini zedeler.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.4",
            title: "Ses ve Görüntü Kayıtları",
            description: "Sunucu içinden elde edilen ekran görüntüleri, ses veya video kayıtları yalnızca raporlama amacıyla kullanılabilir. Bu kayıtların sosyal medyada veya dış platformlarda paylaşılması yasaktır. Yayıncılar, sesli kanalda kayıt alacaklarsa kanalda bulunan üyeleri önceden bilgilendirmekle yükümlüdür.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.5",
            title: "Veri Yoluyla Baskı",
            description: "Bir oyuncunun özel yaşamına veya kişisel verilerine ait bilgiler, tehdit veya şantaj aracı olarak kullanılamaz. Bu tür davranışlar kalıcı yasaklama ile sonuçlanır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.6",
            title: "Topluluk Güvenliği",
            description: "Gizlilik ihlali, sadece bir kural çiğneme durumu değil; topluluk bütünlüğüne karşı işlenmiş bir suçtur. Yönetim, bu davranışlara karşı sıfır tolerans gösterir. Her üye, diğerlerinin güvenliğini korumakla da yükümlüdür.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.7",
            title: "Yaptırımlar",
            description: "Gizlilik ihlali yapan kullanıcıya doğrudan kalıcı uzaklaştırma uygulanır. Duruma göre kayıt ve raporların arşivlenmesi söz konusudur. Ağır veya tekrarlanan ihlallerde dosya adli sürece taşınabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.7.8",
            title: "Güvenli Ortam Sözü",
            description: "Kaze-Z, tüm oyuncularına güvenli, saygılı ve huzurlu bir ortam sunmayı hedefler. Hiçbir üye, kişisel bilgilerinin tehdit altında olduğu hissine kapılmamalıdır. Gizlilik ihlali şüphesi oluştuğunda zaman kaybetmeden ticket açılmalıdır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "1.8",
        title: "Yaptırımlar ve Son Hükümler",
        description: "Genel yaptırım ve son maddeler.",
        rules: [
          {
            id: "1.8.1",
            title: "Uyarı",
            description: "Hafif hatalarda sözlü veya yazılı uyarı yapılır. Bu, üyeye hatasını düzeltme imkânı tanır. Tekrarı durumunda yaptırımın şiddeti artırılır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.8.2",
            title: "Geçici Susturma (Mute)",
            description: "Sohbet düzenini bozan veya iletişimi aksatan ihlallerde uygulanır. Belirli bir süre sesli/yazılı iletişim kısıtlanır. Amaç, düzeni yeniden kurmaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.8.3",
            title: "Geçici Uzaklaştırma (Kick/Ban)",
            description: "Tekrar eden ihlallerde veya topluluğu doğrudan etkileyen ciddi kuralsızlıklarda uygulanır. Üye belirli bir süre sunucudan uzaklaştırılır; bu süre içinde geri dönüş talep edilemez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.8.4",
            title: "Kalıcı Yasaklama",
            description: "En ağır ihlallerde (örneğin doxing, taciz, OOC dolandırıcılık, ağır saygısızlık) doğrudan uygulanır. Üye kalıcı olarak uzaklaştırılır; geri dönüş hakkı tanınmaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "1.8.5",
            title: "Son Hükümler",
            description: "Yönetim, gerektiğinde kuralları güncelleyebilir veya yeni maddeler ekleyebilir. Duyurulan güncellemeler yayımlandığı andan itibaren bağlayıcı sayılır. \"Bilmemek\" muafiyet sağlamaz; her üye güncel kuralları takip etmekle yükümlüdür. Yönetim, topluluk huzuru, güvenliği ve roleplay kalitesi için son karar merciidir.",
            lastUpdate: "31.12.2024"
          }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Oyun İçi Kurallar",
    subCategories: [
      {
        id: "2.1",
        title: "Oyun İçi IC/OOC Kullanımı",
        description: "IC ve OOC ayrımı kuralları.",
        rules: [
          {
            id: "2.1.1",
            title: "IC ve OOC Ayrımı",
            description: "Oyun içindeki tüm konuşma, eylem ve etkileşimler IC kabul edilir. PM (özel mesaj), sadece zorunlu durumlarda ve kısa süreli kullanılabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.2",
            title: "PM'nin IC'ye Taşınması",
            description: "Discord, yayın veya dış platformlardan edinilen bilgiler IC'de kullanılamaz. Benzer şekilde IC'de yaşanan bir olay OOC tartışmaya taşınamaz. \"Discord'da biri bana düşman, oyunda saldırayım\" gibi davranışlar yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.3",
            title: "Tartışmaların Yönetimi",
            description: "Rol sırasında yaşanan anlaşmazlıklar; \"Discord'a gel konuşalım\" veya \"abartma, alt tarafı oyun\" gibi ifadelerle sürdürülemez. Bu tutumlar doğrudan yaptırım nedenidir. Doğru yöntem, durumu kayıt altına alıp ticket üzerinden yetkililere iletmektir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.4",
            title: "Karakterin Gerçekçiliği",
            description: "Her karakter, Kaze-Z evreninin yaşayan bir parçasıdır. Davranışlar; karakterin geçmişi, kişiliği ve hikâyesiyle uyumlu olmalıdır. Bilgi, güç veya psikoloji OOC niyetlerle değiştirilemez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.5",
            title: "Başka Oyuncuların İhlalleri",
            description: "IC/OOC karışımı veya metagaming ihlali tespit eden oyuncu, bunu kanıt (görsel/video/kayıt) ile ticket üzerinden bildirmelidir. Kendi başına tepki vermek veya OOC tartışma başlatmak yaptırım sebebidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.6",
            title: "Rolün Bütünlüğü",
            description: "Scriptsel hatalar, teknik aksaklıklar veya yönetimin \"Ghost RP\" talimatlarına uyulmalıdır. Amaç, rol bütünlüğünü korumaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.7",
            title: "Dış Kaynaklı Bilgi Kullanımı",
            description: "Karakterler, IC ortamda vakıf olmadıkları bir bilgiyi Discord, yayın veya üçüncü şahıslardan öğrenip \"duydum/biliyorum\" diyemez. Rol, sadece karakterin bizzat yaşadığı, gördüğü ya da işittiği olaylara dayanır. OOC bilgiyi IC'de kullanmak (metagaming) ağır bir suçtur.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.8",
            title: "IC/PM Karışımı",
            description: "IC diyalogların PM üzerinden yürütülmesi yasaktır. PM, rol diyaloglarının yerini tutamaz. Rol içi iletişim yalnızca IC komutlarla (/me, /do) sürdürülmelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.1.9",
            title: "Cezai Yaptırımlar",
            description: "IC/OOC ayrımı ihlalinde uygulanabilecek yaptırımlar: Uyarı, Geçici uzaklaştırma veya Kalıcı yasaklama.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.2",
        title: "Powergaming",
        description: "Powergaming tanımı ve kuralları.",
        rules: [
          {
            id: "2.2.1",
            title: "Gerçek Dışı Eylemler",
            description: "Karakterin fiziksel/zihinsel sınırlarını aşan, gerçekçilikten kopuk eylemler kabul edilmez. Her oyuncu, karakterini evrenin kuralları ve mantığına uygun yönetmek zorundadır.\n\nÖrnekler:\n• Tek başına onlarca zombiyi alt etmek\n• Zincirli kapıyı tek yumrukla parçalamak\n• Patlamadan hasar almadan yürüyüp gitmek",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.2.2",
            title: "Karşı Tarafın İradesini Yok Sayma",
            description: "Rol, tarafların etkileşimiyle şekillenir. Karşı tarafa eylem hakkı tanımayan roller geçersiz sayılır. Rolün seyri, karşılıklı /me ve /do etkileşimiyle ilerler.\n\nÖrnek: \"/me şahsı bayıltır ve sürükler\" ifadesi, karşı taraf reaksiyon veremeden oynanırsa powergaming kabul edilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.2.3",
            title: "Zorlama ve Dayatma",
            description: "Oyuncular, geçerli bir gerekçe olmaksızın başkalarını arzu etmedikleri bir durumun içine sürükleyemez. Kaçırma, esir alma, işkence gibi roller yalnızca hikâye bütünlüğüne dayalı ve karşılıklı rıza ile oynanabilir.\n\nDoğru örnek:\n• \"/me bileği yakalamaya yeltenir.\"\n• \"/do karşılık verebilir misin?\"",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.2.4",
            title: "Teknik Avantajların Kötüye Kullanımı",
            description: "Oyun mekaniği, script veya üçüncü parti yazılımlarla haksız üstünlük elde etmek yasaktır. Exploit, bug abuse ve benzeri davranışlar powergaming kapsamındadır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.2.5",
            title: "Rolün Doğal Akışını Bozmak",
            description: "Her oyuncu, rolün gelişimini doğal seyrine bırakmalıdır. Olayları tek taraflı kontrol eden, başkalarına alan tanımayan veya akışı aksatan tavırlar kabul edilmez. Sürekli \"kahraman/yenilmez\" kalmak veya her sahnede kontrolü ele geçirmek yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.2.6",
            title: "Cezai Yaptırımlar",
            description: "Powergaming ciddi bir ihlaldir. Uyarı, geçici uzaklaştırma veya kalıcı yasaklama uygulanabilir. Yönetim; bozulan rolleri iptal etme, geri sarma veya yeniden oynatma yetkisine sahiptir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.3",
        title: "Metagaming",
        description: "Metagaming tanımı ve kuralları.",
        rules: [
          {
            id: "2.3.1",
            title: "Metagaming Tanımı",
            description: "Discord sohbetleri, yayınlar, özel mesajlar, forumlar gibi dış kaynaklardan elde edilen bilgilerin IC davranış, karar veya konuşmalara yansıtılması metagaming'dir ve ağır yaptırım gerektirir.\n\n\"Rol, karakterin bilinciyle oynanır; oyuncunun bilgisiyle değil.\"",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.3.2",
            title: "Açık Örnekler (Yasak)",
            description: "• Discord'da duyulan konumu oyunda kullanmak\n• Yayın bilgisini IC'ye \"kulağıma geldi/biliyorum\" şeklinde taşımak\n• PM'den gelen bilgiyi karakter biliyormuşçasına kullanmak\n• Sesli/Discord'dan öğrenilen detayla doğrudan karakteri suçlamak",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.3.3",
            title: "IC/OOC Ayrımına Uymak",
            description: "IC'de yaşanan OOC'ye, OOC'de olan IC'ye taşınamaz. Karakterin tepkisi, yalnızca IC deneyimine dayanmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.3.4",
            title: "Tartışmalar ve Çözüm",
            description: "Metagaming ihlalinde tartışma başlatmak yasaktır. Doğru yöntem; durumu kayıt altına alıp ticket üzerinden bildirmektir. \"Metagaming yaptın\" demek yerine /report veya ticket kullanılmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.3.5",
            title: "Ghost RP ve Yönetim Yönlendirmeleri",
            description: "Etkinlik, teknik aksaklık veya scriptsel hatalarda yönetimin \"Ghost RP\" talimatları bağlayıcıdır. Amaç, rol bütünlüğünü korumaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.3.6",
            title: "Bilgi Sızdırma ve İzinsiz Paylaşım",
            description: "Bir karakterin geçmişi/gizli planı/özel olayları OOC'de öğrenilip IC'de kullanılamaz. Yayın, forum, sohbet veya DM'den edinilen bilgiler IC sayılmaz. \"Duydum, söylediler\" gibi IC bahaneler metagaming savunması olamaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.3.7",
            title: "Cezai Yaptırımlar",
            description: "Metagaming ağır bir ihlaldir.\n\n• İlk ihlalde: Uyarı veya geçici yaptırımlar\n• Tekrarlanan/kasıtlı ihlallerde: Geçici uzaklaştırma veya kalıcı yasaklama\n\nGerektiğinde; rolün sıfırlanması, olayın iptali veya karakterin hikâyesinin silinmesi gibi ek tedbirler uygulanabilir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.4",
        title: "FearRP ve NVL (Hayatın Değeri)",
        description: "Korku ve hayatın değeri kuralları.",
        rules: [
          {
            id: "2.4.1",
            title: "FearRP'nin Tanımı",
            description: "FearRP; hayati tehlike olan durumlarda karakterin mantıklı ve gerçekçi tepkiler vermesidir. Oyuncu, karakterini \"ölümsüz/korkusuz/etkilenmez\" gibi gösteremez.\n\nÖrnek:\n• Silah doğrultulmuş karakterin kaçmaya kalkışması FearRP ihlalidir\n• Zombi saldırısında sakinçe yürümeye devam etmek FearRP ihlalidir",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.4.2",
            title: "NVL'nin Tanımı",
            description: "NVL, hayatın değerini bilme kuralıdır. Karakter, yaşamını riske atacak davranışlardan kaçınmalı; hayatta kalma içgüdüsüyle hareket etmelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.4.3",
            title: "Açık Örnekler (Yasak)",
            description: "• Silah doğrultulmuşken normal davranmak\n• Zombi sürüsü içinde tehlike yokmuşçasına yürümek\n• Kurtulamayacağı bir durumda direnmeyi sürdürmek\n• Ölüm tehdidi altındayken alay etmek/mantıksız cevaplar vermek",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.4.4",
            title: "Karakterin Gerçekçiliği",
            description: "Her karakterin ölüm korkusu mevcuttur. \"Benim karakterim korkusuzdur\" beyanı, ölüm karşısında mantıksız davranmayı meşru kılmaz; korkuyu bastırmak bir rol tercihidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.4.5",
            title: "Kaçırılma ve Esir Rolleri",
            description: "Kaçırılma/esir rolleri gerçekçi ve tutarlı oynanmalıdır. Karakter, hayatını hiçe sayacak şekilde direnemez veya tehdidi alaya alamaz. \"Vur hadi beni\" diyerek meydan okumak NVL ihlalidir. \"Korkudan paniğe kapılıp tutarsız davranmak\" iyi bir FearRP örneğidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.4.6",
            title: "Cezai Yaptırımlar",
            description: "• İlk ihlalde: Uyarı veya geçici yaptırımlar\n• Mükerrer/ağır ihlallerde: Geçici uzaklaştırma veya kalıcı yasaklama",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.5",
        title: "Combat Logging",
        description: "Çatışma sırasında çıkış yapma kuralları.",
        rules: [
          {
            id: "2.5.1",
            title: "Tanım",
            description: "Çatışma, kovalamaca, kaçırılma, rehin alma, yaralanma gibi kritik anlarda oyundan çıkmak; IC durumdan kaçmak amacıyla sunucudan ayrılmak Combat Logging kapsamındadır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.5.2",
            title: "Örnekler (Yasak)",
            description: "• Silahlı çatışma sırasında çıkış yapmak\n• Kaçırılma/rehin rolünde sunucudan ayrılmak\n• Yaralı halde rol sürerken oyundan çıkmak\n• Zombi saldırısı altında \"AFK/çıktım\" diyerek bağlantıyı kesmek\n\nNot: \"Lag oldu kapattım\" mazereti, tekrarlanmaması kaydıyla dikkate alınabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.5.3",
            title: "İstisnalar",
            description: "Gerçek hayattaki acil durumlarda (sağlık, aile vb.) mümkünse /report veya ticket ile bilgi verilmelidir. İnternet/elektrik kesintisi gibi teknik arızalarda, geri bağlanınca rolün devamı sağlanmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.5.4",
            title: "Rolün Devamlılığı",
            description: "Combat Logging, sadece kendi rolünü değil; karşı tarafın emeğini ve sahne bütünlüğünü de heba eder. Rolü tamamlamak saygı göstergesidir; yarım bırakılan her sahne hikâyeye ve topluluk kalitesine zarar verir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.5.5",
            title: "Cezai Yaptırımlar",
            description: "• İlk ihlalde: Uyarı veya kısa süreli uzaklaştırma\n• Tekrarlanan/kasıtlı vakalarda: Geçici uzaklaştırma veya kalıcı yasaklama\n\nYönetim; bozulan rolleri iptal etme, geri sarma veya yeniden oynatma yetkisine sahiptir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.6",
        title: "RDM ve VDM Kuralları",
        description: "Rastgele öldürme ve araçla öldürme kuralları.",
        rules: [
          {
            id: "2.6.1",
            title: "RDM Tanımı",
            description: "Geçerli bir IC gerekçe olmaksızın veya rolü inandırıcı bir şekilde geliştirmeden saldırmak/öldürmek RDM'dir.\n\nYasak örnekler:\n• Keyfi silah kullanımı\n• IC geçmiş/husumet olmadan sebepsiz yere öldürmek\n• Sözlü gerilimi pas geçip direkt silaha sarılmak",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.6.2",
            title: "VDM Tanımı",
            description: "VDM, araçların gerçekçilik dışı bir biçimde silah niyetine kullanılmasıdır.\n\nYasak örnekler:\n• Oyuncuların üzerine kasten araç sürmek\n• Rol dışı sebeplerle araçla çarpmak\n• Kaçamayacak durumdaki birine araçla defalarca müdahalede bulunmak",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.6.3",
            title: "Rol Gerekçesi Zorunluluğu",
            description: "Her şiddet eylemi, güçlü bir IC gerekçeye dayanmalıdır. Olay akışıyla örtüşmeyen şiddet RDM/VDM kabul edilir. Rolün amacı öldürmek değil; etkileşim yaratmaktır.\n\n\"Karakterim öfkelendi, vurdum.\" geçerli bir gerekçe değildir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.6.4",
            title: "Araç Kullanımı ve Gerçekçilik",
            description: "Araçlar; ulaşım ve hayatta kalma amacıyla kullanılır. Araçla saldırı, yalnızca rolün doğal akışı içinde (örneğin zombi sürüsünden kaçarken) kabul görebilir. Aracı silah gibi kullanmak VDM'dir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.6.5",
            title: "Cezai Yaptırımlar",
            description: "• İlk ihlalde: Geçici uzaklaştırma\n• Tekrarlanan/kasıtlı eylemlerde: Kalıcı yasaklama\n\nYönetim; RDM/VDM sebebiyle bozulan rolleri iptal etme, yeniden oynatma veya geçersiz sayma yetkisine sahiptir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.7",
        title: "Karakter Ölümü ve CK Kuralları",
        description: "Karakter ölümü (Character Kill) kuralları.",
        rules: [
          {
            id: "2.7.1",
            title: "CK (Character Kill) Tanımı",
            description: "CK, karakterin evrenden tamamen silinmesidir. CK olan karakter geri dönemez. CK, yalnızca yönetim onayı, IC gerekçe, gerekli kanıtlar ya da şartlar oluştuğu takdirde uygulanır. Akabinde oyuncu yeni karakter oluşturur; yeni karakter eskiyle doğrudan bağlantı kuramaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.7.2",
            title: "Ölüm Rolü Zorunluluğu",
            description: "Her ölüm sahnesi detaylı ve gerçekçi canlandırılmalıdır. Acı, korku, panik, çaresizlik gibi hisler role yansıtılmalıdır. \"Ölmüyorum/ölmedim zira istemiyorum\" yaklaşımı NVL/FearRP ihlalidir. Ölümü es geçmek veya IC'yi yok saymak kabul edilemez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.7.3",
            title: "CK Süreci",
            description: "CK talebi ticket ile yönetime iletilir. Yönetim; IC gelişim, gerekçeler ve kayıtları inceleyerek karar verir. Onay olmaksızın hiçbir karakter tek taraflı CK edilemez. CK kararı, Kaze-Z adminleri ve gerekli şartları karşılayan kişiler tarafından uygulanabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.7.4",
            title: "Karakter Hikâyesi ve Gelişimi",
            description: "CK, yalnızca bir karakteri değil; onunla etkileşimde bulunanların hikâyesini ve duygusal bağlarını da etkiler. Bu sebeple CK kararları dikkatle ve gerekçeyle alınmalıdır. CK bir \"ceza\" değil; \"hikâye tamamlanmasıdır.\"",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.7.5",
            title: "Cezai Yaptırımlar",
            description: "CK'yi yönetim onayı olmadan uygulamak ağır ihlaldir. Ölüm rolünden kaçınmak, ölümü hafife almak veya IC sorumluluktan kaçmak da yaptırım sebebidir. Yönetim; uyarı, geçici uzaklaştırma veya kalıcı yasaklama uygulayabilir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.8",
        title: "Rol İhlalleri (FailRP, Troll vb.)",
        description: "FailRP ve troll davranış kuralları.",
        rules: [
          {
            id: "2.8.1",
            title: "FailRP",
            description: "FailRP; karakterin IC gerekliliklerini yerine getirmemesi veya gerçekçilikten uzak davranmasıdır.\n\nÖrnekler:\n• Role uygun olmayan hareketler\n• Karakterin kişiliğiyle çelişen tutumlar\n• Yaralıyken koşmayı sürdürmek\n• Gerçek olayların sonuçlarını IC'ye yansıtmamak",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.8.2",
            title: "Troll Davranışlar",
            description: "Rol ortamını sabote etmek, ciddiyetini bozmak veya alaya almak yasaktır.\n\nYasak:\n• Gereksiz ses çıkarmak, rol sırasında uygunsuz emote/dans kullanmak\n• Rol anında anlamsız hareketlerle dikkat çekmek\n• Oyunu \"şaka/geyik\" ortamına dönüştürmek",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.8.3",
            title: "Mizah ve Şaka Kullanımı",
            description: "Apokaliptik atmosfer, farklı psikolojilere ev sahipliği yapabilir; mizah, karakterin yapısıyla sınırlı kalmak kaydıyla rolün bir parçası olabilir. Ancak abartılı mizah, rol ciddiyeti hiçe sayıldığında troll davranış olarak addedilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.8.4",
            title: "Rolün Ciddiyetine Zarar Vermek",
            description: "Evrenin gerçekçiliğine aykırı, mantıksız veya evren dışı roller yasaktır.\n\nYasak:\n• \"Süper kahraman\" gibi davranmak\n• Komedi unsuru ile inandırıcılığı zedelemek\n• Gerçek dışı ekipman/güç/davranış sergilemek",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.8.5",
            title: "Copbait İhlali",
            description: "Sunucu içerisindeki kolluk kuvvetleri ile etkileşime girdiğiniz rollerde copbait yapmanız durumunda OOC olarak herhangi bir yaptırım ile karşılaşmazsınız ama rolün olağan akışına göre çeşitli IC sonuçlar ile karşı karşıya kalabilirsiniz.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.9",
        title: "Dolandırıcılık (Scamming) ve Exploit",
        description: "Dolandırıcılık ve hile kuralları.",
        rules: [
          {
            id: "2.9.1",
            title: "IC Dolandırıcılık",
            description: "IC dolandırıcılık; hikâyeye hizmet etmeyen, haksız kazanç odaklı manipülasyonlardır. Kaze-Z'de aldatma, yalnızca hikâyeye katkı sunduğu sürece kabul görebilir.\n\nYasak örnekler:\n• Oyuncular arası ticarette güveni kötüye kullanmak\n• Var olmayan bir ürünü \"varmışçasına\" pazarlamak",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.9.2",
            title: "OOC Dolandırıcılık",
            description: "OOC dolandırıcılık; oyun dışı ortamlarda gerçek para/çıkar karşılığı işlemler yürütmektir.\n\nYasak:\n• Gerçek para karşılığında item/karakter/whitelist satışı yapmak\n• Discord üzerinden mal/eşya/avantaj takasına girişmek\n\nBu eylemler doğrudan kalıcı yasaklamaya yol açar.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.9.3",
            title: "Exploit Kullanımı",
            description: "Script, bug veya mekanik açıklarını kötüye kullanarak haksız avantaj sağlamak yasaktır.\n\nÖrnekler:\n• Envanter bug'ıyla eşya kopyalamak\n• Model hataları üzerinden saldırı avantajı elde etmek\n• Script hatalarını IC çıkarına çevirmek",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.9.4",
            title: "Üçüncü Parti Uygulamalar",
            description: "Makro, otomatik tıklama, hile yazılımı, FPS/grafik manipülasyonları veya dengeleri bozan her türlü yazılım yasaktır. \"Performans artışı\" bahanesi de bu yasağı delmez. Bu ihlaller doğrudan kalıcı uzaklaştırma nedenidir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.10",
        title: "Safezone ve Imperium Güvenlik Kuralları",
        description: "Güvenli bölge ve Imperium kuralları.",
        rules: [
          {
            id: "2.10.1",
            title: "Imperium Tanımı ve Yönetimi",
            description: "Imperium, mantık çerçevesinde varlığını koruyan ve güvenliği Defiance tarafından sağlanan bir alandır. Necron emirleri burada mutlaktır. (Necron: Defiance'a bağlı askeri birlik)",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.10.2",
            title: "Giriş ve Çıkış Denetimleri",
            description: "Imperium'a giriş-çıkışlar Necron birliklerince kontrol edilir. Ghost RP dahil herkesin üst araması, sağlık kontrolü ve enfeksiyon testi yapılır. Bu rollere tam olarak uymak zorunludur; uymayanlara IC ve OOC ceza uygulanır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.10.3",
            title: "Cezai Yaptırımlar",
            description: "İhlaller ağır niteliktedir. Uyarı, geçici uzaklaştırma veya kalıcı yasaklama uygulanabilir. Ayrıca IC sonuçlar (gözaltı, tutuklama, tecrit) doğabilir. Yönetim, ihlal sonucu bozulan rolleri iptal veya geçersiz sayabilir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.11",
        title: "Çatışma Kuralları (Combat Rules)",
        description: "Çatışma ve savaş kuralları.",
        rules: [
          {
            id: "2.11.1",
            title: "Çatışma Başlatma Şartı",
            description: "Kuvvetli bir IC gerekçe bulunmadan çatışma başlatılamaz. Sözlü gerilim, tehdit, takip gibi safhalarla doğal tırmandırma esastır. \"Anlık hiddet\" veya OOC motivasyon geçerli bir mazeret değildir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.2",
            title: "Tırmandırma (Escalation) İlkesi",
            description: "İkaz - Tehdit rolünden sonra taraflar arasında karşılıklı gerçekleşen rolün sonucu barışa çıkmıyor ise taraflar ölümcül güç silsilesini bilmelidir. Barışa çıkmayan her türlü durumda, tehdit açık bir beyan ise taraflar birbirine silahını çekip ölümcül güç uygulamakta serbesttir.\n\nDİKKAT: Taraflardan biri tartışmayı tehdit seviyesine getirmek istemiyorsa çatışma başlayamaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.3",
            title: "Teslim Olma ve Uyma Yükümlülüğü",
            description: "Silah doğrultulan, etrafı sarılan veya kaçış imkânı bulunmayan karakterler FearRP/NVL gereği makul davranır ve direktiflere uyar. Teslim olana orantısız güç tatbik edilemez. Necron veya yetkili birimler, operasyonel gerekçelerle bu kuralın istisnası olabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.4",
            title: "Çekilme ve Kovalamaca",
            description: "Açıkça geri çekilen/kaçan taraf olduğunda, diğer taraf gerçekçi imkânlarla takip edebilir. Ucu bucağı olmayan kovalamaca, spawn noktasında pusu veya intikam amaçlı sürekli takip yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.5",
            title: "Ateşli Silah Kullanımı",
            description: "Kör atış (blind fire), ikazsız tarama veya sivil bölgelerde rastgele ateş yasaktır. Silah kullanımı gerçekçi ve mantıklı olmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.6",
            title: "Sivil, Rehine ve Üçüncü Kişiler",
            description: "Sivil ve rehinelerin can güvenliği önceliklidir. Rehine rolleri sebepsiz başlatılamaz ve azami 1 saat sürer. İşkence veya uzun süreli işlevsiz bekletme yasaktır. Süre uzatımı için tarafların müşterek talebiyle ticket üzerinden yönetim onayı alınır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.7",
            title: "Yağma ve Eşya Alımı",
            description: "Çatışma devam ederken yaralı/ölü karakterlerden yağma (combat looting) yasaktır. Çatışma sona erdikten sonra eşya alımı rol dahilinde ve görünür biçimde yapılmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.8",
            title: "Tıbbi Müdahale ve Yaralı Taşıma",
            description: "Ağır yaralananlar, yaralanmayı rollemek mecburiyetindedir. Müdahaleler güvenli bölgede yapılmalı; çatışma ortasında \"ani iyileşme\"ye başvurulmamalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.9",
            title: "Dost Ateşi ve Grup Koordinasyonu",
            description: "Çatışma evvelinde gruplar kimliklendirme ve işaretleşme yapmalıdır. Dost ateşi, karambol atışlar veya \"önüne gelene sık\" emirleri kabul edilemez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.10",
            title: "Delil ve Raporlama",
            description: "Çatışma kaynaklı ihlal iddialarında kayıt veya ekran görüntüsü ibraz edilmelidir. Taraflar OOC tartışmaya girmeden ticket açar; hüküm yönetimindir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.11.11",
            title: "Yaptırımlar",
            description: "İhlaller, RDM/VDM, Powergaming ve FearRP/NVL hükümleriyle birlikte değerlendirilir. Uyarı, Geçici uzaklaştırma veya Kalıcı yasaklama uygulanabilir. Yönetim; bozulan rolleri iptal etme veya yeniden oynatma yetkisine haizdir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.12",
        title: "After the Paradise (AP)",
        description: "Ölüm sonrası hatırlama kuralları.",
        rules: [
          {
            id: "2.12.1",
            title: "Hayır, Hatırlamıyorsun",
            description: "Karakteriniz her ne koşulda olursa olsun scriptsel olarak öldükten sonra tedavi olana kadar hiçbir şekilde bilinci açılamaz. Karakteriniz scriptsel olarak ölüyken, karakterinizin etrafında dönen hiçbir olayı hatırlayamaz ve rolünüze yansıtamazsınız. Kuralın yok sayılması durumunda ağır yaptırımlar uygulanabilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.12.2",
            title: "Evet, Hatırlıyorsun",
            description: "Yalnız ve yalnız, sizi vuran bir oyuncu /do komutu üzerinden bilincinizin açık olması yönünde izin verirse bu kural yok sayılır. İzin verildiği andan itibaren, scriptsel olarak ölü bile olsanız karakteriniz gördüğü ve çevresinde dönen olayları hatırlayabilir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.13",
        title: "Lore ve Gerçekçilik",
        description: "Hikâye ve gerçekçilik kuralları.",
        rules: [
          {
            id: "2.13.1",
            title: "Lore Uyumu",
            description: "Karakterler; Kaze-Z'nin hikâye yapısı ve dönemine uygun düşmelidir. Karakter hikâyesi, zaman çizelgesi ve atmosferle çelişemez. Doğaüstü güçler, fantastik/ünlü temelli veya gerçek şahıs figürleri yasaktır. Bütün karakterler 18+ olmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.13.2",
            title: "Gerçekçilik İlkesi",
            description: "Karakterlerin mantıklı bir mazisi, şahsiyeti ve davranış kalıbı bulunmalıdır. Karakter \"herkesçe bilinen şöhretli biri\" değil; kendi çevresinde anlamlı bir şahsiyet olmalıdır. Fiziksel, psikolojik ve toplumsal hudutlar role yansıtılmalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.13.3",
            title: "Mizah ve Psikolojik Unsurlar",
            description: "Komedi/geyik veya tamamen \"şaka karakterleri\" kabul görmez. Her karakterin gayesi, geçmişi ve motivasyonu olmalıdır. Psikolojik rahatsızlık eklemek isteyenler, durumu ticket ile bildirip onay almalıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.13.4",
            title: "Karakter Gelişimi",
            description: "Gelişim mantık dairesinde ilerlemelidir. Hiç kimse \"korkusuz/yenilmez\" değildir; herkesin limitleri vardır. Bilgiler birikimli ilerler; tecrübeler üzerine koyarak gelişim sağlanır. Ani güçlenme, absürt dönüşümler ve evren dışı sıçramalar yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.13.5",
            title: "Hikâye ve Atmosferin Korunması",
            description: "Rollerin yalnızca ferdi değil; evrenin tamamını etkilediği hatırdan çıkarılmamalıdır. Sunucudaki tüm hikâyeler birleşerek evreni meydana getirir.\n\nKıyafet Kuralları: Apokaliptik gerçekçiliği korumak adına kıyafet tercihi atmosfere münasip olmalıdır. Necron olmayan bireylerin Necron kıyafetlerini kullanması yasaktır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.14",
        title: "Genel Karakter Kuralları",
        description: "Karakter sahipliği ve sayısı kuralları.",
        rules: [
          {
            id: "2.14.1",
            title: "Özgünlük ve Sahiplik",
            description: "Karakter özgün ve oyuncuya ait olmalıdır. Karakter değiştiğinde önceki karakterin kimliğine dair her şey \"unutulmalı\"; bilgi, ilişki veya çıkar yeni karaktere aktarılmamalıdır. OOC ticaret yasaktır; karakterlerle toplanan eşyalar/loot OOC para veya çıkar karşılığında satılamaz.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.14.2",
            title: "Karakter Sayısı",
            description: "Başlangıçta yalnızca 1 ana karakter oluşturulabilir. 2. karakter, yönetim izni ve onaylı başvuru sonucunda açılabilir. Rol ekibi için karakter sayısı limiti, yönetim kararındadır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.14.3",
            title: "Alt Karakter Kuralı",
            description: "Alt karakter, ana karakterle iletişim kuramaz; mal, bilgi, eşya, ittifak veya düşmanlık aktarılamaz. Alt karakter başvuruları yönetim onayına tabidir; yazılı karakter hikâyesi şarttır. Aktif rollerin çakışmaması gözetilmelidir.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.15",
        title: "Karakter Oluşturma ve Özellikleri",
        description: "Karakter oluşturma kuralları.",
        rules: [
          {
            id: "2.15.1",
            title: "Oluşturma İlkeleri",
            description: "• Özgünlük: Atmosfere uygun özgün karakter şarttır.\n• Kopya yasak: Dizi, film, oyun veya ünlü karakterlerin birebir kopyası yasaktır. Hafif esintiler, abartıya kaçılmadan kabul edilebilir.\n• Yaş: Tüm karakterler 18+ olmalıdır; çocuk rolleri yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.15.2",
            title: "Özellik ve Denge",
            description: "• İsim: Ünlü kişilerle birebir aynı veya çağrışımlı isimler kullanılamaz.\n• OP yasağı: Aşırı güçlü/yenilmez karakterlere izin verilmez.\n• Psikoloji: Psikolojik rahatsızlık konseptleri, ticket + yönetim onayıyla oynanabilir.\n• Mizah: Aşırı mizah/geyik, rol ciddiyetini bozduğunda FailRP/LowRP sayılır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.16",
        title: "Rol Kuralları",
        description: "Genel rol kuralları.",
        rules: [
          {
            id: "2.16.1",
            title: "Karakterde Kalma Zorunluluğu",
            description: "Sunucuya giriş ve karakter seçimiyle birlikte IC rol zorunludur. OOC tavırlar veya \"rol dışında takılma\" kabul edilmez.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.16.2",
            title: "Sürekli Roleplay İlkesi",
            description: "Kaze-Z, kesintisiz roleplay esasına göre işler. Oyunda geçirilen her an IC kabul edilir. \"Şu an rol yapmıyorum\" gibi beyanlar geçersizdir. OOC konuşmalar yalnızca /pm, /report veya ticket üzerinden gerçekleştirilebilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.16.3",
            title: "Rol Müdahalesi ve Geçerlilik",
            description: "Bir rolün iptali, tarafların ve gerektiğinde yetkililerin ortak kararıyla mümkündür. Hiçbir oyuncu tek taraflı \"rol iptal\" diyemez. Müdahaleler IC çerçevede ve karşılıklı rızayla yürütülmelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.16.4",
            title: "Gerçekçilik ve Rol Sınırları",
            description: "Her rol, evrenin gerçekçiliği ve karakter sınırları içinde yapılmalıdır. Karakterlerin korku, acı, yorgunluk ve sınırlara sahip olduğu unutulmamalıdır. \"Korkmaz/etkilenmez\" yaklaşımı FearRP ihlalidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.16.5",
            title: "Ghost RP ve Yönetim Yönlendirmeleri",
            description: "Etkinlikler, teknik aksaklıklar veya yönetim yönlendirmeleri kapsamında Ghost RP uygulanabilir. Tüm oyuncular bu talimatlara uymak zorundadır. Uymamak veya süreci baltalamak ağır ihlaldir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.16.6",
            title: "Rolün Sürekliliği ve Sonuçları",
            description: "Rol başlar başlamaz bağlayıcıdır. Oyuncu, rolü keyfine göre yarıda bırakamaz veya neticelerinden kaçınamaz. Rol esnasında alınan kararlar, karakter gelişimini ve evrenin bütünlüğünü etkiler.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.16.7",
            title: "Yaptırımlar",
            description: "• Hafif ihlaller: Uyarı veya geçici susturma\n• Tekrarlanan/ciddi ihlaller: Geçici uzaklaştırma\n• FailRP, LowRP, GhostRP'ye uymama gibi ağır ihlaller: Kalıcı yasaklama",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.17",
        title: "Enfeksiyon, Yaralanma ve Medikal RP",
        description: "Sağlık ve medikal rol kuralları.",
        rules: [
          {
            id: "2.17.1",
            title: "Enfeksiyon ve Isırılma",
            description: "Zombi teması gereği ısırılma/kan teması ciddi enfeksiyon riskidir. Isırılan karakter semptomları ciddiyetle rollemelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.17.2",
            title: "Yaralanma ve Bayılma RP",
            description: "Ağır darbe/kurşun/ısırık sonrası; ağrı, kan kaybı, baş dönmesi, refleks kaybı gibi etkiler role yansıtılmalıdır. \"Anında iyileşme\" beklenemez; ilk yardım - stabilizasyon - taşıma - tedavi silsilesi izlenmelidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.17.3",
            title: "Ölüm ve Ekipman",
            description: "Ölüm sonrası NLR uygulanır (bkz. 2.12). Combat looting yasağı (bkz. 2.11.7) geçerlidir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.17.4",
            title: "Hastane ve Sağlık Rolleri",
            description: "Hastane, emniyetli sahalardan biridir. Hastane içerisinde hekime/sağlık personeline karşı illegal rol yapılamaz. Hekimler, IC tavır ve davranışlara istinaden hasta kabulünü reddedebilir.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.17.5",
            title: "Medikal Rolün Gerçekçiliği",
            description: "Yaralanma, enfeksiyon ve hastalıklar gerçekçi bir surette role aksettirilmelidir:\n• Kurşun yarası şipşak iyileşmez. Tedavi sonrası çatışmaya dönmek yasaktır. (30 Dakika bekleme)\n• Kan kaybı, acı, refleks yitimi, halsizlik gibi semptomlar mantıklı bir şekilde oynanmalıdır.\n\nAğır hastalık rolleri için Necron yönetimiyle (ticket) irtibata geçilip onay alınmalıdır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.18",
        title: "Güvenli Bölge Kuralları ve Yağma/Raid",
        description: "Base ve raid kuralları.",
        rules: [
          {
            id: "2.18.1",
            title: "Base Kuralları",
            description: "Bütün barınaklar; gerçekçi ebat, savunma/erişim mantığı ve harita akışına uygunluk arz etmelidir. Defiance civarında (yönetimin ilan ettiği hudutlar/metreler) kalıcı barınak tesis etmek yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.18.2",
            title: "Raid Şartları",
            description: "Raid, münhasıran kuvvetli bir IC gerekçe, ön hazırlık ve görünür rol ile gerçekleştirilebilir. Zaman aralıkları, ekipman zaruretleri ve bildirim usulleri yönetimce duyurulur ve bağlayıcıdır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.18.3",
            title: "Grief Yasağı",
            description: "Rol dışı gayeyle tamamen imha etme, kasıtlı spawn kampı veya sürekli taciz yasaklanmıştır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.18.4",
            title: "Karşı Rol ve Sonuç",
            description: "Müdafaa eden taraf, FearRP/NVL ve gerçekçilik çerçevesinde rol sergilemelidir. Kayıp ve hasarlar IC neticelere yansıtılmalıdır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.19",
        title: "Ekonomi, Ticaret ve Takas",
        description: "Oyun içi ekonomi kuralları.",
        rules: [
          {
            id: "2.19.1",
            title: "IC Ekonomi Esası",
            description: "Mal/hizmet akışı IC ticaret ve takas ile döner; OOC ticaret kesinlikle yasaktır (bkz. 2.14.1).",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.19.2",
            title: "Adil Ticaret ve Dolandırıcılık",
            description: "Tamamen haksız kazanç maksadıyla, mesnetsiz şekilde sürekli zarar ettirme scamming addedilir (bkz. 2.9.1). Fiyat/ürün mantığı kıtlık ve risk ile uyumlu olmalıdır. Bariz manipülasyon/tekel OOC amaçlıysa yaptırım uygulanır.",
            lastUpdate: "31.12.2024"
          }
        ]
      },
      {
        id: "2.20",
        title: "Araç ve Teknoloji",
        description: "Araç, iletişim ve yazılım kuralları.",
        rules: [
          {
            id: "2.20.1",
            title: "İletişim ve Radyo",
            description: "Frekans/paylaşım IC güvenlik gerektirir; metagaming ile öğrenilen frekansların kullanımı yasaktır. Şifreleme ve anonslar IC karşılığıyla yapılır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.20.2",
            title: "Üçüncü Parti Uygulamalar",
            description: "Adil ve gerçekçi rol deneyimi adına, haksız avantaj sağlayan tüm üçüncü parti yazılımlar yasaktır.\n\nGenel Yasaklar:\n• Hile yazılımı, script abuse, bug exploit\n• Makro programları, donanım destekli otomasyon\n• Avantaj sağlayan grafik paketleri (FPS boost, PvP paketleri, all day-night mod vb.)\n• \"Mods\" klasörüne dosya ekleyerek üstünlük (no recoil, aimbot, hitbox değişimi vb.)",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.20.3",
            title: "İzin Verilenler",
            description: "Görsellik maksatlı bazı grafik paketleri (QuantV, NVE vb.), sadece Kaze-Z yönetimi onaylarsa kullanılabilir. Onaylanmamış ve PvP avantajı sağlayan paketler yasaktır.",
            lastUpdate: "31.12.2024"
          },
          {
            id: "2.20.4",
            title: "KazeGuard ve Yaptırımlar",
            description: "KazeGuard ile tespit edilen yasaklı yazılım kullanımlarında ceza kesindir, itiraz edilemez ve kaldırılmaz. Karakterler, envanter ve kazanımlar kalıcı olarak silinebilir. Doğrudan kalıcı uzaklaştırma uygulanacaktır.",
            lastUpdate: "31.12.2024"
          }
        ]
      }
    ]
  }
];

export default kazeRulesData;
