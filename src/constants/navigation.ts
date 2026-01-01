import {
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  Shield,
  Image as ImageIcon,
  Map,
  Users,
  ShieldCheck,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export type AdminTabType = 
  | 'dashboard' 
  | 'basvurular' 
  | 'formlar' 
  | 'guncellemeler' 
  | 'bildirimler' 
  | 'kurallar' 
  | 'sozluk'
  | 'galeri' 
  | 'canliharita' 
  | 'kullanicilar' 
  | 'yetkilendirme';

export interface SidebarItem {
  id: AdminTabType;
  label: string;
  icon: LucideIcon;
  route?: string; // If defined, navigates to this route instead of changing tab
}

export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'basvurular', label: 'Başvurular', icon: FileText },
  { id: 'formlar', label: 'Form Şablonları', icon: Settings },
  { id: 'guncellemeler', label: 'Güncellemeler', icon: Bell },
  { id: 'bildirimler', label: 'Bildirimler', icon: Bell, route: '/admin/notification-editor' },
  { id: 'kurallar', label: 'Kurallar', icon: Shield, route: '/admin/rules-editor' },
  { id: 'sozluk', label: 'Terimler Sözlüğü', icon: BookOpen, route: '/admin/glossary-editor' },
  { id: 'galeri', label: 'Medya Galeri', icon: ImageIcon, route: '/admin/gallery' },
  { id: 'canliharita', label: 'Canlı Harita', icon: Map, route: '/admin/whiteboard-editor' },
  { id: 'kullanicilar', label: 'Kullanıcılar', icon: Users },
  { id: 'yetkilendirme', label: 'Yetki Yönetimi', icon: ShieldCheck, route: '/admin/manage-access' },
];

// Get sidebar item by id
export const getSidebarItem = (id: AdminTabType): SidebarItem | undefined => {
  return ADMIN_SIDEBAR_ITEMS.find(item => item.id === id);
};

// Check if tab has external route
export const hasExternalRoute = (id: AdminTabType): boolean => {
  const item = getSidebarItem(id);
  return !!item?.route;
};

// Get route for tab
export const getTabRoute = (id: AdminTabType): string | undefined => {
  return getSidebarItem(id)?.route;
};
