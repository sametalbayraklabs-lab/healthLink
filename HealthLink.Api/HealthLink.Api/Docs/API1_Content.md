1. Genel API Notlar?
* Base URL (�rnek): https://api.saglikburada.com/api/v1
* Format: application/json
* Auth:
o POST /auth/login ? JWT access token
o Sonraki t�m isteklerde: Authorization: Bearer {token}
* HTTP durum kodlar?:
o 200 OK
o 201 Created
o 400 Bad Request
o 401 Unauthorized
o 403 Forbidden
o 404 Not Found
o 422 Validation Error
o 500 Internal Server Error
Hata response (ortak �rnek):
{
  "errorCode": "VALIDATION_ERROR",
  "message": "One or more validation errors occurred.",
  "details": {
    "Email": ["Email is required."]
  }
}

2. Auth & User API
2.1 POST /auth/register-client
Ama�:
Yeni bir dan??an hesab? olu?turur. Ayn? ak??ta:
* User kayd?
* Client kayd?
a�?l?r.
Request (Body):
{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "firstName": "Ahmet",
  "lastName": "Y?lmaz",
  "phone": "+905001112233",
  "birthYear": 1990,
  "gender": "Male"
}
Response (201 Created):
{
  "userId": 123,
  "clientId": 45,
  "email": "user@example.com"
}
Temel kurallar:
* Email benzersiz olmal?.
* Zaten kay?tl? email ise ? 400 + EMAIL_ALREADY_EXISTS.
* Password complexity FDD�deki kurallara uygun olmal?.

2.2 POST /auth/register-expert
Ama�:
Yeni bir uzman (Expert) ba?vurusu olu?turur. Ayn? ak??ta:
* User kayd?
* Expert kayd? (Status = Pending)
a�?l?r.
Request (Body):
{
  "email": "dietitian@example.com",
  "password": "P@ssw0rd!",
  "displayName": "Dyt. Ay?e Kaya",
  "phone": "+905001112244",
  "expertType": "Dietitian",
  "city": "Istanbul",
  "workType": "Online",
  "experienceYear": 5
}
Response (201 Created):
{
  "userId": 200,
  "expertId": 70,
  "status": "Pending"
}
Kurallar:
* Ayn? email ile ikinci expert ba?vurusu yap?lamaz.
* E?er email bir Client ile ili?kilendiyse:
o 400 + EMAIL_ALREADY_USED_AS_CLIENT.

2.3 POST /auth/login
Ama�:
Email & ?ifre ile giri? yapar, JWT access token �retir.
Request:
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
Response (200 OK):
{
  "accessToken": "jwt-token-here",
  "expiresIn": 3600,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "roles": ["Client"],    // "Expert", "Admin" vs.
    "clientId": 45,
    "expertId": null
  }
}
Hatalar:
* Yanl?? email veya ?ifre ? 401 + INVALID_CREDENTIALS.
* Pasif kullan?c? ? 403 + USER_INACTIVE.

2.4 GET /users/me
Ama�:
Giri? yapm?? kullan?c?n?n temel user profilini d�ner.
Auth:
Authorization: Bearer {token}
Response:
{
  "id": 123,
  "email": "user@example.com",
  "phone": "+905001112233",
  "roles": ["Client"],
  "clientId": 45,
  "expertId": null,
  "isActive": true
}

2.5 PUT /users/me
Ama�:
Kullan?c?n?n kendi User profilindeki temel alanlar? g�nceller (email hari�).
Request:
{
  "phone": "+905009998877"
}
Response (200 OK):
{
  "id": 123,
  "email": "user@example.com",
  "phone": "+905009998877",
  "isActive": true
}

2.6 POST /auth/change-password
Ama�:
Kullan?c?n?n kendi ?ifresini de?i?tirmesi.
Request:
{
  "currentPassword": "OldP@ssw0rd",
  "newPassword": "NewP@ssw0rd!"
}
Response (200 OK):
{
  "success": true
}
Hatalar:
* Eski ?ifre yanl??sa ? 400 + INVALID_CURRENT_PASSWORD.

3. Client API (Dan??an)
3.1 GET /clients/me
Ama�:
Giri? yapm?? kullan?c?n?n Client detay kayd?n? d�ner.
Response (200 OK):
{
  "id": 45,
  "userId": 123,
  "firstName": "Ahmet",
  "lastName": "Y?lmaz",
  "birthYear": 1990,
  "gender": "Male",
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-10T15:30:00Z"
}

3.2 PUT /clients/me
Ama�:
Dan??an?n kendi profil bilgilerini g�ncellemesi.
Request:
{
  "firstName": "Ahmet",
  "lastName": "Y?lmaz",
  "birthYear": 1991,
  "gender": "Male"
}
Response (200 OK):
{
  "id": 45,
  "userId": 123,
  "firstName": "Ahmet",
  "lastName": "Y?lmaz",
  "birthYear": 1991,
  "gender": "Male",
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-15T09:20:00Z"
}

3.3 GET /clients/{id} (Admin)
Ama�:
Admin�in belirli bir Client kayd?n? g�r�nt�lemesi.
Yetki:
Admin rol� gerektirir.
Response (�rnek):
{
  "id": 45,
  "userId": 123,
  "firstName": "Ahmet",
  "lastName": "Y?lmaz",
  "birthYear": 1990,
  "gender": "Male",
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-10T15:30:00Z"
}

4. Expert API (Uzman / Diyetisyen)
4.1 GET /experts/me
Ama�:
Expert rol�ne sahip kullan?c?n?n kendi uzman profilini d�ner.
Response:
{
  "id": 70,
  "userId": 200,
  "expertType": "Dietitian",
  "displayName": "Dyt. Ay?e Kaya",
  "bio": "Klinik diyetisyen...",
  "city": "Istanbul",
  "workType": "Online",
  "experienceYear": 5,
  "status": "Pending",
  "averageRating": 4.8,
  "totalReviewCount": 120,
  "createdAt": "2025-01-02T11:00:00Z",
  "updatedAt": "2025-01-05T14:00:00Z"
}

4.2 PUT /experts/me
Ama�:
Expert�in kendi profilini g�ncellemesi (bio, city, workType, experienceYear vb.).
Request:
{
  "displayName": "Dyt. Ay?e Kaya",
  "bio": "Online ve y�z y�ze klinik diyetisyen...",
  "city": "Istanbul",
  "workType": "Hybrid",
  "experienceYear": 6
}
Response (200 OK): G�ncellenmi? ayn? model.

4.3 GET /experts/{id}
Ama�:
Client taraf?nda uzman profil sayfas?n? g�stermek i�in kullan?l?r.
* Public (login yok): s?n?rl? alanlar
* Login olmu? client: daha detayl?
Response (�rnek � login olmu? client i�in):
{
  "id": 70,
  "expertType": "Dietitian",
  "displayName": "Dyt. Ay?e Kaya",
  "bio": "K?saca tan?t?m...",
  "city": "Istanbul",
  "workType": "Online",
  "experienceYear": 5,
  "averageRating": 4.8,
  "totalReviewCount": 120,
  "specializations": [
    { "id": 1, "name": "Kilo Verme" },
    { "id": 2, "name": "Sporcu Beslenmesi" }
  ]
}

4.4 GET /experts
Ama�:
�Diyetisyenler / Uzmanlar� listeleme ekran? i�in kullan?l?r.
Query parametre �rnekleri:
* expertType=Dietitian
* city=Istanbul
* specializationId=1
* sort=rating-desc (rating-desc, price-asc, experience-desc gibi)
* page=1&pageSize=20
Response:
{
  "items": [
    {
      "id": 70,
      "expertType": "Dietitian",
      "displayName": "Dyt. Ay?e Kaya",
      "city": "Istanbul",
      "workType": "Online",
      "averageRating": 4.8,
      "totalReviewCount": 120,
      "specializations": ["Kilo Verme", "Sporcu Beslenmesi"]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 87
}
Kurallar:
* Sadece Status = Approved olan expert�ler listelenir.
* Pending, Rejected, Passive olanlar listede g�r�nmez.

4.5 PUT /experts/me/specializations
Ama�:
Expert�in kendi uzmanl?k alanlar?n? set etmesi (tam liste olarak).
Request:
{
  "specializationIds": [1, 2, 5]
}
Response:
{
  "expertId": 70,
  "specializationIds": [1, 2, 5]
}

4.6 POST /experts/{id}/approve (Admin)
Ama�:
Admin�in bir uzman ba?vurusunu onaylamas?.
Request:
{
  "adminNote": "Diploma ve oda kayd? do?ruland?."
}
Response:
{
  "id": 70,
  "status": "Approved"
}

4.7 POST /experts/{id}/reject (Admin)
Ama�:
Uzman ba?vurusunun reddedilmesi.
Request:
{
  "adminNote": "Belge eksikli?i nedeniyle reddedildi."
}
Response:
{
  "id": 70,
  "status": "Rejected"
}

5. Specialization API
5.1 GET /specializations
Ama�:
Onboarding ekran? ve filtreler i�in uzmanl?k listesi.
Query parametreleri (opsiyonel):
* expertType=Dietitian
Response:
[
  {
    "id": 1,
    "name": "Kilo Verme",
    "expertType": "Dietitian",
    "category": "Nutrition"
  },
  {
    "id": 2,
    "name": "Sporcu Beslenmesi",
    "expertType": "Dietitian",
    "category": "Nutrition"
  }
]
