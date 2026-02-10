# PostgreSQL Başlatma Rehberi

## Bağlantı Bilgileri

| Alan                 | Değer          |
|----------------------|----------------|
| **Host**             | `localhost`    |
| **Port**             | `5432`         |
| **Username**         | `postgres`     |
| **Password**         | `300988temAS`  |
| **Database**         | `healthlink`   |
| **Maintenance DB**   | `postgres`     |

## PostgreSQL Servisi Başlatma

PostgreSQL servisi kapandıysa (bağlantı timeout hatası alıyorsanız):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" start
```

## Servis Durumu Kontrol

Port 5432'nin dinlenip dinlenmediğini kontrol edin:

```powershell
netstat -an | findstr "5432"
```

## Servisi Durdurma

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" stop
```

## Database Sıfırlama (Gerekirse)

Database'i silip sıfırdan oluşturmak için:

```powershell
cd c:\Workspaces\Healthlink\healthLink\HealthLink.Api\HealthLink.Api
$env:PATH += ";C:\Users\samet\.dotnet\tools"
dotnet-ef database drop --force
dotnet-ef database update
dotnet run
```

> **Not:** `dotnet run` çalıştığında SeedData otomatik olarak çalışır ve test kullanıcılarını oluşturur.

## Test Kullanıcıları (Seed Data)

Tüm şifreler: `123`

| Rol          | Email                          | Ad             |
|--------------|--------------------------------|----------------|
| Admin        | admin@healthlink.com           | Admin User     |
| Diyetisyen   | diyetisyen1@healthlink.com     | Ayşe Yılmaz    |
| Diyetisyen   | diyetisyen2@healthlink.com     | Mehmet Kaya    |
| Psikolog     | psikolog1@healthlink.com       | Zeynep Demir   |
| Psikolog     | psikolog2@healthlink.com       | Can Özkan      |
| Spor Koçu    | sporkocu1@healthlink.com       | Emre Şahin     |
| Spor Koçu    | sporkocu2@healthlink.com       | Selin Arslan   |
| Client       | client1@healthlink.com         | Ali Yıldız     |
| Client       | client2@healthlink.com         | Elif Çelik     |

## pgAdmin Bağlantı Kurulumu

1. pgAdmin'i açın
2. **Add New Server** tıklayın
3. **General** sekmesi: İsim olarak `HealthLink` yazın
4. **Connection** sekmesi:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: `300988temAS`
5. **Save** tıklayın
