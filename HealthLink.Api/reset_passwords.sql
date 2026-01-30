-- Reset all user passwords to "123"
-- This script updates all users with the same hash/salt for password "123"
-- Generated using HMACSHA256 hashing

-- First, let's see current users
SELECT "Id", "Email", "Phone" FROM "Users";

-- Note: Each user will get a unique salt, so we need to run the C# code to generate proper hashes
-- For now, this is a template. The actual UPDATE will be done via the application.
