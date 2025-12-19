-- Add evidence and ai_analysis to assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS evidence text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS ai_analysis jsonb;
