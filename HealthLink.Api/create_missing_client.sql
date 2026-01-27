-- Create missing client record for kullanici01@healtlink.com

-- First, get the user ID
DO $$
DECLARE
    v_user_id BIGINT;
    v_client_exists BOOLEAN;
BEGIN
    -- Get user ID
    SELECT "Id" INTO v_user_id 
    FROM "Users" 
    WHERE "Email" = 'kullanici01@healtlink.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found with email kullanici01@healtlink.com';
        RETURN;
    END IF;
    
    -- Check if client already exists
    SELECT EXISTS(SELECT 1 FROM "Clients" WHERE "UserId" = v_user_id) INTO v_client_exists;
    
    IF v_client_exists THEN
        RAISE NOTICE 'Client already exists for this user';
        RETURN;
    END IF;
    
    -- Create client record
    INSERT INTO "Clients" (
        "UserId",
        "FirstName",
        "LastName",
        "BirthDate",
        "Gender",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        v_user_id,
        'Kullanıcı',
        'Test',
        NULL,
        2, -- Other
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Client created successfully for user ID: %', v_user_id;
END $$;
