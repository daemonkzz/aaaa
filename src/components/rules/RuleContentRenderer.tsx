import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Info, Quote, Lightbulb, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RuleContentRendererProps {
  content: string;
  searchQuery?: string;
}

type ExampleVariant = 'default' | 'correct' | 'forbidden';

// Örnek kalıplarını kontrol eden regex listesi
const examplePatterns: Array<{ regex: RegExp; variant: ExampleVariant; title: string }> = [
  { regex: /^(Örnek|ÖRNEK)\s*:\s*(.*)$/i, variant: 'default', title: 'Örnek' },
  { regex: /^(Örnekler|ÖRNEKLER)\s*:\s*(.*)$/i, variant: 'default', title: 'Örnekler' },
  { regex: /^Doğru\s+Kullanım\s*:\s*(.*)$/i, variant: 'correct', title: 'Doğru Kullanım' },
  { regex: /^Doğru\s+[Öö]rnek\s*:\s*(.*)$/i, variant: 'correct', title: 'Doğru Örnek' },
  { regex: /^Doğru\s+[Öö]rnekler\s*:\s*(.*)$/i, variant: 'correct', title: 'Doğru Örnekler' },
  { regex: /^Yasak\s+[Öö]rnekler?\s*:\s*(.*)$/i, variant: 'forbidden', title: 'Yasak Örnekler' },
  { regex: /^Açık\s+[Öö]rnekler?\s*\(?[Yy]asak\)?\s*:\s*(.*)$/i, variant: 'forbidden', title: 'Açık Örnekler (Yasak)' },
  { regex: /^[Yy]anlış\s+[Öö]rnek\s*:\s*(.*)$/i, variant: 'forbidden', title: 'Yanlış Örnek' },
  { regex: /^[Yy]anlış\s+[Öö]rnekler\s*:\s*(.*)$/i, variant: 'forbidden', title: 'Yanlış Örnekler' },
];

// Madde işareti kontrolü
const isBulletLine = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith('·') || trimmed.startsWith('-') || trimmed.startsWith('•');
};

// Madde metnini çıkar
const extractBulletText = (line: string): string => {
  const trimmed = line.trim();
  if (trimmed.startsWith('·') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
    return trimmed.slice(1).trim();
  }
  return trimmed;
};

// Parse and render rule content with special formatting
export const RuleContentRenderer: React.FC<RuleContentRendererProps> = ({
  content,
  searchQuery,
}) => {
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());

  const toggleDetail = (index: number) => {
    setExpandedDetails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Split content into lines for processing
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let detailIndex = 0;
  let lineIndex = 0;

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 my-3 ml-1">
          {currentListItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
              <span className="text-foreground/80 text-sm leading-relaxed">
                {renderInlineFormatting(item, searchQuery)}
              </span>
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      lineIndex++;
      continue;
    }

    // Örnek kalıplarını kontrol et
    let exampleMatch: { match: RegExpMatchArray; variant: ExampleVariant; title: string } | null = null;
    
    for (const pattern of examplePatterns) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        exampleMatch = { match, variant: pattern.variant, title: pattern.title };
        break;
      }
    }

    if (exampleMatch) {
      flushList();
      
      // Başlıktan sonraki metni al
      const textAfter = exampleMatch.match[exampleMatch.match.length - 1]?.trim() || '';
      const exampleItems: string[] = [];
      
      // Sonraki satırlarda madde var mı kontrol et
      let nextIndex = lineIndex + 1;
      while (nextIndex < lines.length) {
        const nextLine = lines[nextIndex];
        const nextTrimmed = nextLine.trim();
        
        if (isBulletLine(nextTrimmed)) {
          exampleItems.push(extractBulletText(nextTrimmed));
          nextIndex++;
        } else if (nextTrimmed === '') {
          // Boş satırda dur
          break;
        } else {
          // Farklı içerik, döngüden çık
          break;
        }
      }
      
      elements.push(
        <ExampleBlock
          key={`example-${lineIndex}`}
          title={exampleMatch.title}
          text={textAfter || undefined}
          items={exampleItems.length > 0 ? exampleItems : undefined}
          variant={exampleMatch.variant}
          searchQuery={searchQuery}
        />
      );
      
      lineIndex = nextIndex;
      continue;
    }

    // Bullet point list (• or - or ·) - sadece örnek bloğu dışındakiler
    if (isBulletLine(trimmed)) {
      currentListItems.push(extractBulletText(trimmed));
      lineIndex++;
      continue;
    }

    // Quote format (''...'' or "...")
    const quoteMatch = trimmed.match(/^[''""](.+)[''""]$/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <QuoteBlock key={`quote-${lineIndex}`} text={quoteMatch[1]} searchQuery={searchQuery} />
      );
      lineIndex++;
      continue;
    }

    // Note format (Not: ...)
    if (trimmed.startsWith("Not:") || trimmed.startsWith("NOT:") || 
        trimmed.startsWith("Uyarı:") || trimmed.startsWith("UYARI:") ||
        trimmed.startsWith("Dikkat:") || trimmed.startsWith("DİKKAT:")) {
      flushList();
      const colonIndex = trimmed.indexOf(':');
      const noteText = trimmed.slice(colonIndex + 1).trim();
      elements.push(
        <NoteBlock key={`note-${lineIndex}`} text={noteText} searchQuery={searchQuery} />
      );
      lineIndex++;
      continue;
    }

    // Collapsible detail section (lines starting with [...])
    if (trimmed.startsWith("[") && trimmed.includes("]")) {
      flushList();
      const currentDetailIndex = detailIndex++;
      const title = trimmed.match(/\[(.+?)\]/)?.[1] || "Detaylar";
      const detailContent = trimmed.slice(trimmed.indexOf("]") + 1).trim();
      
      elements.push(
        <CollapsibleDetail
          key={`detail-${currentDetailIndex}`}
          title={title}
          content={detailContent}
          isExpanded={expandedDetails.has(currentDetailIndex)}
          onToggle={() => toggleDetail(currentDetailIndex)}
          searchQuery={searchQuery}
        />
      );
      lineIndex++;
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIndex}`} className="text-foreground/80 text-sm leading-relaxed mb-2">
        {renderInlineFormatting(trimmed, searchQuery)}
      </p>
    );
    lineIndex++;
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
};

// Render inline formatting (**bold**, etc.)
const renderInlineFormatting = (text: string, searchQuery?: string): React.ReactNode => {
  // First handle bold text
  const boldParts = text.split(/\*\*(.+?)\*\*/g);
  
  return boldParts.map((part, index) => {
    // Odd indices are bold content
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {searchQuery ? <HighlightSearch text={part} query={searchQuery} /> : part}
        </strong>
      );
    }
    return searchQuery ? <HighlightSearch key={index} text={part} query={searchQuery} /> : part;
  });
};

// Quote Block Component
const QuoteBlock: React.FC<{ text: string; searchQuery?: string }> = ({ text, searchQuery }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="relative my-4 pl-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary/50 rounded-r-lg"
  >
    <Quote className="absolute -left-3 -top-2 w-5 h-5 text-primary/40" />
    <p className="text-foreground/90 text-sm italic leading-relaxed">
      {renderInlineFormatting(text, searchQuery)}
    </p>
  </motion.div>
);

// Note Block Component
const NoteBlock: React.FC<{ text: string; searchQuery?: string }> = ({ text, searchQuery }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="my-4 p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
      <Info className="w-4 h-4 text-amber-500" />
    </div>
    <div>
      <span className="text-amber-500 font-semibold text-xs uppercase tracking-wider">Not</span>
      <p className="text-foreground/80 text-sm mt-1 leading-relaxed">
        {renderInlineFormatting(text, searchQuery)}
      </p>
    </div>
  </motion.div>
);

// Gelişmiş Örnek Kutusu - 3 varyant destekler
interface ExampleBlockProps {
  title: string;
  text?: string;
  items?: string[];
  variant?: ExampleVariant;
  searchQuery?: string;
}

const ExampleBlock: React.FC<ExampleBlockProps> = ({ 
  title, 
  text, 
  items, 
  variant = 'default',
  searchQuery 
}) => {
  const variantStyles = {
    default: {
      container: 'bg-secondary/50 border-border/30',
      iconBg: 'bg-primary/10',
      icon: 'text-primary/70',
      title: 'text-primary/80',
      bullet: 'bg-primary/50',
      IconComponent: Lightbulb
    },
    correct: {
      container: 'bg-emerald-500/10 border-emerald-500/25',
      iconBg: 'bg-emerald-500/20',
      icon: 'text-emerald-500',
      title: 'text-emerald-600 dark:text-emerald-400',
      bullet: 'bg-emerald-500',
      IconComponent: CheckCircle
    },
    forbidden: {
      container: 'bg-rose-500/10 border-rose-500/25',
      iconBg: 'bg-rose-500/20',
      icon: 'text-rose-500',
      title: 'text-rose-600 dark:text-rose-400',
      bullet: 'bg-rose-500',
      IconComponent: XCircle
    }
  };

  const styles = variantStyles[variant];
  const Icon = styles.IconComponent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'my-4 p-4 border rounded-xl flex items-start gap-3',
        styles.container
      )}
    >
      <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', styles.iconBg)}>
        <Icon className={cn('w-4 h-4', styles.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn('font-semibold text-xs uppercase tracking-wider', styles.title)}>
          {title}
        </span>
        {text && (
          <p className="text-foreground/75 text-sm mt-1.5 leading-relaxed">
            {renderInlineFormatting(text, searchQuery)}
          </p>
        )}
        {items && items.length > 0 && (
          <ul className="mt-2.5 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/75">
                <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', styles.bullet)} />
                <span className="leading-relaxed">{renderInlineFormatting(item, searchQuery)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

// Collapsible Detail Component
const CollapsibleDetail: React.FC<{
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}> = ({ title, content, isExpanded, onToggle, searchQuery }) => (
  <div className="my-3 rounded-lg border border-border/30 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-between text-left"
    >
      <span className="text-foreground/80 text-sm font-medium">{title}</span>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4 text-foreground/50" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 py-3 bg-secondary/20 border-t border-border/20">
            <p className="text-foreground/70 text-sm leading-relaxed">
              {renderInlineFormatting(content, searchQuery)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Highlight Search Component
const HighlightSearch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-primary/30 text-primary font-medium px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export default RuleContentRenderer;
