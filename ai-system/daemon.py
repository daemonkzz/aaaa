"""
Kaze AI System - Ana Daemon
30 dakikada bir çalışan, başvuruları işleyen ana servis
"""

import os
import sys
import asyncio
import signal
from datetime import datetime, time
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


class KazeAIDaemon:
    """Ana AI işleme daemon'ı"""
    
    def __init__(self):
        self.running = False
        self.db = DatabaseHandler()
        self.deepseek = DeepSeekClient()
        self.claude = ClaudeClient()
        self.discord = DiscordHandler()
        self.webhook = WebhookHandler()
        
        # Prompt'ları yükle
        self.prompts = self._load_prompts()
        
        logger.info("Kaze AI Daemon başlatıldı")
    
    def _load_prompts(self) -> dict:
        """System prompt'larını yükle"""
        prompts = {}
        prompt_dir = "config/prompts"
        
        files = {
            "deepseek": "deepseek_system.txt",
            "sonnet": "claude_sonnet_system.txt",
            "opus": "claude_opus_system.txt"
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
    
    async def start(self):
        """Daemon'ı başlat"""
        self.running = True
        
        # Discord bot'u başlat
        await self.discord.start()
        
        # Graceful shutdown için signal handler
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
        check_interval = int(os.getenv("CHECK_INTERVAL_MINUTES", "30")) * 60
        restart_hour = int(os.getenv("DAILY_RESTART_HOUR", "4"))
        
        while self.running:
            try:
                # Günlük restart kontrolü
                now = datetime.now()
                if now.hour == restart_hour and now.minute < 5:
                    logger.info("Günlük restart zamanı, yeniden başlatılıyor...")
                    await self.stop()
                    return
                
                # Öncelikli başvuruları kontrol et
                priority_apps = self.db.get_priority_applications()
                if priority_apps:
                    logger.info(f"{len(priority_apps)} öncelikli başvuru bulundu")
                    for app in priority_apps:
                        await self._process_application(app)
                
                # Normal başvuruları işle
                await self._process_batch()
                
                # Interval kadar bekle
                logger.info(f"Sonraki kontrol: {check_interval // 60} dakika sonra")
                await asyncio.sleep(check_interval)
                
            except Exception as e:
                logger.error(f"Ana döngü hatası: {e}")
                await asyncio.sleep(60)  # Hata durumunda 1 dakika bekle
    
    async def _process_batch(self):
        """Batch işleme"""
        settings = self.db.get_ai_settings()
        
        if not settings or not settings.get("is_enabled"):
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
            await self._process_application(app, mode, settings)
    
    async def _process_application(self, app: dict, mode: str = None, settings: dict = None):
        """Tek başvuruyu işle"""
        app_id = app["id"]
        start_time = datetime.now()
        
        try:
            # Ayarları al (eğer verilmediyse)
            if not settings:
                settings = self.db.get_ai_settings()
            if not mode:
                mode = settings.get("mode", "readonly")
            
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
            
            # 2. AŞAMA: Claude Sonnet (RP soruları)
            # TODO: Form template'den ai_skip olmayan soruları filtrele
            rp_questions = content  # Şimdilik tüm içerik
            
            sonnet_result, sn_input, sn_output = await self.claude.evaluate_rp_content(
                rp_questions,
                deepseek_result,
                self.prompts.get("sonnet", "")
            )
            
            sonnet_decision = sonnet_result.get("recommendation", "interview") if sonnet_result else deepseek_decision
            logger.info(f"Sonnet kararı: {sonnet_decision}")
            
            # 3. AŞAMA: Uyuşmazlık kontrolü
            final_decision = deepseek_decision
            opus_result = None
            op_input, op_output = 0, 0
            
            if deepseek_decision != sonnet_decision:
                logger.info("Uyuşmazlık tespit edildi, Opus hakemliği başlatılıyor...")
                
                opus_result, op_input, op_output = await self.claude.arbitrate(
                    content,
                    deepseek_decision,
                    sonnet_decision,
                    deepseek_result,
                    sonnet_result,
                    self.prompts.get("opus", "")
                )
                
                if opus_result:
                    final_decision = opus_result.get("final_decision", "interview")
                    logger.info(f"Opus final kararı: {final_decision}")
            
            # Güven skoru hesapla
            confidence = self._calculate_confidence(deepseek_result, sonnet_result, opus_result)
            
            # İşlem süresini hesapla
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Rapor oluştur
            report = {
                "application_id": app_id,
                "mode": mode,
                "deepseek_analysis": deepseek_result,
                "claude_analysis": sonnet_result,
                "final_decision": final_decision,
                "confidence_score": confidence,
                "processing_time_ms": processing_time
            }
            
            # Moda göre aksiyon al
            action_taken = await self._take_action(app, final_decision, confidence, mode, settings)
            report["action_taken"] = action_taken
            
            # Raporu kaydet
            self.db.create_ai_report(report)
            
            # Başvuru durumunu güncelle
            self.db.update_application_status(app_id, "done")
            
            logger.info(f"Başvuru #{app_id} tamamlandı: {final_decision} (güven: %{confidence})")
            
        except Exception as e:
            logger.error(f"Başvuru #{app_id} işlenirken hata: {e}")
            self.db.update_application_status(app_id, "error")
            self.db.create_ai_report({
                "application_id": app_id,
                "mode": mode or "unknown",
                "action_taken": "error",
                "error_log": str(e)
            })
    
    def _calculate_confidence(self, deepseek: dict, sonnet: dict, opus: dict = None) -> int:
        """Güven skorunu hesapla"""
        scores = []
        
        if deepseek:
            scores.append(deepseek.get("overall_score", 50))
        if sonnet:
            scores.append(sonnet.get("confidence", 50))
        if opus:
            scores.append(opus.get("confidence", 50))
        
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
            # TODO: Revizyon alanlarını belirle
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
