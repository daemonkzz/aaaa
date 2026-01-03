import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Users,
  Loader2,
  Save,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserPermissions, clearPermissionCache } from '@/hooks/useUserPermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TAB_NAMES, type AdminPermission, type TabKey, ALL_TABS } from '@/types/permissions';

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const PermissionsEditor = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: permLoading } = useUserPermissions();

  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<AdminPermission | null>(null);

  // Form states - Temel yetkiler
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTabs, setFormTabs] = useState<TabKey[]>([]);
  const [formCanManageUsers, setFormCanManageUsers] = useState(false);
  const [formCanManageApplications, setFormCanManageApplications] = useState(false);
  const [formCanManageForms, setFormCanManageForms] = useState(false);
  const [formCanManageUpdates, setFormCanManageUpdates] = useState(false);
  const [formCanManageRules, setFormCanManageRules] = useState(false);
  const [formCanManageGallery, setFormCanManageGallery] = useState(false);
  const [formCanManageNotifications, setFormCanManageNotifications] = useState(false);
  const [formCanManageWhiteboard, setFormCanManageWhiteboard] = useState(false);
  const [formCanManageGlossary, setFormCanManageGlossary] = useState(false);
  // Form states - Yeni granüler yetkiler
  const [formCanBanUsers, setFormCanBanUsers] = useState(false);
  const [formCanApproveApplications, setFormCanApproveApplications] = useState(false);
  const [formCanRejectApplications, setFormCanRejectApplications] = useState(false);
  const [formCanDeleteContent, setFormCanDeleteContent] = useState(false);
  const [formCanPublishContent, setFormCanPublishContent] = useState(false);
  const [formCanUploadMedia, setFormCanUploadMedia] = useState(false);
  const [formCanSendGlobalNotifications, setFormCanSendGlobalNotifications] = useState(false);
  const [formCanSendTargetedNotifications, setFormCanSendTargetedNotifications] = useState(false);
  const [formCanSendDiscordDm, setFormCanSendDiscordDm] = useState(false);
  const [formCanManageWhitelist, setFormCanManageWhitelist] = useState(false);
  const [formCanViewApplicationDetails, setFormCanViewApplicationDetails] = useState(false);
  const [formCanViewAIConflicts, setFormCanViewAIConflicts] = useState(false);

  // User assignment
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (!permLoading && !isSuperAdmin) {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      navigate('/admin');
    }
  }, [isSuperAdmin, permLoading, navigate]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Fetch permissions error:', error);
      toast.error('Yetkiler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .order('username');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchAssignedUsers = async (permissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_admin_permissions')
        .select('user_id')
        .eq('permission_id', permissionId);

      if (error) throw error;
      setAssignedUsers(data?.map(d => d.user_id) || []);
    } catch (error) {
      console.error('Fetch assigned users error:', error);
    }
  };

  const openEditModal = (permission?: AdminPermission) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormName(permission.name);
      setFormDescription(permission.description || '');
      setFormTabs(permission.allowed_tabs as TabKey[]);
      // Temel yetkiler
      setFormCanManageUsers(permission.can_manage_users);
      setFormCanManageApplications(permission.can_manage_applications);
      setFormCanManageForms(permission.can_manage_forms);
      setFormCanManageUpdates(permission.can_manage_updates);
      setFormCanManageRules(permission.can_manage_rules);
      setFormCanManageGallery(permission.can_manage_gallery);
      setFormCanManageNotifications(permission.can_manage_notifications);
      setFormCanManageWhiteboard(permission.can_manage_whiteboard);
      setFormCanManageGlossary(permission.can_manage_glossary);
      // Yeni granüler yetkiler
      setFormCanBanUsers(permission.can_ban_users ?? false);
      setFormCanApproveApplications(permission.can_approve_applications ?? false);
      setFormCanRejectApplications(permission.can_reject_applications ?? false);
      setFormCanDeleteContent(permission.can_delete_content ?? false);
      setFormCanPublishContent(permission.can_publish_content ?? false);
      setFormCanUploadMedia(permission.can_upload_media ?? false);
      setFormCanSendGlobalNotifications(permission.can_send_global_notifications ?? false);
      setFormCanSendTargetedNotifications(permission.can_send_targeted_notifications ?? false);
      setFormCanSendDiscordDm(permission.can_send_discord_dm ?? false);
      setFormCanManageWhitelist(permission.can_manage_whitelist ?? false);
      setFormCanViewApplicationDetails(permission.can_view_application_details ?? false);
      setFormCanViewAIConflicts(permission.can_view_ai_conflicts ?? false);
    } else {
      setSelectedPermission(null);
      setFormName('');
      setFormDescription('');
      setFormTabs([]);
      // Temel yetkiler
      setFormCanManageUsers(false);
      setFormCanManageApplications(false);
      setFormCanManageForms(false);
      setFormCanManageUpdates(false);
      setFormCanManageRules(false);
      setFormCanManageGallery(false);
      setFormCanManageNotifications(false);
      setFormCanManageWhiteboard(false);
      setFormCanManageGlossary(false);
      // Yeni granüler yetkiler
      setFormCanBanUsers(false);
      setFormCanApproveApplications(false);
      setFormCanRejectApplications(false);
      setFormCanDeleteContent(false);
      setFormCanPublishContent(false);
      setFormCanUploadMedia(false);
      setFormCanSendGlobalNotifications(false);
      setFormCanSendTargetedNotifications(false);
      setFormCanSendDiscordDm(false);
      setFormCanManageWhitelist(false);
      setFormCanViewApplicationDetails(false);
      setFormCanViewAIConflicts(false);
    }
    setEditModalOpen(true);
  };

  const handleSavePermission = async () => {
    if (!formName.trim()) {
      toast.error('Yetki adı gerekli');
      return;
    }

    setIsSaving(true);
    try {
      const permissionData = {
        name: formName,
        description: formDescription || null,
        allowed_tabs: formTabs,
        // Temel yetkiler
        can_manage_users: formCanManageUsers,
        can_manage_applications: formCanManageApplications,
        can_manage_forms: formCanManageForms,
        can_manage_updates: formCanManageUpdates,
        can_manage_rules: formCanManageRules,
        can_manage_gallery: formCanManageGallery,
        can_manage_notifications: formCanManageNotifications,
        can_manage_whiteboard: formCanManageWhiteboard,
        can_manage_glossary: formCanManageGlossary,
        // Yeni granüler yetkiler
        can_ban_users: formCanBanUsers,
        can_approve_applications: formCanApproveApplications,
        can_reject_applications: formCanRejectApplications,
        can_delete_content: formCanDeleteContent,
        can_publish_content: formCanPublishContent,
        can_upload_media: formCanUploadMedia,
        can_send_global_notifications: formCanSendGlobalNotifications,
        can_send_targeted_notifications: formCanSendTargetedNotifications,
        can_send_discord_dm: formCanSendDiscordDm,
        can_manage_whitelist: formCanManageWhitelist,
        can_view_application_details: formCanViewApplicationDetails,
        can_view_ai_conflicts: formCanViewAIConflicts,
      };

      if (selectedPermission) {
        const { error } = await supabase
          .from('admin_permissions')
          .update(permissionData)
          .eq('id', selectedPermission.id);

        if (error) throw error;
        toast.success('Yetki güncellendi');
      } else {
        const { error } = await supabase
          .from('admin_permissions')
          .insert(permissionData);

        if (error) throw error;
        toast.success('Yetki oluşturuldu');
      }

      setEditModalOpen(false);
      clearPermissionCache(); // Yetki değişti, cache'i temizle
      fetchPermissions();
    } catch (error: any) {
      console.error('Save permission error:', error);
      if (error.code === '23505') {
        toast.error('Bu isimde bir yetki zaten mevcut');
      } else {
        toast.error('Yetki kaydedilirken hata oluştu');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      const { error } = await supabase
        .from('admin_permissions')
        .delete()
        .eq('id', selectedPermission.id);

      if (error) throw error;
      toast.success('Yetki silindi');
      setDeleteDialogOpen(false);
      setSelectedPermission(null);
      clearPermissionCache(); // Yetki değişti, cache'i temizle
      fetchPermissions();
    } catch (error) {
      console.error('Delete permission error:', error);
      toast.error('Yetki silinirken hata oluştu');
    }
  };

  const openAssignModal = async (permission: AdminPermission) => {
    setSelectedPermission(permission);
    await Promise.all([fetchAllUsers(), fetchAssignedUsers(permission.id)]);
    setAssignModalOpen(true);
  };

  const handleToggleUserAssignment = async (userId: string) => {
    if (!selectedPermission) return;

    const isAssigned = assignedUsers.includes(userId);

    try {
      if (isAssigned) {
        const { error } = await supabase
          .from('user_admin_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission_id', selectedPermission.id);

        if (error) throw error;
        setAssignedUsers(prev => prev.filter(id => id !== userId));
        clearPermissionCache(); // Kullanıcı yetkisi değişti, cache'i temizle
        toast.success('Yetki kaldırıldı');
      } else {
        const { error } = await supabase
          .from('user_admin_permissions')
          .insert({
            user_id: userId,
            permission_id: selectedPermission.id,
          });

        if (error) throw error;
        setAssignedUsers(prev => [...prev, userId]);
        clearPermissionCache(); // Kullanıcı yetkisi değişti, cache'i temizle
        toast.success('Yetki atandı');
      }
    } catch (error) {
      console.error('Toggle assignment error:', error);
      toast.error('İşlem başarısız');
    }
  };

  const toggleTab = (tab: TabKey) => {
    setFormTabs(prev =>
      prev.includes(tab)
        ? prev.filter(t => t !== tab)
        : [...prev, tab]
    );
  };

  const filteredUsers = allUsers.filter(user =>
    !userSearch ||
    user.username?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Loading - sadece veri yüklenirken göster (permLoading artık global cache kullanıyor)
  if (isLoading) {
    return (
      <AdminRouteGuard>
        <AdminLayout activeTab="yetkilendirme">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AdminRouteGuard>
      <AdminLayout activeTab="yetkilendirme">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Yetki Yönetimi</h1>
              <p className="text-muted-foreground">Dinamik yetki rolleri oluşturun ve kullanıcılara atayın</p>
            </div>
            <Button onClick={() => openEditModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Yetki
            </Button>
          </div>

          {/* Info Card */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Super Admin Bilgisi</p>
                  <p className="text-sm text-amber-400/80">
                    Super Admin rolü veritabanından atanır ve tüm yetkilere sahiptir.
                    Bu sayfadaki yetkiler diğer kullanıcılar içindir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {permissions.map((permission) => (
              <Card key={permission.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{permission.name}</CardTitle>
                      <CardDescription>{permission.description || 'Açıklama yok'}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(permission)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPermission(permission);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Erişilebilir Sekmeler</p>
                    <div className="flex flex-wrap gap-1">
                      {permission.allowed_tabs.length === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground">Yok</Badge>
                      ) : (
                        permission.allowed_tabs.slice(0, 3).map(tab => (
                          <Badge key={tab} variant="secondary" className="text-xs">
                            {TAB_NAMES[tab as TabKey] || tab}
                          </Badge>
                        ))
                      )}
                      {permission.allowed_tabs.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{permission.allowed_tabs.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openAssignModal(permission)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Kullanıcı Ata
                  </Button>
                </CardContent>
              </Card>
            ))}

            {permissions.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Henüz yetki oluşturulmamış</p>
                  <Button onClick={() => openEditModal()} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Yetkiyi Oluştur
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit/Create Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPermission ? 'Yetkiyi Düzenle' : 'Yeni Yetki Oluştur'}
              </DialogTitle>
              <DialogDescription>
                Yetki ayarlarını yapılandırın ve hangi sekmelere erişebileceğini belirleyin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="perm-name">Yetki Adı *</Label>
                  <Input
                    id="perm-name"
                    placeholder="örn: Moderatör, İçerik Editörü"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="perm-desc">Açıklama</Label>
                  <Textarea
                    id="perm-desc"
                    placeholder="Bu yetkinin amacını ve kapsamını açıklayın..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Tab Access - Categorized */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium">Sekme Erişimi</span>
                    <Badge variant="secondary" className="ml-2">{formTabs.length} seçili</Badge>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {/* Ana Sekmeler */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">📊 Ana Sekmeler</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['dashboard', 'basvurular'] as TabKey[]).map(tab => (
                        <div
                          key={tab}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formTabs.includes(tab)
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:bg-muted hover:border-muted-foreground/30'
                            }`}
                          onClick={() => toggleTab(tab)}
                        >
                          <Checkbox checked={formTabs.includes(tab)} className="pointer-events-none" />
                          <span className="text-sm font-medium">{TAB_NAMES[tab]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* İçerik Yönetimi */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">📝 İçerik Yönetimi</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['formlar', 'guncellemeler', 'kurallar', 'sozluk'] as TabKey[]).map(tab => (
                        <div
                          key={tab}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formTabs.includes(tab)
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:bg-muted hover:border-muted-foreground/30'
                            }`}
                          onClick={() => toggleTab(tab)}
                        >
                          <Checkbox checked={formTabs.includes(tab)} className="pointer-events-none" />
                          <span className="text-sm font-medium">{TAB_NAMES[tab]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medya & İletişim */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">🖼️ Medya & İletişim</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['galeri', 'bildirimler', 'canliharita'] as TabKey[]).map(tab => (
                        <div
                          key={tab}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formTabs.includes(tab)
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:bg-muted hover:border-muted-foreground/30'
                            }`}
                          onClick={() => toggleTab(tab)}
                        >
                          <Checkbox checked={formTabs.includes(tab)} className="pointer-events-none" />
                          <span className="text-sm font-medium">{TAB_NAMES[tab]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hızlı Seçim Butonları */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormTabs(['dashboard', 'basvurular', 'formlar', 'guncellemeler', 'kurallar', 'sozluk', 'galeri', 'bildirimler', 'canliharita'])}
                    >
                      Tümünü Seç
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormTabs([])}
                    >
                      Tümünü Kaldır
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormTabs(['dashboard', 'basvurular'])}
                    >
                      Sadece Temel
                    </Button>
                  </div>

                  <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Kullanıcılar, Yetki Yönetimi, 2FA Yönetimi ve AI Yönetimi sekmeleri sadece Super Admin'e açıktır.</span>
                  </p>
                </CollapsibleContent>
              </Collapsible>

              {/* Management Permissions - Enhanced with all new permissions */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">Yönetim Yetkileri</span>
                    <Badge variant="secondary" className="ml-2">
                      {[
                        formCanManageUsers, formCanManageApplications, formCanManageForms, formCanManageUpdates,
                        formCanManageRules, formCanManageGallery, formCanManageNotifications, formCanManageWhiteboard,
                        formCanManageGlossary, formCanBanUsers, formCanApproveApplications, formCanRejectApplications,
                        formCanDeleteContent, formCanPublishContent, formCanUploadMedia, formCanSendGlobalNotifications,
                        formCanSendTargetedNotifications, formCanSendDiscordDm, formCanManageWhitelist,
                        formCanViewApplicationDetails, formCanViewAIConflicts
                      ].filter(Boolean).length} aktif
                    </Badge>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">

                  {/* 📝 BAŞVURU YÖNETİMİ */}
                  <div className="space-y-2 border border-border rounded-lg p-3">
                    <p className="text-xs text-primary font-semibold flex items-center gap-1">📝 Başvuru Yönetimi</p>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-apps" className="cursor-pointer text-sm">Başvuru Genel Yönetimi</Label>
                        <p className="text-xs text-muted-foreground">Başvuruları görüntüleme ve temel işlemler</p>
                      </div>
                      <Switch id="manage-apps" checked={formCanManageApplications} onCheckedChange={setFormCanManageApplications} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="view-app-details" className="cursor-pointer text-sm">Başvuru Detaylarını Görme</Label>
                        <p className="text-xs text-muted-foreground">Başvuru detay sayfasına erişim</p>
                      </div>
                      <Switch id="view-app-details" checked={formCanViewApplicationDetails} onCheckedChange={setFormCanViewApplicationDetails} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10">
                      <div>
                        <Label htmlFor="approve-apps" className="cursor-pointer text-sm text-emerald-600">✅ Başvuru Onaylama</Label>
                        <p className="text-xs text-muted-foreground">Başvuruları onaylayabilme yetkisi</p>
                      </div>
                      <Switch id="approve-apps" checked={formCanApproveApplications} onCheckedChange={setFormCanApproveApplications} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10">
                      <div>
                        <Label htmlFor="reject-apps" className="cursor-pointer text-sm text-red-600">❌ Başvuru Reddetme</Label>
                        <p className="text-xs text-muted-foreground">Başvuruları reddedebilme yetkisi</p>
                      </div>
                      <Switch id="reject-apps" checked={formCanRejectApplications} onCheckedChange={setFormCanRejectApplications} />
                    </div>
                  </div>

                  {/* 📄 İÇERİK YÖNETİMİ */}
                  <div className="space-y-2 border border-border rounded-lg p-3">
                    <p className="text-xs text-primary font-semibold flex items-center gap-1">📄 İçerik Yönetimi</p>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-forms" className="cursor-pointer text-sm">Form Şablonları</Label>
                        <p className="text-xs text-muted-foreground">Form şablonları oluşturma ve düzenleme</p>
                      </div>
                      <Switch id="manage-forms" checked={formCanManageForms} onCheckedChange={setFormCanManageForms} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-updates" className="cursor-pointer text-sm">Güncellemeler/Haberler</Label>
                        <p className="text-xs text-muted-foreground">Haber ve güncelleme oluşturma</p>
                      </div>
                      <Switch id="manage-updates" checked={formCanManageUpdates} onCheckedChange={setFormCanManageUpdates} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-rules" className="cursor-pointer text-sm">Kurallar</Label>
                        <p className="text-xs text-muted-foreground">Sunucu kurallarını düzenleme</p>
                      </div>
                      <Switch id="manage-rules" checked={formCanManageRules} onCheckedChange={setFormCanManageRules} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-glossary" className="cursor-pointer text-sm">Terimler Sözlüğü</Label>
                        <p className="text-xs text-muted-foreground">Sözlük girdileri yönetimi</p>
                      </div>
                      <Switch id="manage-glossary" checked={formCanManageGlossary} onCheckedChange={setFormCanManageGlossary} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10">
                      <div>
                        <Label htmlFor="publish-content" className="cursor-pointer text-sm text-blue-600">🚀 İçerik Yayınlama</Label>
                        <p className="text-xs text-muted-foreground">Taslakları yayına alma yetkisi</p>
                      </div>
                      <Switch id="publish-content" checked={formCanPublishContent} onCheckedChange={setFormCanPublishContent} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10">
                      <div>
                        <Label htmlFor="delete-content" className="cursor-pointer text-sm text-red-600">🗑️ İçerik Silme</Label>
                        <p className="text-xs text-muted-foreground">Form, güncelleme, kural, galeri silme</p>
                      </div>
                      <Switch id="delete-content" checked={formCanDeleteContent} onCheckedChange={setFormCanDeleteContent} />
                    </div>
                  </div>

                  {/* 🖼️ MEDYA & İLETİŞİM */}
                  <div className="space-y-2 border border-border rounded-lg p-3">
                    <p className="text-xs text-primary font-semibold flex items-center gap-1">🖼️ Medya & İletişim</p>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-gallery" className="cursor-pointer text-sm">Galeri Yönetimi</Label>
                        <p className="text-xs text-muted-foreground">Medya galerisini görüntüleme</p>
                      </div>
                      <Switch id="manage-gallery" checked={formCanManageGallery} onCheckedChange={setFormCanManageGallery} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10">
                      <div>
                        <Label htmlFor="upload-media" className="cursor-pointer text-sm text-emerald-600">⬆️ Medya Yükleme</Label>
                        <p className="text-xs text-muted-foreground">Görsel ve video yükleme yetkisi</p>
                      </div>
                      <Switch id="upload-media" checked={formCanUploadMedia} onCheckedChange={setFormCanUploadMedia} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-board" className="cursor-pointer text-sm">Canlı Harita</Label>
                        <p className="text-xs text-muted-foreground">Whiteboard düzenleme</p>
                      </div>
                      <Switch id="manage-board" checked={formCanManageWhiteboard} onCheckedChange={setFormCanManageWhiteboard} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-notif" className="cursor-pointer text-sm">Bildirim Yönetimi</Label>
                        <p className="text-xs text-muted-foreground">Bildirim sistemi genel erişimi</p>
                      </div>
                      <Switch id="manage-notif" checked={formCanManageNotifications} onCheckedChange={setFormCanManageNotifications} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10">
                      <div>
                        <Label htmlFor="send-targeted-notif" className="cursor-pointer text-sm text-purple-600">👤 Hedefli Bildirim</Label>
                        <p className="text-xs text-muted-foreground">Belirli kullanıcılara bildirim gönderme</p>
                      </div>
                      <Switch id="send-targeted-notif" checked={formCanSendTargetedNotifications} onCheckedChange={setFormCanSendTargetedNotifications} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10">
                      <div>
                        <Label htmlFor="send-global-notif" className="cursor-pointer text-sm text-amber-600">🌍 Global Bildirim</Label>
                        <p className="text-xs text-muted-foreground">Tüm kullanıcılara bildirim gönderme (dikkatli kullanın)</p>
                      </div>
                      <Switch id="send-global-notif" checked={formCanSendGlobalNotifications} onCheckedChange={setFormCanSendGlobalNotifications} />
                    </div>
                  </div>

                  {/* 👥 KULLANICI YÖNETİMİ */}
                  <div className="space-y-2 border border-border rounded-lg p-3">
                    <p className="text-xs text-primary font-semibold flex items-center gap-1">👥 Kullanıcı Yönetimi</p>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <Label htmlFor="manage-users" className="cursor-pointer text-sm">Kullanıcı Genel Yönetimi</Label>
                        <p className="text-xs text-muted-foreground">Kullanıcı listesini görüntüleme</p>
                      </div>
                      <Switch id="manage-users" checked={formCanManageUsers} onCheckedChange={setFormCanManageUsers} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10">
                      <div>
                        <Label htmlFor="manage-whitelist" className="cursor-pointer text-sm text-emerald-600">✅ Whitelist Yönetimi</Label>
                        <p className="text-xs text-muted-foreground">Onaylı kullanıcı listesi düzenleme</p>
                      </div>
                      <Switch id="manage-whitelist" checked={formCanManageWhitelist} onCheckedChange={setFormCanManageWhitelist} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10">
                      <div>
                        <Label htmlFor="ban-users" className="cursor-pointer text-sm text-red-600">🚫 Kullanıcı Banlama</Label>
                        <p className="text-xs text-muted-foreground">Kullanıcıları yasaklama yetkisi</p>
                      </div>
                      <Switch id="ban-users" checked={formCanBanUsers} onCheckedChange={setFormCanBanUsers} />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10">
                      <div>
                        <Label htmlFor="send-discord-dm" className="cursor-pointer text-sm text-indigo-600">💬 Discord DM Gönderme</Label>
                        <p className="text-xs text-muted-foreground">Kullanıcılara Discord üzerinden mesaj</p>
                      </div>
                      <Switch id="send-discord-dm" checked={formCanSendDiscordDm} onCheckedChange={setFormCanSendDiscordDm} />
                    </div>
                  </div>

                  {/* 🤖 AI & ÖZEL */}
                  <div className="space-y-2 border border-amber-500/30 rounded-lg p-3 bg-amber-500/5">
                    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">🤖 AI & Özel Yetkiler</p>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-500/10">
                      <div>
                        <Label htmlFor="view-ai-conflicts" className="cursor-pointer text-sm">AI Çatışma Görüntüleme</Label>
                        <p className="text-xs text-muted-foreground">AI tarafından işaretlenen çatışmalı başvuruları görme</p>
                      </div>
                      <Switch id="view-ai-conflicts" checked={formCanViewAIConflicts} onCheckedChange={setFormCanViewAIConflicts} />
                    </div>
                  </div>

                  {/* Hızlı Seçim Butonları */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Tüm yetkileri aç
                        setFormCanManageUsers(true);
                        setFormCanManageApplications(true);
                        setFormCanManageForms(true);
                        setFormCanManageUpdates(true);
                        setFormCanManageRules(true);
                        setFormCanManageGallery(true);
                        setFormCanManageNotifications(true);
                        setFormCanManageWhiteboard(true);
                        setFormCanManageGlossary(true);
                        setFormCanBanUsers(true);
                        setFormCanApproveApplications(true);
                        setFormCanRejectApplications(true);
                        setFormCanDeleteContent(true);
                        setFormCanPublishContent(true);
                        setFormCanUploadMedia(true);
                        setFormCanSendGlobalNotifications(true);
                        setFormCanSendTargetedNotifications(true);
                        setFormCanSendDiscordDm(true);
                        setFormCanManageWhitelist(true);
                        setFormCanViewApplicationDetails(true);
                        setFormCanViewAIConflicts(true);
                      }}
                    >
                      Tüm Yetkiler
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Sadece başvuru okuma
                        setFormCanManageApplications(true);
                        setFormCanViewApplicationDetails(true);
                        // Diğerlerini kapat
                        setFormCanManageUsers(false);
                        setFormCanManageForms(false);
                        setFormCanManageUpdates(false);
                        setFormCanManageRules(false);
                        setFormCanManageGallery(false);
                        setFormCanManageNotifications(false);
                        setFormCanManageWhiteboard(false);
                        setFormCanManageGlossary(false);
                        setFormCanBanUsers(false);
                        setFormCanApproveApplications(false);
                        setFormCanRejectApplications(false);
                        setFormCanDeleteContent(false);
                        setFormCanPublishContent(false);
                        setFormCanUploadMedia(false);
                        setFormCanSendGlobalNotifications(false);
                        setFormCanSendTargetedNotifications(false);
                        setFormCanSendDiscordDm(false);
                        setFormCanManageWhitelist(false);
                        setFormCanViewAIConflicts(false);
                      }}
                    >
                      Sadece Görüntüleme
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Moderatör paketi
                        setFormCanManageApplications(true);
                        setFormCanViewApplicationDetails(true);
                        setFormCanApproveApplications(true);
                        setFormCanRejectApplications(true);
                        setFormCanManageUsers(true);
                        setFormCanBanUsers(true);
                        setFormCanSendTargetedNotifications(true);
                        setFormCanSendDiscordDm(true);
                        // Diğerlerini kapat
                        setFormCanManageForms(false);
                        setFormCanManageUpdates(false);
                        setFormCanManageRules(false);
                        setFormCanManageGallery(false);
                        setFormCanManageNotifications(false);
                        setFormCanManageWhiteboard(false);
                        setFormCanManageGlossary(false);
                        setFormCanDeleteContent(false);
                        setFormCanPublishContent(false);
                        setFormCanUploadMedia(false);
                        setFormCanSendGlobalNotifications(false);
                        setFormCanManageWhitelist(false);
                        setFormCanViewAIConflicts(false);
                      }}
                    >
                      Moderatör Paketi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Tümünü kapat
                        setFormCanManageUsers(false);
                        setFormCanManageApplications(false);
                        setFormCanManageForms(false);
                        setFormCanManageUpdates(false);
                        setFormCanManageRules(false);
                        setFormCanManageGallery(false);
                        setFormCanManageNotifications(false);
                        setFormCanManageWhiteboard(false);
                        setFormCanManageGlossary(false);
                        setFormCanBanUsers(false);
                        setFormCanApproveApplications(false);
                        setFormCanRejectApplications(false);
                        setFormCanDeleteContent(false);
                        setFormCanPublishContent(false);
                        setFormCanUploadMedia(false);
                        setFormCanSendGlobalNotifications(false);
                        setFormCanSendTargetedNotifications(false);
                        setFormCanSendDiscordDm(false);
                        setFormCanManageWhitelist(false);
                        setFormCanViewApplicationDetails(false);
                        setFormCanViewAIConflicts(false);
                      }}
                    >
                      Tümünü Kaldır
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSavePermission} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {selectedPermission ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Yetkiyi Sil</AlertDialogTitle>
              <AlertDialogDescription>
                "{selectedPermission?.name}" yetkisini silmek istediğinize emin misiniz?
                Bu yetkiye sahip kullanıcılar bu yetkileri kaybedecek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePermission} className="bg-red-500 hover:bg-red-600">
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assign Users Modal */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kullanıcı Ata</DialogTitle>
              <DialogDescription>
                "{selectedPermission?.name}" yetkisini kullanıcılara atayın.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Kullanıcı ara..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${assignedUsers.includes(user.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                      }`}
                    onClick={() => handleToggleUserAssignment(user.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.username?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm">{user.username || 'İsimsiz'}</span>
                    {assignedUsers.includes(user.id) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Kullanıcı bulunamadı</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default PermissionsEditor;
