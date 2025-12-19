-- Create ai_logs table
CREATE TABLE IF NOT EXISTS ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  model_used text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for ai_logs
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ai_logs"
  ON ai_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ai_logs"
  ON ai_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  audit_date timestamptz NOT NULL,
  status text DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Coordinado', 'Realizado', 'Cancelado')),
  coordinator_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger for schedules
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add evidence and ai_analysis to risks
ALTER TABLE risks ADD COLUMN IF NOT EXISTS evidence text;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS ai_analysis jsonb;

-- Add evidence and ai_analysis to treatment_plans
ALTER TABLE treatment_plans ADD COLUMN IF NOT EXISTS evidence text;
ALTER TABLE treatment_plans ADD COLUMN IF NOT EXISTS ai_analysis jsonb;
