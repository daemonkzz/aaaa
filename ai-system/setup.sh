#!/bin/bash
set -e

echo "🚀 Kaze AI Kurulumu Başlıyor..."

# 1. Klasöre git
cd /var/www/kaze40/ai-system

# 2. Eski venv varsa sil (temiz başlangıç)
if [ -d ".venv" ]; then
    echo "🗑️  Eski sanal ortam temizleniyor..."
    rm -rf .venv
fi

# 3. Yeni venv oluştur
echo "📦 Yeni sanal ortam (venv) oluşturuluyor..."
python3 -m venv .venv

# 4. Paketleri kur
echo "⬇️  Paketler kuruluyor..."
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install -r requirements.txt

# 5. Servisi güncelle
echo "⚙️  Servis güncelleniyor..."
cp kaze-ai.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable kaze-ai
systemctl restart kaze-ai

echo "✅ Kurulum Tamamlandı! Servis durumu:"
systemctl status kaze-ai --no-pager
