"""
Kaze AI System - Ana Daemon
Ayarlanabilir aralıklarla çalışan, başvuruları işleyen ana servis
"""

import os
import sys
import asyncio
import signal
from datetime import datetime, time, date
from decimal import Decimal
from dotenv import load_dotenv
from loguru import logger

# Modülleri import et
from src.db_handler import DatabaseHandler
from src.ai_clients import DeepSeekClient, ClaudeClient
from src.discord_handler import DiscordHandler, WebhookHandler

# .env yükle
load_dotenv()

# Logger ayarları
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/daemon_{time:YYYY-MM-DD}.log",
    rotation="00:00",
    retention="30 days",
    level="DEBUG"
)

# Token başı maliyet (USD)
COST_PER_1M_TOKENS = {
    "deepseek_input": Decimal("0.55"),
    "deepseek_output": Decimal("2.19"),
    "opus_input": Decimal("5.00"),
    "opus_output": Decimal("25.00"),
}


class KazeAIDaemon:
    """Ana AI işleme daemon'ı"""
    
    def __init__(self):
        self.running = False
        self.db = DatabaseHandler()
        self.deepseek = DeepSeekClient()
        self.claude = ClaudeClient()
        self.discord = DiscordHandler()
        self.webhook = WebhookHandler()
        
        # Günlük maliyet takibi
        self.daily_cost = Decimal("0")
        self.cost_alert_sent = False
        
        # Prompt'ları yükle
        self.prompts = self._load_prompts()
        
        logger.info("Kaze AI Daemon başlatıldı")
    
    def _load_prompts(self) -> dict:
        """System prompt'larını yükle"""
        prompts = {}
        prompt_dir = "config/prompts"
        
        files = {
            "deepseek": "deepseek_system.txt",
            "opus": "claude_opus_system.txt",  # Ana model artık Opus
            "arbiter": "claude_opus_system.txt"  # Hakem de Opus (farklı prompt olabilir)
        }
        
        for key, filename in files.items():
            path = os.path.join(prompt_dir, filename)
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    prompts[key] = f.read()
            else:
                logger.warning(f"Prompt dosyası bulunamadı: {path}")
                prompts[key] = ""
        
        return prompts
    
    def _get_check_interval(self, settings: dict) -> int:
        """Ayarlardan check interval'ı al (saniye cinsinden)"""
        batch_interval = settings.get("batch_interval", "30m")
        daily_hour = settings.get("daily_batch_hour", 3)
        
        if batch_interval == "30m":
            return 30 * 60  # 30 dakika
        elif batch_interval == "6h":
            return 6 * 60 * 60  # 6 saat
        elif batch_interval == "daily":
            # Günlük modda, belirlenen saate kadar bekle
            now = datetime.now()
            target = now.replace(hour=daily_hour, minute=0, second=0, microsecond=0)
            if now >= target:
                # Bugünkü saat geçtiyse yarına ayarla
                target = target.replace(day=target.day + 1)
            return int((target - now).total_seconds())
        else:
            return 30 * 60  # Varsayılan 30 dakika
    
    async def start(self):
        """Daemon'ı başlat"""
        self.running = True
        
        # Discord bot'u başlat
        await self.discord.start()
        
        # Graceful shutdown için signal handler (sadece Unix'te)
        if sys.platform != "win32":
            loop = asyncio.get_event_loop()
            for sig in (signal.SIGTERM, signal.SIGINT):
                loop.add_signal_handler(sig, lambda: asyncio.create_task(self.stop()))
        
        logger.info("Daemon çalışmaya başladı")
        
        # Ana döngü
        await self._main_loop()
    
    async def stop(self):
        """Daemon'ı durdur"""
        logger.info("Daemon durduruluyor...")
        self.running = False
        await self.discord.stop()
        logger.info("Daemon durduruldu")
    
    async def _main_loop(self):
        """Ana işleme döngüsü"""
        restart_hour = int(os.getenv("DAILY_RESTART_HOUR", "4"))
        
        while self.running:
            try:
                settings = self.db.get_ai_settings()
                if not settings:
                    logger.error("AI ayarları alınamadı, 5 dakika sonra tekrar denenecek")
                    await asyncio.sleep(300)
                    continue
                
                # Günlük restart kontrolü
                now = datetime.now()
                if now.hour == restart_hour and now.minute < 5:
                    logger.info("Günlük restart zamanı, yeniden başlatılıyor...")
                    await self.stop()
                    return
                
                # Gün değiştiyse maliyet sıfırla
                if now.date() != getattr(self, '_last_date', None):
                    self._last_date = now.date()
                    self.daily_cost = Decimal("0")
                    self.cost_alert_sent = False
                
                # Öncelikli başvuruları kontrol et
                priority_apps = self.db.get_priority_applications()
                if priority_apps:
                    logger.info(f"{len(priority_apps)} öncelikli başvuru bulundu")
                    for app in priority_apps:
                        await self._process_application(app, settings=settings)
                
                # Normal başvuruları işle
                await self._process_batch(settings)
                
                # Check interval'ı ayarlardan al
                check_interval = self._get_check_interval(settings)
                logger.info(f"Sonraki kontrol: {check_interval // 60} dakika sonra")
                await asyncio.sleep(check_interval)
                
            except Exception as e:
                logger.error(f"Ana döngü hatası: {e}")
                await self.webhook.send_alert("🔴 API Hatası", f"Daemon ana döngü hatası: {str(e)[:200]}")
                await asyncio.sleep(60)
    
    async def _process_batch(self, settings: dict):
        """Batch işleme"""
        if not settings.get("is_enabled"):
            logger.info("AI sistemi devre dışı")
            return
        
        mode = settings.get("mode", "readonly")
        daily_limit = settings.get("daily_limit", 50)
        
        # Günlük limit kontrolü
        processed_today = self.db.get_daily_processed_count()
        if processed_today >= daily_limit:
            logger.warning(f"Günlük limit aşıldı: {processed_today}/{daily_limit}")
            await self.webhook.send_alert(
                "⚠️ Günlük Limit",
                f"Bugün {processed_today} başvuru işlendi, limit: {daily_limit}"
            )
            return
        
        # Bekleyen başvuruları al
        remaining = daily_limit - processed_today
        applications = self.db.get_pending_applications(limit=remaining)
        
        if not applications:
            logger.info("İşlenecek başvuru yok")
            return
        
        logger.info(f"{len(applications)} başvuru işlenecek (mod: {mode})")
        
        for app in applications:
            # PRE-CHECK: Staff zaten işlediyse atla
            current_status = self.db.get_application_current_status(app["id"])
            if current_status in ["approved", "rejected", "revision_requested"]:
                logger.info(f"Başvuru #{app['id']} zaten staff tarafından işlenmiş, atlanıyor")
                self.db.update_application_status(app["id"], "skipped")
                continue
            
            await self._process_application(app, mode, settings)
    
    async def _process_application(self, app: dict, mode: str = None, settings: dict = None):
        """Tek başvuruyu işle"""
        app_id = app["id"]
        start_time = datetime.now()
        is_dry_run = app.get("ai_dry_run", False)
        
        try:
            # Ayarları al (eğer verilmediyse)
            if not settings:
                settings = self.db.get_ai_settings()
            if not mode:
                mode = settings.get("mode", "readonly")
            
            # DRY RUN kontrolü
            if is_dry_run:
                logger.info(f"[DRY RUN] Başvuru #{app_id} test modunda işleniyor")
            
            # İşleniyor olarak işaretle
            self.db.update_application_status(app_id, "processing")
            
            logger.info(f"Başvuru işleniyor: #{app_id}")
            
            # 1. AŞAMA: DeepSeek R1 Analizi
            content = app.get("content", {})
            blacklist = settings.get("blacklist_words", [])
            
            deepseek_result, ds_input, ds_output = await self.deepseek.analyze_application(
                content,
                self.prompts.get("deepseek", ""),
                blacklist
            )
            
            if not deepseek_result:
                raise Exception("DeepSeek analizi başarısız")
            
            deepseek_decision = deepseek_result.get("decision", "interview")
            logger.info(f"DeepSeek kararı: {deepseek_decision}")
            
            # 2. AŞAMA: Claude Opus (Ana Model)
            rp_questions = content
            
            opus_result, op_input, op_output = await self.claude.evaluate_rp_content(
                rp_questions,
                deepseek_result,
                self.prompts.get("opus", "")
            )
            
            opus_decision = opus_result.get("recommendation", "interview") if opus_result else deepseek_decision
            logger.info(f"Opus kararı: {opus_decision}")
            
            # 3. AŞAMA: Çatışma Kontrolü
            final_decision = deepseek_decision
            arbiter_result = None
            arb_input, arb_output = 0, 0
            conflict_status = None
            
            if deepseek_decision != opus_decision:
                logger.info("Uyuşmazlık tespit edildi!")
                
                opus_arbiter_enabled = settings.get("opus_arbiter_enabled", False)
                
                if opus_arbiter_enabled:
                    # Opus hakem olarak çağır
                    logger.info("Opus hakemliği başlatılıyor...")
                    arbiter_result, arb_input, arb_output = await self.claude.arbitrate(
                        content,
                        deepseek_decision,
                        opus_decision,
                        deepseek_result,
                        opus_result,
                        self.prompts.get("arbiter", "")
                    )
                    
                    if arbiter_result:
                        final_decision = arbiter_result.get("final_decision", "interview")
                        conflict_status = "conflict_resolved"
                        logger.info(f"Hakem kararı: {final_decision}")
                else:
                    # Admin'e bırak
                    conflict_status = "conflict_admin"
                    final_decision = "interview"  # Varsayılan olarak mülakata yönlendir
                    logger.info("Çatışma admin'e yönlendiriliyor")
                    
                    await self.webhook.send_alert(
                        "⚠️ Çatışmalı Başvuru",
                        f"Başvuru #{app_id}\nDeepSeek: {deepseek_decision}\nOpus: {opus_decision}\nAdmin kararı bekleniyor"
                    )
            
            # Maliyet hesapla
            cost = self._calculate_cost(ds_input, ds_output, op_input + arb_input, op_output + arb_output)
            self.daily_cost += cost
            
            # Maliyet uyarısı kontrolü
            threshold = Decimal(str(settings.get("cost_alert_threshold", 5.0)))
            if self.daily_cost >= threshold and not self.cost_alert_sent:
                await self.webhook.send_alert(
                    "💰 Maliyet Uyarısı",
                    f"Günlük maliyet eşiği aşıldı: ${self.daily_cost:.2f} (eşik: ${threshold})"
                )
                self.cost_alert_sent = True
            
            # Güven skoru hesapla
            confidence = self._calculate_confidence(deepseek_result, opus_result, arbiter_result)
            
            # İşlem süresini hesapla
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Rapor oluştur
            report = {
                "application_id": app_id,
                "mode": "dry_run" if is_dry_run else mode,
                "deepseek_analysis": deepseek_result,
                "claude_analysis": opus_result,
                "final_decision": final_decision,
                "confidence_score": confidence,
                "processing_time_ms": processing_time
            }
            
            # DRY RUN ise aksiyon alma
            if is_dry_run:
                report["action_taken"] = "dry_run_no_action"
                self.db.update_application_status(app_id, "done")
                # Dry run flag'ını kaldır
                self.db.update_application_dry_run(app_id, False)
            else:
                # Moda göre aksiyon al
                action_taken = await self._take_action(app, final_decision, confidence, mode, settings)
                report["action_taken"] = action_taken
                
                # Çatışma durumunu güncelle
                if conflict_status:
                    self.db.update_application_conflict_status(app_id, conflict_status)
            
            # Raporu kaydet
            self.db.create_ai_report(report)
            
            # AI Değerlendirmesini kaydet (yeni özellik)
            ai_evaluation = {
                "deepseek_analysis": deepseek_result.get("analysis", "") if deepseek_result else "",
                "opus_evaluation": opus_result.get("evaluation", "") if opus_result else "",
                "decision": final_decision,
                "confidence_score": confidence,
                "evaluated_at": datetime.now().isoformat(),
                "arbiter_used": arbiter_result is not None
            }
            self.db.save_ai_evaluation(app_id, ai_evaluation)
            
            # Başvuru durumunu güncelle
            if not is_dry_run:
                self.db.update_application_status(app_id, "done")
                
                # Kilitle - sadece karar verilmişse (onay/red)
                if final_decision in ["approve", "reject"]:
                    self.db.lock_application(app_id, "ai")
            
            # İstatistikleri güncelle
            self.db.update_daily_stats(
                final_decision, 
                confidence, 
                float(cost),
                has_conflict=(conflict_status is not None)
            )
            
            logger.info(f"Başvuru #{app_id} tamamlandı: {final_decision} (güven: %{confidence})")
            
        except Exception as e:
            logger.error(f"Başvuru #{app_id} işlenirken hata: {e}")
            await self.webhook.send_alert("🔴 İşlem Hatası", f"Başvuru #{app_id}: {str(e)[:200]}")
            self.db.update_application_status(app_id, "error")
            self.db.create_ai_report({
                "application_id": app_id,
                "mode": mode or "unknown",
                "action_taken": "error",
                "error_log": str(e)
            })
    
    def _calculate_cost(self, ds_input: int, ds_output: int, opus_input: int, opus_output: int) -> Decimal:
        """Token kullanımından maliyet hesapla"""
        cost = Decimal("0")
        cost += (Decimal(ds_input) / 1000000) * COST_PER_1M_TOKENS["deepseek_input"]
        cost += (Decimal(ds_output) / 1000000) * COST_PER_1M_TOKENS["deepseek_output"]
        cost += (Decimal(opus_input) / 1000000) * COST_PER_1M_TOKENS["opus_input"]
        cost += (Decimal(opus_output) / 1000000) * COST_PER_1M_TOKENS["opus_output"]
        return cost
    
    def _calculate_confidence(self, deepseek: dict, opus: dict, arbiter: dict = None) -> int:
        """Güven skorunu hesapla"""
        scores = []
        
        if deepseek:
            scores.append(deepseek.get("overall_score", 50))
        if opus:
            scores.append(opus.get("confidence", 50))
        if arbiter:
            scores.append(arbiter.get("confidence", 50))
        
        if not scores:
            return 50
        
        return int(sum(scores) / len(scores))
    
    async def _take_action(self, app: dict, decision: str, confidence: int, mode: str, settings: dict) -> str:
        """Karara göre aksiyon al"""
        threshold = settings.get("confidence_threshold", 85)
        auto_approve = settings.get("auto_approve", True)
        auto_reject = settings.get("auto_reject", False)
        
        # Readonly modda sadece raporla
        if mode == "readonly":
            return "no_action"
        
        # Hibrit modda manuel gönderilmemişse sadece raporla
        if mode == "hybrid" and not app.get("ai_manual_send"):
            return "no_action"
        
        # Güven eşiğinin altındaysa admin'e bırak
        if confidence < threshold:
            return "forwarded_to_admin"
        
        app_id = app["id"]
        discord_id = app.get("profiles", {}).get("discord_id")
        
        # ONAY
        if decision == "approved" and auto_approve:
            self.db.approve_application(app_id, "AI tarafından otomatik onaylandı")
            
            # Discord rol ver
            if discord_id:
                success = await self.discord.grant_whitelist_role(discord_id)
                if success:
                    await self.webhook.send_log(
                        "✅ Otomatik Onay",
                        f"Başvuru #{app_id} onaylandı ve Discord rolü verildi"
                    )
            
            return "approved"
        
        # RED
        elif decision == "rejected" and auto_reject:
            self.db.reject_application(app_id, "AI tarafından reddedildi")
            await self.webhook.send_log(
                "❌ Otomatik Red",
                f"Başvuru #{app_id} reddedildi (güven: %{confidence})"
            )
            return "rejected"
        
        # REVİZYON
        elif decision == "revision":
            self.db.request_revision(app_id, [], {"general": "AI tarafından revizyon istendi"})
            return "revision_sent"
        
        # MÜLAKAT veya diğer
        else:
            return "forwarded_to_admin"


async def main():
    """Ana giriş noktası"""
    daemon = KazeAIDaemon()
    await daemon.start()


if __name__ == "__main__":
    asyncio.run(main())
