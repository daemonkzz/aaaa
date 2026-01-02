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
    
    # ==========================================
    # YENİ METHODLAR
    # ==========================================
    
    def get_application_current_status(self, app_id: int) -> Optional[str]:
        """Başvurunun güncel durumunu getir (pre-check için)"""
        try:
            response = self.client.table("applications")\
                .select("status")\
                .eq("id", app_id)\
                .single()\
                .execute()
            return response.data.get("status") if response.data else None
        except Exception as e:
            logger.error(f"Başvuru durumu alınamadı: {e}")
            return None
    
    def update_application_conflict_status(self, app_id: int, conflict_status: str) -> bool:
        """Başvurunun çatışma durumunu güncelle"""
        try:
            self.client.table("applications").update({
                "ai_conflict_status": conflict_status
            }).eq("id", app_id).execute()
            return True
        except Exception as e:
            logger.error(f"Çatışma durumu güncellenemedi: {e}")
            return False
    
    def update_application_dry_run(self, app_id: int, dry_run: bool) -> bool:
        """Başvurunun dry run flag'ını güncelle"""
        try:
            self.client.table("applications").update({
                "ai_dry_run": dry_run
            }).eq("id", app_id).execute()
            return True
        except Exception as e:
            logger.error(f"Dry run flag güncellenemedi: {e}")
            return False
    
    def update_daily_stats(self, decision: str, confidence: int, cost: float, has_conflict: bool = False) -> None:
        """Günlük istatistikleri güncelle"""
        try:
            today = datetime.utcnow().date().isoformat()
            
            # Bugünkü kaydı bul veya oluştur
            response = self.client.table("ai_daily_stats")\
                .select("*")\
                .eq("stat_date", today)\
                .execute()
            
            if response.data:
                # Güncelle
                stats = response.data[0]
                new_total = stats.get("total_forms_processed", 0) + 1
                new_avg = ((stats.get("avg_confidence_score", 0) * stats.get("total_forms_processed", 0)) + confidence) / new_total
                
                update_data = {
                    "total_forms_processed": new_total,
                    "avg_confidence_score": round(new_avg, 2),
                    "estimated_cost_usd": stats.get("estimated_cost_usd", 0) + cost
                }
                
                if decision == "approved":
                    update_data["approved_count"] = stats.get("approved_count", 0) + 1
                elif decision == "rejected":
                    update_data["rejected_count"] = stats.get("rejected_count", 0) + 1
                elif decision == "revision":
                    update_data["revision_count"] = stats.get("revision_count", 0) + 1
                
                if has_conflict:
                    update_data["conflict_count"] = stats.get("conflict_count", 0) + 1
                
                self.client.table("ai_daily_stats").update(update_data).eq("id", stats["id"]).execute()
            else:
                # Yeni kayıt oluştur
                insert_data = {
                    "stat_date": today,
                    "total_forms_processed": 1,
                    "avg_confidence_score": confidence,
                    "estimated_cost_usd": cost,
                    "approved_count": 1 if decision == "approved" else 0,
                    "rejected_count": 1 if decision == "rejected" else 0,
                    "revision_count": 1 if decision == "revision" else 0,
                    "conflict_count": 1 if has_conflict else 0
                }
                self.client.table("ai_daily_stats").insert(insert_data).execute()
                
        except Exception as e:
            logger.error(f"İstatistikler güncellenemedi: {e}")

    def save_ai_evaluation(self, app_id: int, evaluation: dict) -> None:
        """AI değerlendirmesini kaydet"""
        try:
            self.client.table("applications").update({
                "ai_evaluation": evaluation,
                "processed_by_ai": True
            }).eq("id", app_id).execute()
            logger.debug(f"AI değerlendirmesi kaydedildi: #{app_id}")
        except Exception as e:
            logger.error(f"AI değerlendirmesi kaydedilemedi: {e}")
    
    def lock_application(self, app_id: int, locked_by: str = "ai") -> None:
        """Başvuruyu kilitle (onay/red sonrası)"""
        try:
            from datetime import datetime
            self.client.table("applications").update({
                "is_locked": True,
                "locked_by": locked_by,
                "locked_at": datetime.now().isoformat()
            }).eq("id", app_id).execute()
            logger.info(f"Başvuru kilitlendi: #{app_id} (by: {locked_by})")
        except Exception as e:
            logger.error(f"Başvuru kilitlenemedi: {e}")
    
    def unlock_application(self, app_id: int) -> None:
        """Başvuru kilidini kaldır (super_admin için)"""
        try:
            self.client.table("applications").update({
                "is_locked": False,
                "locked_by": None,
                "locked_at": None
            }).eq("id", app_id).execute()
            logger.info(f"Başvuru kilidi açıldı: #{app_id}")
        except Exception as e:
            logger.error(f"Başvuru kilidi açılamadı: {e}")
