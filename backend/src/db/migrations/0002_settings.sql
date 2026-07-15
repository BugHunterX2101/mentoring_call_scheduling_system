CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO admin_settings (key, value) VALUES
('platform_config', '{"autoMatch": true, "matchingSensitivity": "medium", "emailNotifications": true, "weeklyReport": true, "timezone": "UTC"}')
ON CONFLICT (key) DO NOTHING;
