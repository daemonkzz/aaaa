import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    Settings,
    FileText,
    BarChart3,
    Loader2,
    Power,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    TrendingUp,
    Shield,
    Zap,
    DollarSign,
    Timer,
    Gavel
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import type { AISettings, AIReport, AIDailyStats, AIMode } from '@/types/aiSystem';

const AIManagementContent: React.FC = () => {
    // Settings State
    const [settings, setSettings] = useState<AISettings | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Reports State
    const [reports, setReports] = useState<AIReport[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Stats State
    const [dailyStats, setDailyStats] = useState<AIDailyStats[]>([]);
    const [todayProcessed, setTodayProcessed] = useState(0);

    // Temporary form state
    const [formData, setFormData] = useState<Partial<AISettings>>({});
    const [blacklistInput, setBlacklistInput] = useState('');

    // Conflict forms state
    const [conflictForms, setConflictForms] = useState<any[]>([]);
    const [isLoadingConflicts, setIsLoadingConflicts] = useState(false);

    // Fetch AI Settings
    const fetchSettings = useCallback(async () => {
        setIsLoadingSettings(true);
        try {
            const { data, error } = await supabase
                .from('ai_settings')
                .select('*')
                .eq('id', 'main')
                .single();

            if (error) throw error;

            setSettings(data as unknown as AISettings);
            setFormData(data as unknown as AISettings);
            setBlacklistInput((data?.blacklist_words || []).join(', '));
        } catch (error) {
            console.error('AI ayarları alınamadı:', error);
            toast.error('AI ayarları yüklenirken hata oluştu');
        } finally {
            setIsLoadingSettings(false);
        }
    }, []);

    // Fetch AI Reports
    const fetchReports = useCallback(async () => {
        setIsLoadingReports(true);
        try {
            const { data, error } = await supabase
                .from('ai_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setReports((data || []) as unknown as AIReport[]);
        } catch (error) {
            console.error('AI raporları alınamadı:', error);
        } finally {
            setIsLoadingReports(false);
        }
    }, []);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            // Today's count
            const today = new Date().toISOString().split('T')[0];
            const { count } = await supabase
                .from('ai_reports')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            setTodayProcessed(count || 0);

            // Daily stats view
            const { data: stats } = await supabase
                .from('ai_daily_stats')
                .select('*')
                .limit(7);

            setDailyStats((stats || []) as unknown as AIDailyStats[]);
        } catch (error) {
            console.error('İstatistikler alınamadı:', error);
        }
    }, []);

    // Fetch conflict forms
    const fetchConflictForms = useCallback(async () => {
        setIsLoadingConflicts(true);
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*, profiles(username)')
                .in('ai_conflict_status', ['conflict_pending', 'conflict_admin'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setConflictForms(data || []);
        } catch (error) {
            console.error('Çatışmalı formlar alınamadı:', error);
        } finally {
            setIsLoadingConflicts(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchReports();
        fetchStats();
        fetchConflictForms();
    }, [fetchSettings, fetchReports, fetchStats, fetchConflictForms]);

    // Save Settings
    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);

        try {
            // Parse blacklist
            const blacklistWords = blacklistInput
                .split(',')
                .map(w => w.trim().toLowerCase())
                .filter(w => w.length > 0);

            const updateData = {
                ...formData,
                blacklist_words: blacklistWords,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('ai_settings')
                .update(updateData)
                .eq('id', 'main');

            if (error) throw error;

            toast.success('AI ayarları kaydedildi');
            fetchSettings();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            toast.error('Ayarlar kaydedilirken hata oluştu');
        } finally {
            setIsSaving(false);
        }
    };

    // Get mode badge
    const getModeBadge = (mode: AIMode) => {
        switch (mode) {
            case 'autonomous':
                return <Badge className="bg-emerald-500/20 text-emerald-400">Tam Otonom</Badge>;
            case 'readonly':
                return <Badge className="bg-blue-500/20 text-blue-400">Sadece Okuma</Badge>;
            case 'hybrid':
                return <Badge className="bg-amber-500/20 text-amber-400">Hibrit</Badge>;
            default:
                return <Badge variant="outline">{mode}</Badge>;
        }
    };

    // Get decision badge
    const getDecisionBadge = (decision: string | null) => {
        switch (decision) {
            case 'approved':
                return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" />Onay</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Red</Badge>;
            case 'revision':
                return <Badge className="bg-amber-500/20 text-amber-400"><RefreshCw className="w-3 h-3 mr-1" />Revizyon</Badge>;
            case 'interview':
                return <Badge className="bg-purple-500/20 text-purple-400"><Users className="w-3 h-3 mr-1" />Mülakat</Badge>;
            default:
                return <Badge variant="outline">-</Badge>;
        }
    };

    if (isLoadingSettings) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Brain className="w-6 h-6 text-primary" />
                    AI Yönetim Paneli
                </h2>
                <p className="text-muted-foreground">
                    Başvuru değerlendirme AI sistemini yönetin
                </p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Durum</p>
                                <p className="text-xl font-bold">
                                    {settings?.is_enabled ? (
                                        <span className="text-emerald-400">Aktif</span>
                                    ) : (
                                        <span className="text-red-400">Pasif</span>
                                    )}
                                </p>
                            </div>
                            <Power className={`w-8 h-8 ${settings?.is_enabled ? 'text-emerald-400' : 'text-red-400'}`} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Mod</p>
                                <p className="text-xl font-bold capitalize">
                                    {settings?.mode === 'autonomous' ? 'Otonom' :
                                        settings?.mode === 'readonly' ? 'Okuma' : 'Hibrit'}
                                </p>
                            </div>
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Bugün İşlenen</p>
                                <p className="text-xl font-bold">{todayProcessed} / {settings?.daily_limit || 50}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Güven Eşiği</p>
                                <p className="text-xl font-bold">%{settings?.confidence_threshold || 85}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="settings" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Ayarlar
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Raporlar
                    </TabsTrigger>
                    <TabsTrigger value="conflicts" className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Çatışmalı ({conflictForms.length})
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        İstatistikler
                    </TabsTrigger>
                </TabsList>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* General Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Genel Ayarlar</CardTitle>
                                <CardDescription>AI sisteminin temel çalışma ayarları</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Enable/Disable */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>AI Sistemi</Label>
                                        <p className="text-sm text-muted-foreground">Sistemi aktif/pasif yap</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_enabled || false}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                                    />
                                </div>

                                {/* Mode Selection */}
                                <div className="space-y-2">
                                    <Label>Çalışma Modu</Label>
                                    <Select
                                        value={formData.mode || 'readonly'}
                                        onValueChange={(value) => setFormData({ ...formData, mode: value as AIMode })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="autonomous">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-emerald-400" />
                                                    Tam Otonom
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="readonly">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-blue-400" />
                                                    Sadece Okuma (QC)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="hybrid">
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw className="w-4 h-4 text-amber-400" />
                                                    Hibrit
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Confidence Threshold */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Güven Eşiği</Label>
                                        <span className="text-sm text-muted-foreground">%{formData.confidence_threshold || 85}</span>
                                    </div>
                                    <Slider
                                        value={[formData.confidence_threshold || 85]}
                                        onValueChange={([value]) => setFormData({ ...formData, confidence_threshold: value })}
                                        min={50}
                                        max={100}
                                        step={5}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Bu değerin altındaki başvurular otomatik işlenmez, admin'e bırakılır
                                    </p>
                                </div>

                                {/* Daily Limit */}
                                <div className="space-y-2">
                                    <Label>Günlük Limit</Label>
                                    <Input
                                        type="number"
                                        value={formData.daily_limit || 50}
                                        onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                                        min={1}
                                        max={500}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Günde maksimum işlenecek başvuru sayısı
                                    </p>
                                </div>

                                {/* Batch Interval */}
                                <div className="space-y-2">
                                    <Label>Kontrol Aralığı</Label>
                                    <Select
                                        value={formData.batch_interval || '30m'}
                                        onValueChange={(value) => setFormData({ ...formData, batch_interval: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30m">
                                                <div className="flex items-center gap-2">
                                                    <Timer className="w-4 h-4" />
                                                    30 Dakikada Bir
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="6h">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    6 Saatte Bir
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="daily">
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw className="w-4 h-4" />
                                                    Günlük (Belirlenen Saat)
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Daily Hour (only for daily mode) */}
                                {formData.batch_interval === 'daily' && (
                                    <div className="space-y-2">
                                        <Label>Günlük Çalışma Saati</Label>
                                        <Input
                                            type="number"
                                            value={formData.daily_batch_hour || 3}
                                            onChange={(e) => setFormData({ ...formData, daily_batch_hour: parseInt(e.target.value) })}
                                            min={0}
                                            max={23}
                                        />
                                        <p className="text-xs text-muted-foreground">0-23 arası saat</p>
                                    </div>
                                )}

                                {/* Opus Arbiter Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="flex items-center gap-2">
                                            <Gavel className="w-4 h-4" />
                                            Opus Hakem
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Çatışmada Opus hakem olarak karar versin
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.opus_arbiter_enabled || false}
                                        onCheckedChange={(checked) => setFormData({ ...formData, opus_arbiter_enabled: checked })}
                                    />
                                </div>

                                {/* Auto Actions */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Otomatik Onay</Label>
                                            <p className="text-xs text-muted-foreground">Başarılı başvuruları otomatik onayla</p>
                                        </div>
                                        <Switch
                                            checked={formData.auto_approve || false}
                                            onCheckedChange={(checked) => setFormData({ ...formData, auto_approve: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Otomatik Red</Label>
                                            <p className="text-xs text-muted-foreground">Başarısız başvuruları otomatik reddet</p>
                                        </div>
                                        <Switch
                                            checked={formData.auto_reject || false}
                                            onCheckedChange={(checked) => setFormData({ ...formData, auto_reject: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Discord & Blacklist */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Discord & Kara Liste</CardTitle>
                                <CardDescription>Discord entegrasyonu ve filtreleme ayarları</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Discord Delay */}
                                <div className="space-y-2">
                                    <Label>Discord Gecikme (ms)</Label>
                                    <Input
                                        type="number"
                                        value={formData.discord_delay_ms || 2000}
                                        onChange={(e) => setFormData({ ...formData, discord_delay_ms: parseInt(e.target.value) })}
                                        min={500}
                                        max={10000}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Discord işlemleri arasındaki bekleme süresi
                                    </p>
                                </div>

                                {/* Revision Limit */}
                                <div className="space-y-2">
                                    <Label>Revizyon Limiti</Label>
                                    <Input
                                        type="number"
                                        value={formData.revision_limit || 3}
                                        onChange={(e) => setFormData({ ...formData, revision_limit: parseInt(e.target.value) })}
                                        min={1}
                                        max={10}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Maksimum revizyon hakkı (sonrası red/mülakat)
                                    </p>
                                </div>

                                {/* Blacklist Words */}
                                <div className="space-y-2">
                                    <Label>Kara Liste Kelimeleri</Label>
                                    <Textarea
                                        value={blacklistInput}
                                        onChange={(e) => setBlacklistInput(e.target.value)}
                                        placeholder="kelime1, kelime2, kelime3..."
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Virgülle ayırarak yazın. Bu kelimeleri içeren başvurular flag'lenir.
                                    </p>
                                </div>

                                {/* Cost Alert Threshold */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Maliyet Uyarı Eşiği ($)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.cost_alert_threshold || 5}
                                        onChange={(e) => setFormData({ ...formData, cost_alert_threshold: parseFloat(e.target.value) })}
                                        min={1}
                                        max={100}
                                        step={0.5}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Günlük maliyet bu eşiği geçince Discord'dan uyarı gönderilir
                                    </p>
                                </div>

                                {/* Log Webhook */}
                                <div className="space-y-2">
                                    <Label>Discord Log Webhook</Label>
                                    <Input
                                        value={formData.discord_log_webhook || ''}
                                        onChange={(e) => setFormData({ ...formData, discord_log_webhook: e.target.value })}
                                        placeholder="https://discord.com/api/webhooks/..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Kaydet
                        </Button>
                    </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>AI Raporları</CardTitle>
                                <CardDescription>Son değerlendirme raporları</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchReports} disabled={isLoadingReports}>
                                {isLoadingReports ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {reports.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Henüz AI raporu bulunmamaktadır.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Başvuru</TableHead>
                                            <TableHead>Mod</TableHead>
                                            <TableHead>Karar</TableHead>
                                            <TableHead>Güven</TableHead>
                                            <TableHead>Tarih</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-mono text-xs">#{report.id}</TableCell>
                                                <TableCell>#{report.application_id}</TableCell>
                                                <TableCell>{getModeBadge(report.mode)}</TableCell>
                                                <TableCell>{getDecisionBadge(report.final_decision)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${report.confidence_score || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs">%{report.confidence_score || 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(report.created_at).toLocaleString('tr-TR')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Conflicts Tab */}
                <TabsContent value="conflicts">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    Çatışmalı Başvurular
                                </CardTitle>
                                <CardDescription>
                                    DeepSeek ve Opus arasında uyuşmazlık olan başvurular
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchConflictForms} disabled={isLoadingConflicts}>
                                {isLoadingConflicts ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {conflictForms.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                                    <p>Çatışmalı başvuru bulunmamaktadır.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Kullanıcı</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead>Tarih</TableHead>
                                            <TableHead>İşlem</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {conflictForms.map((form) => (
                                            <TableRow key={form.id}>
                                                <TableCell className="font-mono text-xs">#{form.id}</TableCell>
                                                <TableCell>{form.profiles?.username || 'Bilinmiyor'}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-amber-500/20 text-amber-400">
                                                        {form.ai_conflict_status === 'conflict_admin' ? 'Admin Bekleniyor' : 'Hakem Bekleniyor'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(form.created_at).toLocaleString('tr-TR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`/admin/basvuru/${form.id}`, '_blank')}
                                                    >
                                                        Detay
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Haftalık Özet</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {dailyStats.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Henüz yeterli veri yok
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tarih</TableHead>
                                                <TableHead>Toplam</TableHead>
                                                <TableHead>Onay</TableHead>
                                                <TableHead>Red</TableHead>
                                                <TableHead>Ort. Güven</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dailyStats.map((stat, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{stat.report_date}</TableCell>
                                                    <TableCell>{stat.total_processed}</TableCell>
                                                    <TableCell className="text-emerald-400">{stat.approved_count}</TableCell>
                                                    <TableCell className="text-red-400">{stat.rejected_count}</TableCell>
                                                    <TableCell>%{Math.round(stat.avg_confidence || 0)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sistem Durumu</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        <span>Daemon Servisi</span>
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-400">Çalışıyor</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span>Kontrol Aralığı</span>
                                    </div>
                                    <span className="text-sm">30 dakika</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-primary" />
                                        <span>Günlük Restart</span>
                                    </div>
                                    <span className="text-sm">04:00</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const AIManagement: React.FC = () => {
    return (
        <AdminLayout>
            <AIManagementContent />
        </AdminLayout>
    );
};

export default AIManagement;
