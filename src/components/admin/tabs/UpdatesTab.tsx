import { useNavigate } from 'react-router-dom';
import { Loader2, Bell, Plus, Filter, Pencil, Trash2, ToggleLeft, ToggleRight, MessageSquare } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { UpdateData } from '@/types/update';
import type { UpdateFilterType, UpdateStatusFilterType } from '@/types/application';
import { formatDateTime } from '@/lib/formatters';
import { useDiscordNotification } from '@/hooks/useDiscordNotification';

interface UpdatesTabProps {
  updates: UpdateData[];
  isLoading: boolean;
  updateFilter: UpdateFilterType;
  setUpdateFilter: (filter: UpdateFilterType) => void;
  updateStatusFilter: UpdateStatusFilterType;
  setUpdateStatusFilter: (filter: UpdateStatusFilterType) => void;
  togglingUpdateId: string | null;
  toggleUpdateStatus: (updateId: string, currentStatus: boolean) => Promise<void>;
  setDeletingUpdateId: (id: string | null) => void;
}

export const UpdatesTab = ({
  updates,
  isLoading,
  updateFilter,
  setUpdateFilter,
  updateStatusFilter,
  setUpdateStatusFilter,
  togglingUpdateId,
  toggleUpdateStatus,
  setDeletingUpdateId,
}: UpdatesTabProps) => {
  const navigate = useNavigate();
  const { sendUpdateNotification, isSending: isDiscordSending } = useDiscordNotification();

  const filteredUpdates = updates.filter(update => {
    const categoryMatch = updateFilter === 'all' || update.category === updateFilter;
    const statusMatch = updateStatusFilter === 'all' || 
      (updateStatusFilter === 'published' ? update.is_published : !update.is_published);
    return categoryMatch && statusMatch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Güncellemeler</h2>
          <p className="text-muted-foreground">Güncellemeler ve haberleri yönet</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={updateFilter} onValueChange={(v) => setUpdateFilter(v as UpdateFilterType)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="update">Güncellemeler</SelectItem>
              <SelectItem value="news">Haberler</SelectItem>
            </SelectContent>
          </Select>
          <Select value={updateStatusFilter} onValueChange={(v) => setUpdateStatusFilter(v as UpdateStatusFilterType)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="published">Yayında</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/admin/update-editor')} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Güncelleme
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {updateFilter === 'all' && updateStatusFilter === 'all'
              ? 'Henüz güncelleme bulunmuyor'
              : 'Filtreye uygun güncelleme bulunamadı'
            }
          </p>
          <Button onClick={() => navigate('/admin/update-editor')} className="gap-2">
            <Plus className="w-4 h-4" />
            İlk Güncellemeyi Oluştur
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Başlık</TableHead>
                <TableHead className="text-muted-foreground">Kategori</TableHead>
                <TableHead className="text-muted-foreground">Versiyon</TableHead>
                <TableHead className="text-muted-foreground">Durum</TableHead>
                <TableHead className="text-muted-foreground">Tarih</TableHead>
                <TableHead className="text-muted-foreground text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUpdates.map((update) => (
                <TableRow key={update.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {update.title}
                  </TableCell>
                  <TableCell>
                    {update.category === 'update' ? (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Güncelleme
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Haber
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {update.version || '-'}
                  </TableCell>
                  <TableCell>
                    {update.is_published ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Yayında
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground border-border">
                        Taslak
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(update.created_at || '')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendUpdateNotification(update)}
                              disabled={!update.is_published || isDiscordSending}
                              className={update.is_published ? 'text-[#5865F2] hover:text-[#5865F2] hover:bg-[#5865F2]/10' : ''}
                            >
                              {isDiscordSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MessageSquare className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {update.is_published ? "Discord'a Gönder" : 'Önce yayınlayın'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUpdateStatus(update.id!, update.is_published)}
                        disabled={togglingUpdateId === update.id}
                        title={update.is_published ? 'Taslağa Al' : 'Yayınla'}
                      >
                        {togglingUpdateId === update.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : update.is_published ? (
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/update-editor/${update.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingUpdateId(update.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UpdatesTab;
