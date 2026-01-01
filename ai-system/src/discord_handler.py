"""
Kaze AI System - Discord Handler
Discord bot işlemleri ve webhook bildirimleri
"""

import os
import discord
import asyncio
import httpx
from loguru import logger
from typing import Optional
from datetime import datetime

class DiscordHandler:
    """Discord bot ve webhook yöneticisi"""
    
    def __init__(self):
        self.bot_token = os.getenv("DISCORD_BOT_TOKEN")
        self.server_id = int(os.getenv("DISCORD_SERVER_ID", "0"))
        self.role_id = int(os.getenv("DISCORD_ROLE_ID", "0"))
        self.delay_ms = int(os.getenv("DISCORD_DELAY_MS", "2000"))
        
        self.intents = discord.Intents.default()
        self.intents.members = True
        self.intents.guilds = True
        
        self.client: Optional[discord.Client] = None
        self._ready = asyncio.Event()
        
        logger.info("Discord handler başlatıldı")
    
    async def start(self):
        """Bot'u başlat"""
        if not self.bot_token:
            logger.warning("Discord bot token bulunamadı, bot başlatılmadı")
            return
        
        self.client = discord.Client(intents=self.intents)
        
        @self.client.event
        async def on_ready():
            logger.info(f"Discord bot giriş yaptı: {self.client.user}")
            self._ready.set()
        
        # Bot'u arka planda başlat
        asyncio.create_task(self.client.start(self.bot_token))
        
        # Hazır olmasını bekle (max 30 saniye)
        try:
            await asyncio.wait_for(self._ready.wait(), timeout=30.0)
        except asyncio.TimeoutError:
            logger.error("Discord bot bağlantı zaman aşımı")
    
    async def stop(self):
        """Bot'u durdur"""
        if self.client:
            await self.client.close()
            logger.info("Discord bot kapatıldı")
    
    async def grant_whitelist_role(self, discord_id: str) -> bool:
        """Kullanıcıya whitelist rolü ver"""
        if not self.client or not self._ready.is_set():
            logger.error("Discord bot hazır değil")
            return False
        
        try:
            # Rate limit için delay
            await asyncio.sleep(self.delay_ms / 1000)
            
            guild = self.client.get_guild(self.server_id)
            if not guild:
                logger.error(f"Sunucu bulunamadı: {self.server_id}")
                return False
            
            # Discord ID'yi temizle (sadece rakamlar)
            clean_id = ''.join(filter(str.isdigit, str(discord_id)))
            if not clean_id:
                logger.error(f"Geçersiz Discord ID: {discord_id}")
                return False
            
            member = await guild.fetch_member(int(clean_id))
            if not member:
                logger.error(f"Üye bulunamadı: {clean_id}")
                return False
            
            role = guild.get_role(self.role_id)
            if not role:
                logger.error(f"Rol bulunamadı: {self.role_id}")
                return False
            
            await member.add_roles(role, reason="AI Whitelist Onayı")
            logger.info(f"Rol verildi: {member.display_name} -> {role.name}")
            return True
            
        except discord.NotFound:
            logger.error(f"Üye sunucuda bulunamadı: {discord_id}")
            return False
        except discord.Forbidden:
            logger.error("Bot'un rol verme yetkisi yok")
            return False
        except Exception as e:
            logger.error(f"Rol verme hatası: {e}")
            return False
    
    async def send_dm(self, discord_id: str, message: str) -> bool:
        """Kullanıcıya DM gönder"""
        if not self.client or not self._ready.is_set():
            return False
        
        try:
            await asyncio.sleep(self.delay_ms / 1000)
            
            clean_id = ''.join(filter(str.isdigit, str(discord_id)))
            user = await self.client.fetch_user(int(clean_id))
            
            await user.send(message)
            logger.info(f"DM gönderildi: {user.display_name}")
            return True
            
        except discord.Forbidden:
            logger.warning(f"DM gönderilemedi (kapalı): {discord_id}")
            return False
        except Exception as e:
            logger.error(f"DM hatası: {e}")
            return False


class WebhookHandler:
    """Discord webhook bildirimleri"""
    
    def __init__(self):
        self.log_webhook = os.getenv("DISCORD_LOG_WEBHOOK")
        self.alert_webhook = os.getenv("DISCORD_ALERT_WEBHOOK")
        self.delay_ms = int(os.getenv("DISCORD_DELAY_MS", "2000"))
    
    async def send_log(self, title: str, description: str, color: int = 0x00FF00) -> bool:
        """Log kanalına bildirim gönder"""
        if not self.log_webhook:
            return False
        
        return await self._send_embed(self.log_webhook, title, description, color)
    
    async def send_alert(self, title: str, description: str) -> bool:
        """Alert kanalına bildirim gönder"""
        if not self.alert_webhook:
            return False
        
        return await self._send_embed(self.alert_webhook, title, description, 0xFF0000)
    
    async def _send_embed(self, webhook_url: str, title: str, description: str, color: int) -> bool:
        """Embed mesaj gönder"""
        try:
            await asyncio.sleep(self.delay_ms / 1000)
            
            embed = {
                "title": title,
                "description": description,
                "color": color,
                "timestamp": datetime.utcnow().isoformat(),
                "footer": {"text": "Kaze AI System"}
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook_url,
                    json={"embeds": [embed]}
                )
                response.raise_for_status()
            
            return True
            
        except Exception as e:
            logger.error(f"Webhook hatası: {e}")
            return False
    
    async def send_daily_report(self, stats: dict) -> bool:
        """Günlük özet raporu gönder"""
        if not self.log_webhook:
            return False
        
        description = f"""📊 **Günlük AI Raporu**

✅ Onaylanan: {stats.get('approved', 0)}
❌ Reddedilen: {stats.get('rejected', 0)}
🔄 Revizyon: {stats.get('revision', 0)}
🎤 Mülakat: {stats.get('interview', 0)}

📈 Ortalama Güven: %{stats.get('avg_confidence', 0):.1f}
⚖️ AI-Staff Uyumu: %{stats.get('match_rate', 0):.1f}
"""
        
        return await self._send_embed(
            self.log_webhook,
            f"📅 Günlük Rapor - {datetime.now().strftime('%d/%m/%Y')}",
            description,
            0x3498DB
        )
