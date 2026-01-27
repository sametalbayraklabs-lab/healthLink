-- Add sample appointments for client (ClientId: 5)
-- ServiceType enum: 1=NutritionSession, 2=TherapySession, 3=TrainingSession

-- Insert upcoming appointment (3 days from now)
INSERT INTO "Appointments" (
    "ClientId",
    "ExpertId",
    "ServiceType",
    "StartDateTime",
    "EndDateTime",
    "Status",
    "CreatedAt",
    "UpdatedAt"
)
SELECT 
    5 as "ClientId",
    "Id" as "ExpertId",
    1 as "ServiceType",  -- NutritionSession
    (CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00') as "StartDateTime",
    (CURRENT_DATE + INTERVAL '3 days' + TIME '15:00:00') as "EndDateTime",
    'Scheduled' as "Status",
    NOW() as "CreatedAt",
    NOW() as "UpdatedAt"
FROM "Experts"
LIMIT 1;

-- Insert past completed appointment
INSERT INTO "Appointments" (
    "ClientId",
    "ExpertId",
    "ServiceType",
    "StartDateTime",
    "EndDateTime",
    "Status",
    "CreatedAt",
    "UpdatedAt"
)
SELECT 
    5 as "ClientId",
    "Id" as "ExpertId",
    2 as "ServiceType",  -- TherapySession
    (CURRENT_DATE - INTERVAL '1 week' + TIME '10:00:00') as "StartDateTime",
    (CURRENT_DATE - INTERVAL '1 week' + TIME '11:00:00') as "EndDateTime",
    'Completed' as "Status",
    NOW() as "CreatedAt",
    NOW() as "UpdatedAt"
FROM "Experts"
LIMIT 1;

-- Insert another upcoming appointment
INSERT INTO "Appointments" (
    "ClientId",
    "ExpertId",
    "ServiceType",
    "StartDateTime",
    "EndDateTime",
    "Status",
    "CreatedAt",
    "UpdatedAt"
)
SELECT 
    5 as "ClientId",
    "Id" as "ExpertId",
    3 as "ServiceType",  -- TrainingSession
    (CURRENT_DATE + INTERVAL '1 week' + TIME '15:30:00') as "StartDateTime",
    (CURRENT_DATE + INTERVAL '1 week' + TIME '16:30:00') as "EndDateTime",
    'Scheduled' as "Status",
    NOW() as "CreatedAt",
    NOW() as "UpdatedAt"
FROM "Experts"
LIMIT 1;

-- Verify
SELECT "Id", "ClientId", "ExpertId", "ServiceType", "StartDateTime", "EndDateTime", "Status"
FROM "Appointments"
WHERE "ClientId" = 5
ORDER BY "StartDateTime" DESC;
