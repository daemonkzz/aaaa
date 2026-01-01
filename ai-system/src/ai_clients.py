"""
Kaze AI System - AI Clients
DeepSeek R1 ve Claude API istemcileri
"""

import os
import httpx
import anthropic
from loguru import logger
from typing import Dict, Any, Optional, Tuple
import json

class DeepSeekClient:
    """Bytedance ModelArk üzerinden DeepSeek R1 istemcisi"""
    
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.endpoint = os.getenv("DEEPSEEK_ENDPOINT")
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-r1-250528")
        
        if not self.api_key or not self.endpoint:
            raise ValueError("DEEPSEEK_API_KEY ve DEEPSEEK_ENDPOINT gerekli!")
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        logger.info(f"DeepSeek istemcisi hazır: {self.model}")
    
    async def analyze_application(
        self, 
        application_content: Dict[str, str],
        system_prompt: str,
        blacklist_words: list = None
    ) -> Tuple[Optional[Dict[str, Any]], int, int]:
        """
        Başvuruyu analiz et
        Returns: (analiz_sonucu, input_tokens, output_tokens)
        """
        try:
            # Başvuru içeriğini formatlı metin haline getir
            content_text = "\n".join([
                f"**{key}**: {value}" 
                for key, value in application_content.items()
            ])
            
            # Kara liste kontrolü
            blacklist_matches = []
            if blacklist_words:
                content_lower = content_text.lower()
                blacklist_matches = [
                    word for word in blacklist_words 
                    if word.lower() in content_lower
                ]
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Aşağıdaki whitelist başvurusunu değerlendir:\n\n{content_text}"}
            ]
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    self.endpoint,
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.3,
                        "max_tokens": 2000
                    }
                )
                response.raise_for_status()
                data = response.json()
            
            # Token kullanımı
            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)
            
            # Yanıtı parse et
            content = data["choices"][0]["message"]["content"]
            analysis = self._parse_response(content)
            
            # Kara liste eşleşmelerini ekle
            if analysis:
                analysis["blacklist_matches"] = blacklist_matches
            
            return analysis, input_tokens, output_tokens
            
        except Exception as e:
            logger.error(f"DeepSeek analiz hatası: {e}")
            return None, 0, 0
    
    def _parse_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Yanıtı JSON olarak parse et"""
        try:
            # JSON bloğunu bul
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                json_str = content[start:end].strip()
            elif "{" in content:
                start = content.find("{")
                end = content.rfind("}") + 1
                json_str = content[start:end]
            else:
                return None
            
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse hatası: {e}")
            return None


class ClaudeClient:
    """Anthropic Claude istemcisi"""
    
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY gerekli!")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        logger.info("Claude istemcisi hazır")
    
    async def evaluate_rp_content(
        self,
        rp_questions: Dict[str, str],
        deepseek_analysis: Dict[str, Any],
        system_prompt: str,
        model: str = "claude-sonnet-4-20250514"
    ) -> Tuple[Optional[Dict[str, Any]], int, int]:
        """
        RP içeriğini değerlendir (Sonnet)
        Returns: (değerlendirme, input_tokens, output_tokens)
        """
        try:
            content_text = "\n".join([
                f"**{key}**: {value}" 
                for key, value in rp_questions.items()
            ])
            
            user_message = f"""DeepSeek R1'in ön analizi:
{json.dumps(deepseek_analysis, ensure_ascii=False, indent=2)}

Değerlendirilecek RP soruları:
{content_text}

Lütfen bu RP içeriğini değerlendir ve JSON formatında yanıt ver."""

            response = self.client.messages.create(
                model=model,
                max_tokens=1500,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )
            
            # Token kullanımı
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            
            # Yanıtı parse et
            content = response.content[0].text
            evaluation = self._parse_response(content)
            
            return evaluation, input_tokens, output_tokens
            
        except Exception as e:
            logger.error(f"Claude Sonnet hatası: {e}")
            return None, 0, 0
    
    async def arbitrate(
        self,
        application_content: Dict[str, str],
        deepseek_decision: str,
        sonnet_decision: str,
        deepseek_analysis: Dict[str, Any],
        sonnet_analysis: Dict[str, Any],
        system_prompt: str
    ) -> Tuple[Optional[Dict[str, Any]], int, int]:
        """
        Uyuşmazlık durumunda hakemlik yap (Opus)
        Returns: (karar, input_tokens, output_tokens)
        """
        try:
            content_text = "\n".join([
                f"**{key}**: {value}" 
                for key, value in application_content.items()
            ])
            
            user_message = f"""İki AI arasında uyuşmazlık var. Hakem olarak karar ver.

BAŞVURU İÇERİĞİ:
{content_text}

DEEPSEEK R1 KARARI: {deepseek_decision}
DEEPSEEK ANALİZİ:
{json.dumps(deepseek_analysis, ensure_ascii=False, indent=2)}

CLAUDE SONNET KARARI: {sonnet_decision}
SONNET ANALİZİ:
{json.dumps(sonnet_analysis, ensure_ascii=False, indent=2)}

Final kararını ver ve gerekçele."""

            response = self.client.messages.create(
                model="claude-opus-4-20250514",
                max_tokens=2000,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )
            
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            
            content = response.content[0].text
            decision = self._parse_response(content)
            
            return decision, input_tokens, output_tokens
            
        except Exception as e:
            logger.error(f"Claude Opus hakemlik hatası: {e}")
            return None, 0, 0
    
    def _parse_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Yanıtı JSON olarak parse et"""
        try:
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                json_str = content[start:end].strip()
            elif "{" in content:
                start = content.find("{")
                end = content.rfind("}") + 1
                json_str = content[start:end]
            else:
                return None
            
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse hatası: {e}")
            return None
