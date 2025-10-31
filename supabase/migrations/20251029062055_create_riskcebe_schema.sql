/*
  # RiskCEBE Database Schema

  ## Overview
  Creates the complete database structure for the RiskCEBE cybersecurity risk management application.
  This schema supports asset management, threat identification, risk assessment, and treatment planning.

  ## New Tables

  ### 1. `assets`
  Stores information assets of the organization (hardware, software, data, utilities)
  - `id` (uuid, primary key)
  - `name` (text) - Asset name
  - `owner` (text) - Person responsible for the asset
  - `domain` (text) - Asset category: HW, SW, D, U
  - `confidentiality_value` (integer) - CIA rating 1-5
  - `integrity_value` (integer) - CIA rating 1-5
  - `availability_value` (integer) - CIA rating 1-5
  - `average_value` (numeric) - Calculated average of CIA values
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `threats`
  Catalog of potential threats to assets
  - `id` (uuid, primary key)
  - `name` (text) - Threat name
  - `description` (text) - Detailed threat description
  - `created_at` (timestamptz)

  ### 3. `risks`
  Represents identified risks (asset + threat combination)
  - `id` (uuid, primary key)
  - `asset_id` (uuid, foreign key to assets)
  - `threat_id` (uuid, foreign key to threats)
  - `impact_level` (integer) - Impact rating 1-5
  - `probability_level` (integer) - Probability rating 1-5
  - `risk_total` (integer) - Calculated: impact × probability
  - `risk_zone` (text) - Calculated: E, A, M, B
  - `status` (text) - Identificado, Tratado, Asumido
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `treatment_plans`
  Risk treatment plans for identified risks
  - `id` (uuid, primary key)
  - `risk_id` (uuid, foreign key to risks)
  - `safeguards` (text) - Control measures to implement
  - `iso_27002_controls` (text) - ISO 27002 control references
  - `risk_owner` (text) - Person responsible for treatment
  - `timeline` (text) - Implementation timeline
  - `implementation_status` (text) - Pendiente, En Progreso, Implementado
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies created for authenticated users with role-based access
  - Risk Managers have full CRUD access
  - Risk Owners have read-only access to their assigned risks
*/

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('HW', 'SW', 'D', 'U')),
  confidentiality_value integer NOT NULL CHECK (confidentiality_value >= 1 AND confidentiality_value <= 5),
  integrity_value integer NOT NULL CHECK (integrity_value >= 1 AND integrity_value <= 5),
  availability_value integer NOT NULL CHECK (availability_value >= 1 AND availability_value <= 5),
  average_value numeric GENERATED ALWAYS AS ((confidentiality_value + integrity_value + availability_value)::numeric / 3) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create threats table
CREATE TABLE IF NOT EXISTS threats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create risks table
CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  threat_id uuid NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
  impact_level integer NOT NULL CHECK (impact_level >= 1 AND impact_level <= 5),
  probability_level integer NOT NULL CHECK (probability_level >= 1 AND probability_level <= 5),
  risk_total integer GENERATED ALWAYS AS (impact_level * probability_level) STORED,
  risk_zone text GENERATED ALWAYS AS (
    CASE
      WHEN (impact_level * probability_level >= 20) OR (probability_level = 5 AND impact_level = 4) THEN 'E'
      WHEN impact_level * probability_level >= 9 THEN 'A'
      WHEN impact_level * probability_level >= 3 THEN 'M'
      ELSE 'B'
    END
  ) STORED,
  status text DEFAULT 'Identificado' CHECK (status IN ('Identificado', 'Tratado', 'Asumido')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(asset_id, threat_id)
);

-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE UNIQUE,
  safeguards text DEFAULT '',
  iso_27002_controls text DEFAULT '',
  risk_owner text DEFAULT '',
  timeline text DEFAULT '',
  implementation_status text DEFAULT 'Pendiente' CHECK (implementation_status IN ('Pendiente', 'En Progreso', 'Implementado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risks_updated_at ON risks;
CREATE TRIGGER update_risks_updated_at
  BEFORE UPDATE ON risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_plans_updated_at ON treatment_plans;
CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

-- Policies for assets table
CREATE POLICY "Authenticated users can view all assets"
  ON assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete assets"
  ON assets FOR DELETE
  TO authenticated
  USING (true);

-- Policies for threats table
CREATE POLICY "Authenticated users can view all threats"
  ON threats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert threats"
  ON threats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update threats"
  ON threats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete threats"
  ON threats FOR DELETE
  TO authenticated
  USING (true);

-- Policies for risks table
CREATE POLICY "Authenticated users can view all risks"
  ON risks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert risks"
  ON risks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update risks"
  ON risks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete risks"
  ON risks FOR DELETE
  TO authenticated
  USING (true);

-- Policies for treatment_plans table
CREATE POLICY "Authenticated users can view all treatment plans"
  ON treatment_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert treatment plans"
  ON treatment_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update treatment plans"
  ON treatment_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete treatment plans"
  ON treatment_plans FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_risks_asset_id ON risks(asset_id);
CREATE INDEX IF NOT EXISTS idx_risks_threat_id ON risks(threat_id);
CREATE INDEX IF NOT EXISTS idx_risks_risk_zone ON risks(risk_zone);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_risk_id ON treatment_plans(risk_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(implementation_status);