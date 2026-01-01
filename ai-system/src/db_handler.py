"""
Kaze AI System - Database Handler
Supabase ile iletişimi yönetir
"""

import os
from supabase import create_client, Client
from loguru import logger
from typing import Optional, List, Dict, Any
from datetime import datetime

class DatabaseHandler:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL ve SUPABASE_SERVICE_KEY gerekli!")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Supabase bağlantısı kuruldu")
    
    # ==========================================
    # AI SETTINGS
    # ==========================================
    
    def get_ai_settings(self) -> Optional[Dict[str, Any]]:
        """AI ayarlarını getir"""
        try:
            response = self.client.table("ai_settings").select("*").eq("id", "main").single().execute()
            return response.data
        except Exception as e:
            logger.error(f"AI ayarları alınamadı: {e}")
            return None
    
    def update_ai_settings(self, settings: Dict[str, Any]) -> bool:
        """AI ayarlarını güncelle"""
        try:
            settings["updated_at"] = datetime.utcnow().isoformat()
            self.client.table("ai_settings").update(settings).eq("id", "main").execute()
            logger.info("AI ayarları güncellendi")
            return True
        except Exception as e:
            logger.error(f"AI ayarları güncellenemedi: {e}")
            return False
    
    # ==========================================
    # APPLICATIONS
    # ==========================================
    
    def get_pending_applications(self, limit: int = 50) -> List[Dict[str, Any]]:
        """İşlenmemiş başvuruları getir (öncelikli olanlar önce)"""
        try:
            response = self.client.table("applications")\
                .select("*, profiles(username, discord_id)")\
                .in_("ai_processing_status", ["pending", "queued"])\
                .order("ai_priority", desc=True)\
                .order("created_at", desc=False)\
                .limit(limit)\
                .execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Başvurular alınamadı: {e}")
            return []
    
    def get_priority_applications(self) -> List[Dict[str, Any]]:
        """Öncelikli başvuruları getir"""
        try:
            response = self.client.table("applications")\
                .select("*, profiles(username, discord_id)")\
                .eq("ai_priority", 1)\
                .eq("ai_processing_status", "queued")\
                .execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Öncelikli başvurular alınamadı: {e}")
            return []
    
    def update_application_status(self, app_id: int, status: str, **kwargs) -> bool:
        """Başvuru durumunu güncelle"""
        try:
            data = {"ai_processing_status": status, **kwargs}
            self.client.table("applications").update(data).eq("id", app_id).execute()
            return True
        except Exception as e:
            logger.error(f"Başvuru durumu güncellenemedi: {e}")
            return False
    
    def approve_application(self, app_id: int, admin_note: str = None) -> bool:
        """Başvuruyu onayla"""
        try:
            data = {
                "status": "approved",
                "ai_processing_status": "done"
            }
            if admin_note:
                data["admin_note"] = admin_note
            self.client.table("applications").update(data).eq("id", app_id).execute()
            return True
        except Exception as e:
            logger.error(f"Başvuru onaylanamadı: {e}")
            return False
    
    def reject_application(self, app_id: int, admin_note: str = None) -> bool:
        """Başvuruyu reddet"""
        try:
            data = {
                "status": "rejected",
                "ai_processing_status": "done"
            }
            if admin_note:
                data["admin_note"] = admin_note
            self.client.table("applications").update(data).eq("id", app_id).execute()
            return True
        except Exception as e:
            logger.error(f"Başvuru reddedilemedi: {e}")
            return False
    
    def request_revision(self, app_id: int, fields: List[str], notes: Dict[str, str]) -> bool:
        """Revizyon iste"""
        try:
            data = {
                "status": "revision_requested",
                "revision_requested_fields": fields,
                "revision_notes": notes,
                "ai_processing_status": "done"
            }
            self.client.table("applications").update(data).eq("id", app_id).execute()
            return True
        except Exception as e:
            logger.error(f"Revizyon istenemedi: {e}")
            return False
    
    # ==========================================
    # AI REPORTS
    # ==========================================
    
    def create_ai_report(self, report: Dict[str, Any]) -> Optional[int]:
        """AI raporu oluştur"""
        try:
            response = self.client.table("ai_reports").insert(report).execute()
            if response.data:
                return response.data[0].get("id")
            return None
        except Exception as e:
            logger.error(f"AI raporu oluşturulamadı: {e}")
            return None
    
    def get_daily_processed_count(self) -> int:
        """Bugün işlenen başvuru sayısı"""
        try:
            today = datetime.utcnow().date().isoformat()
            response = self.client.table("ai_reports")\
                .select("id", count="exact")\
                .gte("created_at", today)\
                .execute()
            return response.count or 0
        except Exception as e:
            logger.error(f"Günlük sayı alınamadı: {e}")
            return 0
    
    # ==========================================
    # FORM TEMPLATES
    # ==========================================
    
    def get_form_template(self, form_id: str) -> Optional[Dict[str, Any]]:
        """Form şablonunu getir"""
        try:
            response = self.client.table("form_templates")\
                .select("*")\
                .eq("id", form_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Form şablonu alınamadı: {e}")
            return None
    
    # ==========================================
    # AUDIT LOG
    # ==========================================
    
    def log_action(self, action: str, details: Dict[str, Any] = None) -> None:
        """Aksiyon logla"""
        try:
            self.client.table("ai_audit_log").insert({
                "action": action,
                "details": details
            }).execute()
        except Exception as e:
            logger.error(f"Log kaydedilemedi: {e}")
