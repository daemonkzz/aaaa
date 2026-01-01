import { useNavigate } from 'react-router-dom';
import { Loader2, Settings, Plus, Filter, Pencil, Trash2, ToggleLeft, ToggleRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FormTemplate, FormFilterType } from '@/types/application';
import type { FormType } from '@/types/formBuilder';
import { formatDateTime } from '@/lib/formatters';

interface FormsTabProps {
  formTemplates: FormTemplate[];
  isLoading: boolean;
  formFilter: FormFilterType;
  setFormFilter: (filter: FormFilterType) => void;
  togglingFormId: string | null;
  toggleFormStatus: (formId: string, currentStatus: boolean, isWhitelist: boolean) => Promise<void>;
  setDeletingFormId: (id: string | null) => void;
}

export const FormsTab = ({
  formTemplates,
  isLoading,
  formFilter,
  setFormFilter,
  togglingFormId,
  toggleFormStatus,
  setDeletingFormId,
}: FormsTabProps) => {
  const navigate = useNavigate();

  const getFormType = (template: FormTemplate): FormType => {
    return (template.settings as any)?.formType || 'other';
  };

  const filteredFormTemplates = formTemplates.filter(template => {
    if (formFilter === 'all') return true;
    const formType = getFormType(template);
    return formType === formFilter;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Form Şablonları</h2>
          <p className="text-muted-foreground">Başvuru formlarını oluştur ve yönet</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={formFilter} onValueChange={(v) => setFormFilter(v as FormFilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Formlar</SelectItem>
              <SelectItem value="whitelist">Whitelist Formları</SelectItem>
              <SelectItem value="other">Diğer Formlar</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/admin/form-builder')} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Form Oluştur
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFormTemplates.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {formFilter === 'all' 
              ? 'Henüz form şablonu bulunmuyor'
              : formFilter === 'whitelist'
              ? 'Whitelist formu bulunmuyor'
              : 'Diğer form bulunmuyor'
            }
          </p>
          <Button onClick={() => navigate('/admin/form-builder')} className="gap-2">
            <Plus className="w-4 h-4" />
            İlk Formu Oluştur
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Form Adı</TableHead>
                <TableHead className="text-muted-foreground">Tip</TableHead>
                <TableHead className="text-muted-foreground">Soru Sayısı</TableHead>
                <TableHead className="text-muted-foreground">Durum</TableHead>
                <TableHead className="text-muted-foreground">Oluşturulma</TableHead>
                <TableHead className="text-muted-foreground text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormTemplates.map((template) => {
                const formType = getFormType(template);
                const isWhitelist = formType === 'whitelist';
                return (
                  <TableRow key={template.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {template.title}
                    </TableCell>
                    <TableCell>
                      {isWhitelist ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Whitelist
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Diğer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {template.questions?.length || 0} soru
                    </TableCell>
                    <TableCell>
                      {template.is_active ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border-border">
                          Pasif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(template.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFormStatus(template.id, template.is_active, isWhitelist)}
                          disabled={togglingFormId === template.id}
                          title={template.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {togglingFormId === template.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : template.is_active ? (
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/form-builder/${template.id}`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingFormId(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FormsTab;
