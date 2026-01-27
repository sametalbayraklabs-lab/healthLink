-- Add sample client package for client (ClientId: 5)

-- First, check if there are any packages in the Packages table
-- If not, we need to create one first

-- Insert a package if it doesn't exist
INSERT INTO "Packages" (
    "ExpertId",
    "Name",
    "Description",
    "SessionCount",
    "Price",
    "DurationDays",
    "IsActive",
    "CreatedAt",
    "UpdatedAt"
)
SELECT 
    "Id" as "ExpertId",
    'Beslenme Danışmanlığı Paketi' as "Name",
    '8 haftalık kişiselleştirilmiş beslenme programı' as "Description",
    8 as "SessionCount",
    1500.00 as "Price",
    56 as "DurationDays",
    true as "IsActive",
    NOW() as "CreatedAt",
    NOW() as "UpdatedAt"
FROM "Experts"
LIMIT 1
ON CONFLICT DO NOTHING;

-- Now create a ClientPackage
INSERT INTO "ClientPackages" (
    "ClientId",
    "PackageId",
    "PurchaseDate",
    "StartDate",
    "EndDate",
    "RemainingSessionCount",
    "Status",
    "CreatedAt",
    "UpdatedAt"
)
SELECT 
    5 as "ClientId",
    p."Id" as "PackageId",
    (CURRENT_DATE - INTERVAL '2 weeks') as "PurchaseDate",
    (CURRENT_DATE - INTERVAL '2 weeks') as "StartDate",
    (CURRENT_DATE + INTERVAL '6 weeks') as "EndDate",
    6 as "RemainingSessionCount",
    'Active' as "Status",
    NOW() as "CreatedAt",
    NOW() as "UpdatedAt"
FROM "Packages" p
WHERE p."Name" = 'Beslenme Danışmanlığı Paketi'
LIMIT 1;

-- Verify
SELECT cp."Id", cp."ClientId", p."Name", cp."Status", cp."RemainingSessionCount"
FROM "ClientPackages" cp
JOIN "Packages" p ON cp."PackageId" = p."Id"
WHERE cp."ClientId" = 5;
