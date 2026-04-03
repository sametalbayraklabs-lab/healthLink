#!/bin/bash
# Description: HealthLink PostgreSQL S3/Cloudflare R2 Backup Script
# Usage: Run daily via Linux crontab (e.g., 0 3 * * * /opt/healthlink/scripts/backup-db.sh)

# Ayarlar (Sunucu içerisinde export edilecek veya buraya yazılacak)
DB_CONTAINER_NAME="healthlink_db"
DB_USER="postgres"
DB_NAME="healthlink"

S3_BUCKET="s3://healthlink-backups/db"
BACKUP_DIR="/tmp/healthlink_backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILE_NAME="healthlink_backup_$DATE.sql.gz"

# Gecici klasörü oluştur
mkdir -p "$BACKUP_DIR"

echo "[$DATE] Veritabanı yedeği alınıyor..."
# Docker containeri üzerinden pg_dump komutunu çalıştır ve gzip ile sıkıştır
docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/$FILE_NAME"

if [ $? -eq 0 ]; then
  echo "[$DATE] Yedek başarıyla alındı: $FILE_NAME"
  
  # AWS CLI kullanılarak S3/R2 yapısına aktarma
  echo "[$DATE] S3 'e yükleniyor..."
  aws s3 cp "$BACKUP_DIR/$FILE_NAME" "$S3_BUCKET/$FILE_NAME" --endpoint-url "$S3_ENDPOINT"
  
  if [ $? -eq 0 ]; then
    echo "[$DATE] Yükleme başarılı!"
    # Yereldeki yedeği temizle
    rm -f "$BACKUP_DIR/$FILE_NAME"
  else
    echo "[$DATE] S3 yükleme hatası!"
  fi
else
  echo "[$DATE] pg_dump hatası, yedek alınamadı!"
fi
