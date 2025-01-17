-- Custom migration for triggers and indexes

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts ("userId");
CREATE INDEX IF NOT EXISTS accounts_provider_id_idx ON accounts ("providerAccountId");

-- Create admin role assignment function
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Trigger function called for email: %', NEW.email;

    IF NEW.email = 'ctw@ctwhome.com' THEN
        RAISE NOTICE 'Setting admin role for ctw@ctwhome.com';
        NEW.role = 'admin';
    ELSE
        RAISE NOTICE 'Setting default user role';
        NEW.role = COALESCE(NEW.role, 'user');
    END IF;

    RAISE NOTICE 'Final role value: %', NEW.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin role assignment
CREATE TRIGGER auto_assign_admin_role
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_admin_role();
