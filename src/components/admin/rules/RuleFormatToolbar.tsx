import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Quote,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  List,
  ChevronDown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RuleFormatToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
}

interface FormatButton {
  icon: React.ReactNode;
  label: string;
  format: string;
  tooltip: string;
}

const formatButtons: FormatButton[] = [
  {
    icon: <Bold className="w-4 h-4" />,
    label: 'Kalın',
    format: '**metin**',
    tooltip: 'Kalın yazı (**metin**)',
  },
  {
    icon: <Quote className="w-4 h-4" />,
    label: 'Alıntı',
    format: "''alıntı metni''",
    tooltip: "Alıntı kutusu (''metin'')",
  },
  {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Not',
    format: 'Not: önemli bilgi',
    tooltip: 'Sarı not kutusu (Not: metin)',
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    label: 'Örnek',
    format: 'Örnek: örnek açıklama',
    tooltip: 'Mavi örnek kutusu',
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Doğru',
    format: 'Doğru Örnek:\n· ilk madde\n· ikinci madde',
    tooltip: 'Yeşil doğru örnek kutusu',
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Yasak',
    format: 'Yasak Örnek:\n· yasak durum 1\n· yasak durum 2',
    tooltip: 'Kırmızı yasak örnek kutusu',
  },
  {
    icon: <List className="w-4 h-4" />,
    label: 'Liste',
    format: '· madde',
    tooltip: 'Madde işareti (· metin)',
  },
  {
    icon: <ChevronDown className="w-4 h-4" />,
    label: 'Detay',
    format: '[Başlık] Açılır içerik buraya gelecek',
    tooltip: 'Açılır/kapanır detay bölümü',
  },
];

export const RuleFormatToolbar: React.FC<RuleFormatToolbarProps> = ({
  textareaRef,
  value,
  onChange,
}) => {
  const insertFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText: string;
    let newCursorPos: number;

    // Eğer metin seçiliyse, formatı seçili metinle değiştir
    if (selectedText) {
      // Kalın format için özel işlem
      if (format === '**metin**') {
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        newCursorPos = end + 4;
      } else if (format === "''alıntı metni''") {
        newText = value.substring(0, start) + `''${selectedText}''` + value.substring(end);
        newCursorPos = end + 4;
      } else {
        // Diğer formatlar için satır başına ekle
        newText = value.substring(0, start) + format + value.substring(end);
        newCursorPos = start + format.length;
      }
    } else {
      // Seçim yoksa, cursor pozisyonuna format ekle
      const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
      newText = value.substring(0, start) + prefix + format + value.substring(end);
      newCursorPos = start + prefix.length + format.length;
    }

    onChange(newText);

    // Cursor'u yeni pozisyona getir
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border border-border rounded-t-lg border-b-0">
        {formatButtons.map((btn, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs gap-1.5"
                onClick={() => insertFormat(btn.format)}
              >
                {btn.icon}
                <span className="hidden sm:inline">{btn.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {btn.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default RuleFormatToolbar;
