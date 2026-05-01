INSERT INTO ngo (name, description, urgency_level, total_funds, verified, city, latitude, longitude, created_at)
SELECT 'Hope Shelter', 'Night meal drives for children and homeless families.', 9, 5420000, TRUE, 'Mumbai', 19.0760, 72.8777, now()
WHERE NOT EXISTS (SELECT 1 FROM ngo WHERE name='Hope Shelter');

INSERT INTO ngo (name, description, urgency_level, total_funds, verified, city, latitude, longitude, created_at)
SELECT 'GreenPlate Rescue', 'Rescues surplus food from events and redistributes locally.', 6, 1785000, TRUE, 'Pune', 18.5204, 73.8567, now()
WHERE NOT EXISTS (SELECT 1 FROM ngo WHERE name='GreenPlate Rescue');

INSERT INTO ngo (name, description, urgency_level, total_funds, verified, city, latitude, longitude, created_at)
SELECT 'Milk for Smiles', 'Milk and nutrition kits for children in high-risk zones.', 8, 920000, FALSE, 'Delhi', 28.6139, 77.2090, now()
WHERE NOT EXISTS (SELECT 1 FROM ngo WHERE name='Milk for Smiles');

INSERT INTO campaign (ngo_id, title, description, goal_amount, raised_amount, ends_at, is_emergency, created_at)
SELECT n.id,
       '50 children need meals tonight',
       'Emergency hunger relief required for tonight’s meal drive.',
       10000000,
       5420000,
       now() + interval '8 hours',
       TRUE,
       now()
FROM ngo n
WHERE n.name = 'Hope Shelter'
  AND NOT EXISTS (SELECT 1 FROM campaign c WHERE c.title='50 children need meals tonight');

