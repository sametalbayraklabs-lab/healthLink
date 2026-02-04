-- Update Dr. Test Expert profile (ID: 4)

-- Update bio
UPDATE experts 
SET bio = 'Deneyimli psikolog. Anksiyete, depresyon ve stres yönetimi konularında uzmanım. Bireysel terapi seanslarında kanıta dayalı yaklaşımlar kullanarak danışanlarıma destek oluyorum.',
    title = 'Klinik Psikolog',
    experience_start_date = '2019-01-01'
WHERE id = 4;

-- Check available specializations
SELECT id, name, category FROM specializations WHERE category = 'Psychologist' LIMIT 5;

-- Add expert specializations (will add after seeing available ones)
-- INSERT INTO expert_specializations (expert_id, specialization_id) 
-- VALUES (4, 1), (4, 2), (4, 3);

-- Add availability (Monday to Friday, 9 AM to 5 PM)
INSERT INTO expert_availabilities (expert_id, day_of_week, start_time, end_time, is_available)
VALUES
(4, 1, '09:00:00', '17:00:00', true),
(4, 2, '09:00:00', '17:00:00', true),
(4, 3, '09:00:00', '17:00:00', true),
(4, 4, '09:00:00', '17:00:00', true),
(4, 5, '09:00:00', '17:00:00', true)
ON CONFLICT (expert_id, day_of_week) DO UPDATE 
SET start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_available = EXCLUDED.is_available;

-- Verify updates
SELECT id, bio, title, experience_start_date FROM experts WHERE id = 4;
SELECT * FROM expert_availabilities WHERE expert_id = 4;
