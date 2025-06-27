-- Insert sample branches for testing
INSERT INTO "Branch" (id, name, address, "createdAt", "updatedAt") VALUES 
('UDP', 'UDP Branch', 'UDP Location Address', NOW(), NOW()),
('downtown', 'Downtown Branch', 'Downtown Location Address', NOW(), NOW()),
('mall', 'Mall Branch', 'Mall Location Address', NOW(), NOW()),
('airport', 'Airport Branch', 'Airport Location Address', NOW(), NOW()),
('university', 'University Branch', 'University Location Address', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
