-- Sample Package and Appointment for Client (userId: 19, clientId: 5)

-- First, get an expert ID (let's use the first available expert)
DO $$
DECLARE
    v_expert_id BIGINT;
    v_package_id BIGINT;
    v_client_id BIGINT := 5;
BEGIN
    -- Get first expert
    SELECT "Id" INTO v_expert_id FROM "Experts" LIMIT 1;
    
    IF v_expert_id IS NULL THEN
        RAISE EXCEPTION 'No expert found in database';
    END IF;

    -- Create a package for the client
    INSERT INTO "Packages" (
        "ExpertId",
        "ClientId",
        "Name",
        "Description",
        "SessionCount",
        "CompletedSessions",
        "Price",
        "Status",
        "StartDate",
        "EndDate",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        v_expert_id,
        v_client_id,
        'Beslenme Danışmanlığı Paketi',
        '8 haftalık kişiselleştirilmiş beslenme programı. Haftalık takip seansları ve özel diyet planı dahildir.',
        8,
        2,
        1500.00,
        'Active',
        CURRENT_DATE - INTERVAL '2 weeks',
        CURRENT_DATE + INTERVAL '6 weeks',
        NOW(),
        NOW()
    ) RETURNING "Id" INTO v_package_id;

    RAISE NOTICE 'Package created with ID: %', v_package_id;

    -- Create upcoming appointment
    INSERT INTO "Appointments" (
        "ExpertId",
        "ClientId",
        "AppointmentDate",
        "Status",
        "Notes",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        v_expert_id,
        v_client_id,
        CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00',
        'Scheduled',
        'Haftalık kontrol randevusu',
        NOW(),
        NOW()
    );

    -- Create past completed appointment
    INSERT INTO "Appointments" (
        "ExpertId",
        "ClientId",
        "AppointmentDate",
        "Status",
        "Notes",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        v_expert_id,
        v_client_id,
        CURRENT_DATE - INTERVAL '1 week' + TIME '10:00:00',
        'Completed',
        'İlk değerlendirme seansı tamamlandı',
        NOW(),
        NOW()
    );

    -- Create another upcoming appointment
    INSERT INTO "Appointments" (
        "ExpertId",
        "ClientId",
        "AppointmentDate",
        "Status",
        "Notes",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        v_expert_id,
        v_client_id,
        CURRENT_DATE + INTERVAL '1 week' + TIME '15:30:00',
        'Scheduled',
        'Diyet planı revizyon görüşmesi',
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Sample data created successfully!';
END $$;
