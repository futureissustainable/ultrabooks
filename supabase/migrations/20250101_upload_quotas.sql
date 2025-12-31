-- Migration: Upload Quotas
-- Enables tracking of upload limits: 100 per day, 10,000 per account

-- Create upload_quotas table to track user upload counts efficiently
CREATE TABLE IF NOT EXISTS upload_quotas (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  total_uploads INTEGER DEFAULT 0 NOT NULL,
  daily_uploads INTEGER DEFAULT 0 NOT NULL,
  last_upload_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS upload_quotas_user_id_idx ON upload_quotas(user_id);

-- Enable RLS
ALTER TABLE upload_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for upload_quotas
CREATE POLICY "Users can view own quota" ON upload_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota" ON upload_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quota" ON upload_quotas
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to check and update upload quota
-- Returns: { allowed: boolean, daily_remaining: int, total_remaining: int, error?: string }
CREATE OR REPLACE FUNCTION check_upload_quota(p_user_id UUID, p_upload_count INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
  v_quota RECORD;
  v_daily_limit INTEGER := 100;
  v_total_limit INTEGER := 10000;
  v_daily_remaining INTEGER;
  v_total_remaining INTEGER;
BEGIN
  -- Get or create quota record
  SELECT * INTO v_quota FROM upload_quotas WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create new quota record
    INSERT INTO upload_quotas (user_id, total_uploads, daily_uploads, last_upload_date)
    VALUES (p_user_id, 0, 0, CURRENT_DATE)
    RETURNING * INTO v_quota;
  END IF;

  -- Reset daily count if it's a new day
  IF v_quota.last_upload_date < CURRENT_DATE THEN
    v_quota.daily_uploads := 0;
  END IF;

  -- Calculate remaining
  v_daily_remaining := v_daily_limit - v_quota.daily_uploads;
  v_total_remaining := v_total_limit - v_quota.total_uploads;

  -- Check limits
  IF v_quota.total_uploads + p_upload_count > v_total_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'daily_remaining', v_daily_remaining,
      'total_remaining', v_total_remaining,
      'daily_limit', v_daily_limit,
      'total_limit', v_total_limit,
      'error', 'Account upload limit reached (10,000 books maximum)'
    );
  END IF;

  IF v_quota.daily_uploads + p_upload_count > v_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'daily_remaining', v_daily_remaining,
      'total_remaining', v_total_remaining,
      'daily_limit', v_daily_limit,
      'total_limit', v_total_limit,
      'error', 'Daily upload limit reached (100 books per day)'
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'daily_remaining', v_daily_remaining,
    'total_remaining', v_total_remaining,
    'daily_limit', v_daily_limit,
    'total_limit', v_total_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment upload count after successful upload
CREATE OR REPLACE FUNCTION increment_upload_count(p_user_id UUID, p_count INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  INSERT INTO upload_quotas (user_id, total_uploads, daily_uploads, last_upload_date)
  VALUES (p_user_id, p_count, p_count, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    total_uploads = CASE
      WHEN upload_quotas.last_upload_date < CURRENT_DATE THEN p_count
      ELSE upload_quotas.total_uploads + p_count
    END,
    daily_uploads = CASE
      WHEN upload_quotas.last_upload_date < CURRENT_DATE THEN p_count
      ELSE upload_quotas.daily_uploads + p_count
    END,
    last_upload_date = CURRENT_DATE,
    updated_at = TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current quota status
CREATE OR REPLACE FUNCTION get_upload_quota(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_quota RECORD;
  v_daily_limit INTEGER := 100;
  v_total_limit INTEGER := 10000;
  v_daily_uploads INTEGER;
BEGIN
  SELECT * INTO v_quota FROM upload_quotas WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'daily_uploads', 0,
      'total_uploads', 0,
      'daily_remaining', v_daily_limit,
      'total_remaining', v_total_limit,
      'daily_limit', v_daily_limit,
      'total_limit', v_total_limit
    );
  END IF;

  -- Reset daily count if it's a new day
  v_daily_uploads := CASE
    WHEN v_quota.last_upload_date < CURRENT_DATE THEN 0
    ELSE v_quota.daily_uploads
  END;

  RETURN jsonb_build_object(
    'daily_uploads', v_daily_uploads,
    'total_uploads', v_quota.total_uploads,
    'daily_remaining', v_daily_limit - v_daily_uploads,
    'total_remaining', v_total_limit - v_quota.total_uploads,
    'daily_limit', v_daily_limit,
    'total_limit', v_total_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
