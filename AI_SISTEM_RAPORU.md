# FiveM Başvuru Değerlendirme AI Sistemi
## Detaylı Sistem Raporu

---

## 📋 Genel Bakış

| Özellik | Değer |
|---------|-------|
| **Amaç** | FiveM sunucusu başvuru formlarının AI ile değerlendirilmesi |
| **Günlük Kapasite** | 10-15 form |
| **Aylık Kapasite** | 450+ form |
| **Form Başına Soru** | 30 soru |
| **Form Başına Karakter** | ~45.000-60.000 |
| **İşleme Modu** | Batch (toplu işleme) |
| **Aylık Bütçe** | $50 |
| **Tahmini Maliyet** | ~$29/ay |

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                         FORM GİRİŞİ                             │
│                    (Başvuru formu geldi)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AŞAMA 1                                  │
│                    DeepSeek R1 (Batch)                          │
│                                                                 │
│                  DETAYLI SORU ANALİZİ                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AŞAMA 2                                  │
│                  Claude Sonnet 4.5 (Batch)                      │
│                                                                 │
│               BÜTÜNSEL DEĞERLENDİRME & KARAR                    │
│                       (KİLİT ROL)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── KABUL (%40-50)
                              │
                              ├─── RED (%25-35)
                              │
                              └─── KARARSIZ (%15-20)
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │            AŞAMA 3                  │
                    │     Claude Opus 4.5 (Batch)         │
                    │                                     │
                    │        HAKEM DEĞERLENDİRME          │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                                  FİNAL KARAR
```

---

## 🤖 Model 1: DeepSeek R1

### Genel Bilgiler

| Özellik | Değer |
|---------|-------|
| **Sağlayıcı** | DeepSeek |
| **Model Adı** | DeepSeek R1 |
| **İşleme Modu** | Batch API |
| **Context Window** | 128K token |
| **Batch Input Fiyat** | $0.28/1M token |
| **Batch Output Fiyat** | $0.84/1M token |

### Sistemdeki Rolü

**Ön Analiz Uzmanı** - Tüm soruları tek tek analiz eden detay işçisi.

### Görev Tanımları

1. **Kişisel Bilgi Kontrolü**
   - İsim, yaş, email, Discord bilgilerinin mantıklılığını değerlendir
   - Yaş uygunluğunu kontrol et
   - Spam/troll başvuru tespiti yap

2. **Kural Soruları Analizi**
   - Her kural sorusunu ayrı ayrı oku ve analiz et
   - Cevabın doğruluğunu değerlendir (Tam Doğru / Kısmi / Yanlış)
   - Oyuncunun kuralı anlayıp anlamadığını tespit et
   - META, Fear RP, NLR, Combat Log gibi kavramları bilip bilmediğini değerlendir

3. **Rol Soruları Analizi**
   - Her senaryo cevabını detaylı analiz et
   - Oyuncunun karakter perspektifinden düşünüp düşünemediğini değerlendir
   - Fear RP uyumu, karakter tutarlılığı, yaratıcılık değerlendir
   - Kırmızı bayrakları tespit et (agresif ton, kural çiğneme eğilimi, vb.)

4. **Puan Verme**
   - Her soru için 1-10 arası puan ver
   - Her soru için kısa yorum yaz
   - Pozitif ve negatif göstergeleri listele

### Çıktı Formatı

```json
{
  "soru_no": 1,
  "kategori": "KURAL",
  "puan": 8,
  "dogru_mu": "EVET",
  "yorum": "Fear RP kavramını doğru anlamış",
  "pozitifler": ["Kuralın mantığını açıklamış"],
  "kirmizi_bayraklar": [],
  "oyuncu_ipucu": "Kuralları özümsemiş görünüyor"
}
```

### Aylık Maliyet

| Token Türü | Miktar | Birim Fiyat | Maliyet |
|------------|--------|-------------|---------|
| Input | 6.75M | $0.28/1M | $1.89 |
| Output | 4.5M | $0.84/1M | $3.78 |
| **Toplam** | | | **~$6/ay** |

---

## 🤖 Model 2: Claude Sonnet 4.5 (KİLİT ROL)

### Genel Bilgiler

| Özellik | Değer |
|---------|-------|
| **Sağlayıcı** | Anthropic |
| **Model Adı** | Claude Sonnet 4.5 |
| **İşleme Modu** | Message Batches API |
| **Context Window** | 200K token |
| **Batch Input Fiyat** | $1.50/1M token (%50 indirim) |
| **Batch Output Fiyat** | $7.50/1M token (%50 indirim) |

### Sistemdeki Rolü

**Ana Karar Verici** - Tüm analizleri sentezleyen ve final kararı veren kilit model.

### Göreceği Veriler

Claude Sonnet 4.5 şu verileri alır:

1. **Orijinal Sorular** - Formda sorulan tüm soruların metni
2. **Oyuncu Cevapları** - Oyuncunun verdiği tüm cevaplar
3. **DeepSeek Analizleri** - Her soru için DeepSeek'in değerlendirmesi

### Görev Tanımları

1. **Veri Sentezi**
   - DeepSeek'in 30 soru analizini al
   - Orijinal soru ve cevapları gözden geçir
   - DeepSeek'in kaçırmış olabileceği nüansları yakala

2. **Oyuncu Profili Çıkarma**
   - Oyuncu tipi belirle (Serious RPer, Casual, PowerGamer, vb.)
   - Dominant oyun stili tespit et (Pasif, Agresif, Dengeli)
   - RP olgunluk seviyesi değerlendir (Başlangıç / Orta / İleri / Uzman)
   - Güçlü ve zayıf yönleri listele

3. **Mentalite Analizi**
   - Oyuncunun genel mentalitesini değerlendir
   - Sunucu topluluğuna uyum potansiyelini ölç
   - Drama/sorun çıkarma riskini değerlendir
   - Uzun vadeli oyuncu olma ihtimalini tahmin et

4. **Sunucu Uyumu Değerlendirmesi**
   - Oyuncunun sunucu kültürüne uyup uymayacağını değerlendir
   - Sunucu kurallarına uyum potansiyelini ölç
   - Topluluk katkısı potansiyelini değerlendir

5. **Final Karar Verme**
   - KABUL: Oyuncu uygun, doğrudan alınabilir
   - RED: Oyuncu uygun değil, reddedilmeli
   - MÜLAKAT: Kararsız, ikinci görüş gerekli
   - Güven skoru (%0-100) ver

6. **Gerekçe Yazma**
   - Kararın detaylı gerekçesini yaz
   - Neden kabul/red/mülakat kararı verildiğini açıkla
   - İyileştirme önerileri sun (varsa)

### Çıktı Formatı

```json
{
  "basvuru_id": "12345",
  
  "oyuncu_profili": {
    "tip": "Serious RPer - Gelişmiş",
    "oyun_stili": "Pasif/İşbirlikçi",
    "rp_seviyesi": "İleri",
    "guclu_yonler": ["Fear RP anlayışı", "Karakter derinliği"],
    "zayif_yonler": ["Combat RP tecrübesi az"]
  },
  
  "mentalite_analizi": {
    "genel_mentalite": "İşbirlikçi ve olgun",
    "drama_riski": "Düşük",
    "uzun_vadeli_potansiyel": "Yüksek"
  },
  
  "sunucu_uyumu": {
    "skor": 85,
    "yorum": "Sunucu kültürüne yüksek uyum potansiyeli"
  },
  
  "karar": "KABUL",
  "guven_skoru": 88,
  
  "gerekce": "Bu oyuncu serious RP anlayışına sahip...",
  "oneriler": "İlk hafta civilian RP ile başlaması önerilir"
}
```

### Aylık Maliyet

| Token Türü | Miktar | Birim Fiyat | Maliyet |
|------------|--------|-------------|---------|
| Input | 4M | $1.50/1M | $6.00 |
| Output | 1.5M | $7.50/1M | $11.25 |
| **Toplam** | | | **~$17/ay** |

---

## 🤖 Model 3: Claude Opus 4.5 (Hakem)

### Genel Bilgiler

| Özellik | Değer |
|---------|-------|
| **Sağlayıcı** | Anthropic |
| **Model Adı** | Claude Opus 4.5 |
| **İşleme Modu** | Message Batches API |
| **Context Window** | 200K token |
| **Batch Input Fiyat** | $2.50/1M token (%50 indirim) |
| **Batch Output Fiyat** | $12.50/1M token (%50 indirim) |

### Sistemdeki Rolü

**Üst Düzey Hakem** - Claude Sonnet 4.5'in kararsız kaldığı vakalar için daha güçlü ikinci görüş sağlayan model.

### Neden Opus 4.5?

Claude Sonnet 4.5 zaten çoğu modelden daha güçlü. Hakem olarak daha zayıf bir model kullanmak mantıklı değil. Opus 4.5, Sonnet'ten daha güçlü olduğu için:
- Sonnet'in gözden kaçırdığı nüansları yakalayabilir
- Daha derin analiz yapabilir
- Kararsız vakalarda kesin karar verebilir

### Ne Zaman Devreye Girer?

Opus 4.5 sadece şu durumlarda çağrılır:
- Claude Sonnet'in kararı "MÜLAKAT" ise
- Claude Sonnet'in güven skoru %30-80 arasındaysa
- DeepSeek ve Claude Sonnet arasında ciddi tutarsızlık varsa

### Görev Tanımları

1. **Üst Düzey İnceleme**
   - Sonnet'in kararsız kaldığı vakaları derinlemesine incele
   - Daha kapsamlı perspektiften değerlendir
   - Kesin ve bağımsız bir karar ver

2. **Nüans Tespiti**
   - Sonnet'in gözden kaçırmış olabileceği detayları bul
   - Oyuncu cevaplarındaki ince ipuçlarını tespit et
   - Karmaşık vakalarda derinlemesine analiz yap

3. **Final Karar Verme**
   - Kesin final karar ver
   - Detaylı gerekçe sağla
   - Risk değerlendirmesi ve öneriler sun

### Çıktı Formatı

```json
{
  "basvuru_id": "12345",
  "opus_karari": "KABUL",
  "guven_skoru": 85,
  "sonnet_ile_farki": "Sonnet göremedi ama cevaplardaki tutarlılık güçlü",
  "gerekce": "Detaylı inceleme sonucu oyuncunun...",
  "risk_degerlendirmesi": "Düşük",
  "oneri": "Kabul edilmeli, potansiyeli yüksek"
}
```

### Aylık Maliyet

| Token Türü | Miktar | Birim Fiyat | Maliyet |
|------------|--------|-------------|---------|
| Input | 0.6M | $2.50/1M | $1.50 |
| Output | 0.35M | $12.50/1M | $4.38 |
| **Toplam** | | | **~$6/ay** |

---

## 💰 Toplam Maliyet Özeti

| Model | Görev | Aylık Maliyet |
|-------|-------|---------------|
| DeepSeek R1 | Detaylı soru analizi | ~$6 |
| Claude Sonnet 4.5 | Bütünsel değerlendirme (KİLİT) | ~$17 |
| Claude Opus 4.5 | Hakem (kararsız vakalar) | ~$6 |
| **TOPLAM** | | **~$29/ay** |

| Bütçe Durumu | Değer |
|--------------|-------|
| Aylık Bütçe | $50 |
| Tahmini Harcama | ~$29 |
| Kalan | ~$21 (%42) |

---

## 🔄 Karar Akışı Detayı

```
FORM GELDİ
    │
    ▼
DeepSeek R1 Analizi
    │
    ├── Her soru için puan (1-10)
    ├── Her soru için yorum
    ├── Kırmızı bayraklar
    └── Pozitif göstergeler
    │
    ▼
Claude Sonnet 4.5 Değerlendirmesi
    │
    ├── Orijinal sorular + cevaplar
    ├── DeepSeek analizleri
    │
    └── Çıktı:
        ├── Oyuncu profili
        ├── Mentalite analizi
        ├── Sunucu uyumu skoru
        ├── KARAR + Güven %
        │
        ├─── Güven >= %80 ───► ✅ KABUL (OTOMATİK)
        │
        ├─── Güven <= %30 ───► ❌ RED (OTOMATİK)
        │
        └─── Güven %30-80 ──► ⚠️ Opus 4.5'e GİT
                                    │
                                    ▼
                          Claude Opus 4.5 Hakem Kararı
                                    │
                                    ├──► ✅ KABUL
                                    ├──► ❌ RED
                                    └──► ⚠️ MÜLAKAT ÖNERİSİ
```

---

## ⏰ İşleme Zamanlaması

### Önerilen Batch Zamanlaması

| Saat | İşlem |
|------|-------|
| 03:00 | Günlük formları topla |
| 03:05 | DeepSeek R1 batch işlemi başlat |
| 03:35 | DeepSeek tamamlandı (~30 dk) |
| 03:40 | Claude Sonnet 4.5 batch işlemi başlat |
| 04:30 | Claude tamamlandı (~50 dk) |
| 04:35 | Kararsız vakalar için Opus 4.5 batch başlat |
| 04:50 | Opus 4.5 tamamlandı (~15 dk) |
| 05:00 | Sonuçlar hazır |

**Toplam İşlem Süresi:** ~2 saat (gece otomatik)

---

## 📊 Beklenen Performans Metrikleri

| Metrik | Tahmini Değer |
|--------|---------------|
| Otomatik Kabul Oranı | %40-50 |
| Otomatik Red Oranı | %25-35 |
| Hakem Gerektiren | %15-20 |
| Günlük İşlem Kapasitesi | 50+ form |
| Aylık İşlem Kapasitesi | 1500+ form |

---

## 🔧 Teknik Gereksinimler

### API Erişimleri

1. **DeepSeek API**
   - Hesap: api.deepseek.com
   - Batch API erişimi gerekli

2. **Anthropic API**
   - Hesap: console.anthropic.com
   - Message Batches API erişimi gerekli

3. **Anthropic API (Opus)**
   - Hesap: console.anthropic.com (aynı hesap)
   - Message Batches API erişimi gerekli

### Veri Akışı

```
Form Database → JSON Export → Batch API → Sonuç JSON → Sonuç Database
                                                    → Discord Webhook
                                                    → Admin Panel
```

---

## 📝 Notlar

1. **Prompt Caching**: Claude ve DeepSeek'te prompt caching kullanılarak maliyetler daha da düşürülebilir (%90 input indirimi)

2. **Ölçeklendirme**: Sistem yoğun dönemlerde (2-3x form) bile bütçe içinde kalabilir

3. **Manuel Kontrol**: Ayda 10-20 random başvurunun manuel kontrolü önerilir

4. **Sunucu Kuralları**: Claude'a sunucu kuralları ve kültürü dökümanı verilmeli

---

*Rapor Tarihi: 27 Aralık 2024*
*Versiyon: 2.0* (GPT-4o → Claude Opus 4.5 güncellemesi)
