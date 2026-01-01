import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  AlertTriangle, 
  BookOpen,
  Search,
  Filter
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GlossaryTerm {
  id: string;
  term: string;
  full_name: string | null;
  definition: string;
  category: string;
  is_critical: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { id: 'rol_disi', label: 'Rol Dışı İhlaller', color: 'text-red-500' },
  { id: 'saldiri', label: 'Saldırı ve Çatışma', color: 'text-orange-500' },
  { id: 'acik', label: 'Oyun Açığı ve İstismar', color: 'text-amber-500' },
  { id: 'karakter', label: 'Karakter ve Oynanış', color: 'text-cyan-500' },
  { id: 'iletisim', label: 'İletişim ve Karma', color: 'text-violet-500' },
  { id: 'genel', label: 'Genel', color: 'text-primary' },
];

const GlossaryEditorContent: React.FC = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    term: "",
    full_name: "",
    definition: "",
    category: "genel",
    is_critical: false,
    order_index: 0,
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    const { data, error } = await supabase
      .from('glossary_terms')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      toast.error("Terimler yüklenirken hata oluştu");
      console.error(error);
    } else {
      setTerms(data as GlossaryTerm[]);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingTerm(null);
    setFormData({
      term: "",
      full_name: "",
      definition: "",
      category: "genel",
      is_critical: false,
      order_index: terms.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (term: GlossaryTerm) => {
    setEditingTerm(term);
    setFormData({
      term: term.term,
      full_name: term.full_name || "",
      definition: term.definition,
      category: term.category,
      is_critical: term.is_critical,
      order_index: term.order_index,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.term.trim() || !formData.definition.trim()) {
      toast.error("Terim ve tanım alanları zorunludur");
      return;
    }

    setSaving(true);

    try {
      if (editingTerm) {
        // Update existing
        const { error } = await supabase
          .from('glossary_terms')
          .update({
            term: formData.term,
            full_name: formData.full_name || null,
            definition: formData.definition,
            category: formData.category,
            is_critical: formData.is_critical,
            order_index: formData.order_index,
          })
          .eq('id', editingTerm.id);

        if (error) throw error;
        toast.success("Terim güncellendi");
      } else {
        // Create new
        const { error } = await supabase
          .from('glossary_terms')
          .insert({
            term: formData.term,
            full_name: formData.full_name || null,
            definition: formData.definition,
            category: formData.category,
            is_critical: formData.is_critical,
            order_index: formData.order_index,
          });

        if (error) throw error;
        toast.success("Terim eklendi");
      }

      setIsModalOpen(false);
      fetchTerms();
    } catch (error) {
      console.error(error);
      toast.error("İşlem sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('glossary_terms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Terim silindi");
      setDeleteConfirm(null);
      fetchTerms();
    } catch (error) {
      console.error(error);
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      !searchQuery ||
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || term.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.color || 'text-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display italic text-foreground">
              Terimler Sözlüğü Yönetimi
            </h1>
            <p className="text-foreground/50 text-sm">
              {terms.length} terim kayıtlı
            </p>
          </div>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni Terim Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Terim ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2 text-foreground/40" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Terms Table */}
      <div className="bg-secondary/30 rounded-2xl border border-border/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  Terim
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider hidden md:table-cell">
                  Tam Adı
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider hidden lg:table-cell">
                  Tanım
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  Kritik
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filteredTerms.map((term, index) => (
                <motion.tr
                  key={term.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={cn(
                      "font-semibold",
                      term.is_critical && "text-red-400"
                    )}>
                      {term.term}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60 text-sm hidden md:table-cell">
                    {term.full_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-foreground/50 text-sm hidden lg:table-cell">
                    <span className="line-clamp-2 max-w-xs">
                      {term.definition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-medium", getCategoryColor(term.category))}>
                      {getCategoryLabel(term.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {term.is_critical && (
                      <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(term)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(term.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/50">Terim bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTerm ? "Terim Düzenle" : "Yeni Terim Ekle"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Terim *</Label>
                <Input
                  id="term"
                  value={formData.term}
                  onChange={(e) =>
                    setFormData({ ...formData, term: e.target.value })
                  }
                  placeholder="örn: RDM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Tam Adı</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="örn: Random Deathmatch"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="definition">Tanım *</Label>
              <Textarea
                id="definition"
                value={formData.definition}
                onChange={(e) =>
                  setFormData({ ...formData, definition: e.target.value })
                }
                placeholder="Terimin açıklamasını yazın..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_index">Sıra</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order_index: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="is_critical"
                checked={formData.is_critical}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_critical: checked })
                }
              />
              <Label htmlFor="is_critical" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Kritik ihlal olarak işaretle
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terimi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu terimi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const GlossaryEditor: React.FC = () => {
  return (
    <AdminLayout activeTab="sozluk">
      <GlossaryEditorContent />
    </AdminLayout>
  );
};

export default GlossaryEditor;
