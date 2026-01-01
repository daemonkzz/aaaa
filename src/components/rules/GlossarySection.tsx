import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GlossaryTerm {
  id: string;
  term: string;
  full_name: string | null;
  definition: string;
  category: string;
  is_critical: boolean;
  order_index: number;
}

interface CategoryInfo {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORY_MAP: Record<string, CategoryInfo> = {
  rol_disi: {
    id: 'rol_disi',
    title: 'Rol Dışı İhlaller',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  saldiri: {
    id: 'saldiri',
    title: 'Saldırı ve Çatışma',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  acik: {
    id: 'acik',
    title: 'Oyun Açığı ve İstismar',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  karakter: {
    id: 'karakter',
    title: 'Karakter ve Oynanış',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  iletisim: {
    id: 'iletisim',
    title: 'İletişim ve Karma',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  genel: {
    id: 'genel',
    title: 'Genel',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
};

export const GlossarySection: React.FC = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(CATEGORY_MAP));
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        setTerms(data as GlossaryTerm[]);
      }
      setLoading(false);
    };

    fetchTerms();
  }, []);

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return terms;
    const query = searchQuery.toLowerCase();
    return terms.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        term.full_name?.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query)
    );
  }, [terms, searchQuery]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      if (!groups[term.category]) {
        groups[term.category] = [];
      }
      groups[term.category].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.section
      id="terimler-sozlugu"
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl md:text-3xl text-foreground italic tracking-wide">
            Terimler Sözlüğü
          </h3>
          <p className="text-foreground/50 text-sm mt-1">
            RP dünyasında sıkça kullanılan terimler ve açıklamaları
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <Input
          type="text"
          placeholder="Terim ara... (örn: RDM, VDM)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2.5 bg-secondary/30 border-border/20 text-foreground placeholder:text-foreground/40 rounded-xl text-sm focus:border-primary/50"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(CATEGORY_MAP).map(([categoryId, categoryInfo]) => {
          const categoryTerms = groupedTerms[categoryId] || [];
          if (categoryTerms.length === 0 && searchQuery) return null;

          const isExpanded = expandedCategories.includes(categoryId);

          return (
            <motion.div
              key={categoryId}
              className={cn(
                "rounded-2xl border overflow-hidden",
                categoryInfo.bgColor,
                categoryInfo.borderColor
              )}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("font-semibold", categoryInfo.color)}>
                    {categoryInfo.title}
                  </span>
                  <span className="text-foreground/40 text-xs">
                    ({categoryTerms.length} terim)
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={cn("w-5 h-5", categoryInfo.color)} />
                </motion.div>
              </button>

              {/* Terms List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-2">
                      {categoryTerms.length === 0 ? (
                        <p className="text-foreground/40 text-sm py-2">
                          Bu kategoride terim bulunamadı.
                        </p>
                      ) : (
                        categoryTerms.map((term) => (
                          <motion.div
                            key={term.id}
                            className={cn(
                              "relative p-3.5 rounded-xl bg-background/50 border border-transparent transition-all duration-200 cursor-default",
                              hoveredTerm === term.id && "border-primary/30 bg-background/80"
                            )}
                            onMouseEnter={() => setHoveredTerm(term.id)}
                            onMouseLeave={() => setHoveredTerm(null)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <span
                                  className={cn(
                                    "inline-block px-2.5 py-1 rounded-lg text-sm font-bold",
                                    term.is_critical
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-secondary/60 text-foreground/80 border border-border/30"
                                  )}
                                >
                                  {term.term}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                {term.full_name && (
                                  <span className="text-foreground/50 text-xs block mb-1">
                                    {term.full_name}
                                  </span>
                                )}
                                <p className="text-foreground/70 text-sm leading-relaxed">
                                  {term.definition}
                                </p>
                              </div>
                              {term.is_critical && (
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* No results */}
      {filteredTerms.length === 0 && searchQuery && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-foreground/50 text-lg">Arama sonucu bulunamadı.</p>
          <p className="text-foreground/30 text-sm mt-2">
            Farklı anahtar kelimeler deneyin.
          </p>
        </motion.div>
      )}
    </motion.section>
  );
};

export default GlossarySection;
