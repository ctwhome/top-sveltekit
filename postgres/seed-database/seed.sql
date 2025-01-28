-- Seed todos for user alice (assuming user_id = 1)
INSERT INTO todos (title, completed, user_id) VALUES
('Complete SvelteKit tutorial', true, 1),
('Review PostgreSQL documentation', false, 1),
('Write API documentation', false, 1),
('Setup CI/CD pipeline', false, 1),
('Update user authentication', true, 1),
('Implement dark mode', false, 1),
('Optimize database queries', false, 1),
('Add error handling', true, 1),
('Create user dashboard', false, 1),
('Write unit tests', false, 1);
