-- Add content_width field to user_settings table
-- This field stores the reader content width as a percentage (30-95)

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS content_width INTEGER DEFAULT 65;

-- Add a check constraint to ensure valid range
ALTER TABLE user_settings
ADD CONSTRAINT content_width_range CHECK (content_width >= 30 AND content_width <= 95);
