-- Find Dr. Test Expert
SELECT e.id, u.email, u.display_name, e.expert_type 
FROM experts e 
JOIN users u ON e.user_id = u.id 
WHERE u.display_name LIKE '%Test%';

-- Update bio
UPDATE experts 
SET bio = 'Deneyimli psikolog. Anksiyete, depresyon ve stres yönetimi konularında uzmanım. Bireysel terapi seanslarında kanıta dayalı yaklaşımlar kullanarak danışanlarıma destek oluyorum.'
WHERE id = 4;

-- Update title
UPDATE experts 
SET title = 'Klinik Psikolog'
WHERE id = 4;

-- Update experience start date (5 years experience)
UPDATE experts 
SET experience_start_date = '2019-01-01'
WHERE id = 4;

-- Add specializations (assuming Psychologist specializations exist)
-- First, let's see available specializations
SELECT id, name, category FROM specializations WHERE category = 'Psychologist';

-- Insert expert specializations (adjust IDs based on above query)
INSERT INTO expert_specializations (expert_id, specialization_id) 
VALUES 
(4, 1),  -- Replace with actual specialization IDs
(4, 2),
(4, 3)
ON CONFLICT DO NOTHING;

-- Add availability (Monday to Friday, 9 AM to 5 PM)
INSERT INTO expert_availabilities (expert_id, day_of_week, start_time, end_time, is_available)
VALUES
(4, 1, '09:00:00', '17:00:00', true),  -- Monday
(4, 2, '09:00:00', '17:00:00', true),  -- Tuesday
(4, 3, '09:00:00', '17:00:00', true),  -- Wednesday
(4, 4, '09:00:00', '17:00:00', true),  -- Thursday
(4, 5, '09:00:00', '17:00:00', true)   -- Friday
ON CONFLICT DO NOTHING;

-- Add some reviews for rating
INSERT INTO reviews (client_id, expert_id, rating, comment, created_at)
VALUES
(1, 4, 5, 'Harika bir deneyimdi, çok yardımcı oldu.', NOW()),
(2, 4, 5, 'Profesyonel ve anlayışlı bir yaklaşım.', NOW()),
(3, 4, 4, 'İyi bir psikolog, tavsiye ederim.', NOW())
ON CONFLICT DO NOTHING;
