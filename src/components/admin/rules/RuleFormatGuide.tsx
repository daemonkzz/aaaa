import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Bold, Quote, AlertCircle, Lightbulb, CheckCircle, XCircle, List, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormatExample {
  icon: React.ReactNode;
  title: string;
  syntax: string;
  description: string;
}

const formatExamples: FormatExample[] = [
  {
    icon: <Bold className="w-4 h-4" />,
    title: 'Kalın Yazı',
    syntax: '**kalın metin**',
    description: 'Metni kalın yapar',
  },
  {
    icon: <Quote className="w-4 h-4" />,
    title: 'Alıntı Kutusu',
    syntax: "''alıntı metni''",
    description: 'Mavi kenarlı alıntı kutusu oluşturur',
  },
  {
    icon: <AlertCircle className="w-4 h-4" />,
    title: 'Not / Uyarı',
    syntax: 'Not: önemli bilgi\nUyarı: dikkat edilmesi gereken\nDikkat: kritik bilgi',
    description: 'Sarı uyarı kutusu oluşturur',
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    title: 'Örnek',
    syntax: 'Örnek: açıklama metni\nÖrnekler: birden fazla örnek',
    description: 'Mavi örnek kutusu oluşturur',
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    title: 'Doğru Örnek',
    syntax: 'Doğru Örnek:\n· ilk doğru davranış\n· ikinci doğru davranış',
    description: 'Yeşil doğru örnek kutusu oluşturur',
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    title: 'Yasak Örnek',
    syntax: 'Yasak Örnek:\n· yasak davranış 1\n· yasak davranış 2',
    description: 'Kırmızı yasak örnek kutusu oluşturur',
  },
  {
    icon: <List className="w-4 h-4" />,
    title: 'Madde Listesi',
    syntax: '· birinci madde\n· ikinci madde\n· üçüncü madde',
    description: 'Madde işaretli liste oluşturur (· veya - veya • kullanılabilir)',
  },
  {
    icon: <ChevronDown className="w-4 h-4" />,
    title: 'Açılır Detay',
    syntax: '[Detay Başlığı] Bu içerik açılır/kapanır şekilde gösterilir',
    description: 'Tıklanınca açılan/kapanan bölüm oluşturur',
  },
];

interface RuleFormatGuideProps {
  trigger?: React.ReactNode;
}

export const RuleFormatGuide: React.FC<RuleFormatGuideProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <HelpCircle className="w-4 h-4 mr-2" />
            Format Rehberi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kural İçerik Formatları</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            <p className="text-sm text-muted-foreground">
              Kural açıklamalarında aşağıdaki formatları kullanarak zengin içerik oluşturabilirsiniz.
              Bu formatlar sitede otomatik olarak stillendirilecektir.
            </p>
            
            {formatExamples.map((example, index) => (
              <div
                key={index}
                className="p-4 bg-muted/30 border border-border rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {example.icon}
                  </div>
                  <h4 className="font-semibold">{example.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{example.description}</p>
                <div className="bg-background p-3 rounded-md border border-border">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80">
                    {example.syntax}
                  </pre>
                </div>
              </div>
            ))}

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Kombine Kullanım</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Formatları bir arada kullanabilirsiniz:
              </p>
              <div className="bg-background p-3 rounded-md border border-border">
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80">
{`Bu kural **önemli** bir konuyu ele alır.

''Güvenlik herkesin sorumluluğundadır.''

Not: Bu kural 01.01.2025 tarihinde güncellenmiştir.

Doğru Örnek:
· Önce uyarı verilir
· Sonra gerekirse müdahale edilir

Yasak Örnek:
· Sebepsiz saldırı
· Uyarısız müdahale

[Ek Bilgi] Detaylı açıklama burada yer alır.`}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RuleFormatGuide;
