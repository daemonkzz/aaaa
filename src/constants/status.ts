import type { ApplicationStatus } from '@/types/application';

// Application status configuration
export const APPLICATION_STATUS_CONFIG = {
  pending: {
    label: 'Beklemede',
    color: 'amber',
    bgClass: 'bg-amber-500/20',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
  },
  approved: {
    label: 'Onaylandı',
    color: 'emerald',
    bgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
  },
  rejected: {
    label: 'Reddedildi',
    color: 'red',
    bgClass: 'bg-red-500/20',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
  },
  revision_requested: {
    label: 'Revizyon Bekleniyor',
    color: 'amber',
    bgClass: 'bg-amber-500/20',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
  },
} as const;

// Get status config by key
export const getStatusConfig = (status: string) => {
  return APPLICATION_STATUS_CONFIG[status as ApplicationStatus] || APPLICATION_STATUS_CONFIG.pending;
};

// Form type labels
export const FORM_TYPE_LABELS: Record<string, string> = {
  whitelist: 'Whitelist Başvurusu',
  'lspd-akademi': 'LSPD Akademi Başvurusu',
  sirket: 'Şirket Başvurusu',
  taksici: 'Taksici Başvurusu',
  hastane: 'LSFMD Hastane Başvurusu',
  other: 'Diğer Başvuru',
};

// Form field labels for display
export const FIELD_LABELS: Record<string, string> = {
  // Whitelist
  discordName: 'Discord Kullanıcı Adı',
  age: 'Yaş',
  howDidYouFind: 'Sunucuyu Nasıl Buldu',
  rpExperience: 'RP Deneyimi',
  whatIsRp: 'RP Nedir Açıklaması',
  rules: 'Temel RP Kuralları Bilgisi',
  characterName: 'Karakter Adı',
  characterAge: 'Karakter Yaşı',
  characterBackstory: 'Karakter Hikayesi',
  scenario1: 'Senaryo 1 Cevabı',
  scenario2: 'Senaryo 2 Cevabı',
  // LSPD
  phone: 'Telefon Numarası',
  previousJob: 'Önceki Meslek',
  criminalRecord: 'Sabıka Kaydı',
  backstory: 'Karakter Hikayesi',
  whyJoin: 'Katılma Nedeni',
  experience: 'RP Deneyimi',
  availability: 'Haftalık Aktiflik',
  // Şirket
  companyName: 'Şirket Adı',
  companyType: 'Şirket Türü',
  location: 'Lokasyon',
  ownerName: 'Sahip Adı',
  ownerPhone: 'Sahip Telefonu',
  capital: 'Sermaye',
  businessPlan: 'İş Planı',
  employees: 'Planlanan Çalışan Sayısı',
  uniqueness: 'Özellik',
  // Taksici
  license: 'Ehliyet Durumu',
  accidents: 'Kaza Geçmişi',
  cityKnowledge: 'Şehir Bilgisi',
  workHours: 'Çalışma Saatleri',
  whyTaxi: 'Taksici Olma Nedeni',
  // Hastane
  education: 'Tıbbi Eğitim',
  department: 'Başvurulan Birim',
};

// Update categories
export const UPDATE_CATEGORIES = {
  update: { label: 'Güncelleme', value: 'update' },
  news: { label: 'Haber', value: 'news' },
} as const;
