SELECT u."Email", r."Name" as "Role" 
FROM "Users" u 
JOIN "UserRoles" ur ON u."Id" = ur."UserId" 
JOIN "Roles" r ON ur."RoleId" = r."Id" 
WHERE u."Email" = 'admin@healthlink.com';
