-- Terimler Sözlüğü tablosu oluştur
CREATE TABLE public.glossary_terms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term text NOT NULL,
  full_name text,
  definition text NOT NULL,
  category text NOT NULL DEFAULT 'genel',
  examples jsonb DEFAULT '[]'::jsonb,
  is_critical boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS'i etkinleştir
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Anyone can view glossary terms"
ON public.glossary_terms
FOR SELECT
USING (true);

-- Sadece adminler yazabilir
CREATE POLICY "Admins can manage glossary terms"
ON public.glossary_terms
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger'ı
CREATE TRIGGER update_glossary_terms_updated_at
BEFORE UPDATE ON public.glossary_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Varsayılan terimler ekle
INSERT INTO public.glossary_terms (term, full_name, definition, category, is_critical, order_index) VALUES
-- Rol Dışı İhlaller
('Non-RP', 'Non-Roleplay', 'Roleplay evrenine hiç uymayan, tamamen dışında kalan davranışlar. Oyuncu direkt olarak oyun kurallarını veya roleplay ortamını ihlal eder.', 'rol_disi', true, 1),
('NRD', 'Non-RP Driving', 'Gerçek hayatta asla yapılamayacak sürüş manevralarıyla gerçekçi olmayan davranışlar.', 'rol_disi', true, 2),
('Ghost RP', 'Ghost Roleplay', 'Fiziksel varlık veya sonuç oluşturmadan yapılan etkileşimler (duvara ses vermeden vurmak gibi).', 'rol_disi', false, 3),
('Trash Talk', 'Trash Talk', 'OOC kışkırtma veya hakaret. Karakter maskesi altında kişisel hakaret veya OOC aşağılama.', 'rol_disi', true, 4),

-- Saldırı ve Çatışma
('RDM', 'Random Deathmatch', 'Senaryo veya geçerli IC neden olmaksızın birine ateş açmak veya öldürmek.', 'saldiri', true, 5),
('VDM', 'Vehicle Deathmatch', 'Araçla kasıtlı olarak oyuncuya çarpmak, ezmek veya hasar vermek.', 'saldiri', true, 6),
('RK', 'Revenge Kill', 'Öldükten sonra aynı karakterle veya aynı motivasyonla intikam almaya çalışmak.', 'saldiri', true, 7),
('Revenge RP', 'Revenge Roleplay', 'Ölüm sonrası aynı veya benzer senaryoya geri dönerek intikam almak.', 'saldiri', true, 8),
('Ambush RP', 'Ambush Roleplay', 'Karşı tarafa hiçbir etkileşim şansı vermeden pusu kurmak.', 'saldiri', false, 9),

-- Oyun Açığı
('Bug Abuse', 'Bug Abuse', 'Oyun içindeki açıkları/hataları bilinçli şekilde kullanmak.', 'acik', true, 10),
('Combat Log', 'Combat Logging', 'Çatışma veya aktif bir senaryo esnasında oyundan çıkmak.', 'acik', true, 11),
('ZEB', 'Zorunlu Etki Bildirimi', 'Belirli durumlarda yaralanma durumunu açıkça bildirme zorunluluğu.', 'acik', false, 12),
('MG', 'Metagaming', 'OOC (Out of Character) yollarla elde edilen bilgiyi IC (In Character) olarak kullanmak.', 'acik', true, 13),
('Mask On', 'Mask On', 'Maske takılıyken tanınmazlık kuralı. Karakter yüzü görünmüyorsa ses tanıması için güçlü IC gerekçe gerekir.', 'acik', false, 14),

-- Karakter ve Oynanış
('FearRP', 'Fear Roleplay / NVL', 'Hayatını tehdit eden durumda mantıksızca cesur davranmak.', 'karakter', true, 15),
('NVL', 'Not Valuing Life', 'Hayatını önemsemeden hareket etmek.', 'karakter', true, 16),
('AP', 'After Paradise', 'Ölüm sonrası hastanede uyanınca son 15 dakikanın hatırlanamaması durumu.', 'karakter', false, 17),
('Non-RP Karakter', 'Non-RP Character', 'Gerçekçi olmayan, karikatürize veya RP evrenine uymayan karakter tasarımı.', 'karakter', true, 18),
('PBR', 'Progress Bar Rule', 'İlerleme çubuğu görevleri için RP sınırlamaları.', 'karakter', false, 19),
('Capture', 'Capture Rule', 'Oyuncu yakalama, esir alma kuralları.', 'karakter', false, 20),
('DOE', 'Declaration of Emergency', 'Acil durum ilanı; devletin tüm vatandaşları kapsayan kısıtlama uygulaması.', 'karakter', false, 21),

-- İletişim
('Mixing', 'Mixing', 'IC ve OOC bilgilerin veya iletişimin karışması.', 'iletisim', true, 22),
('Refuse RP', 'Refuse Roleplay', 'RP''yi reddetmek veya etkileşimden kaçınmak.', 'iletisim', true, 23),
('Smilies IC', 'Smilies In-Character', 'IC konuşmalarda emoji veya sembol kullanımı.', 'iletisim', false, 24),
('Car Surfing', 'Car Surfing', 'Hareket halindeki araca yaslanmak veya üzerine binmek.', 'iletisim', false, 25);