-- Migration to add device and admin action tables for branch management

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    branch_id TEXT NOT NULL,
    device_info JSONB,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_devices_branch 
        FOREIGN KEY (branch_id) 
        REFERENCES "Branch"(id) 
        ON DELETE CASCADE
);

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    action VARCHAR(255) NOT NULL,
    device_id VARCHAR(255),
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_branch_id ON devices(branch_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON admin_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_actions_device_id ON admin_actions(device_id);

-- Add comments for documentation
COMMENT ON TABLE devices IS 'Stores tablet device registrations and their assigned branches';
COMMENT ON TABLE admin_actions IS 'Audit log for administrative actions like device unlocks';

COMMENT ON COLUMN devices.device_id IS 'Unique identifier for each tablet device';
COMMENT ON COLUMN devices.branch_id IS 'ID of the branch this device is assigned to';
COMMENT ON COLUMN devices.device_info IS 'JSON containing device information (screen resolution, user agent, etc.)';
COMMENT ON COLUMN devices.last_seen IS 'Timestamp of last device activity';

COMMENT ON COLUMN admin_actions.action IS 'Type of admin action performed (e.g., TABLET_UNLOCK)';
COMMENT ON COLUMN admin_actions.device_id IS 'Device ID associated with the action (if applicable)';
COMMENT ON COLUMN admin_actions.metadata IS 'Additional data related to the action';
