export type AssetDomain = 'HW' | 'SW' | 'D' | 'U';
export type RiskZone = 'E' | 'A' | 'M' | 'B';
export type RiskStatus = 'Identificado' | 'Tratado' | 'Asumido';
export type ImplementationStatus = 'Pendiente' | 'En Progreso' | 'Implementado';

export interface Asset {
  id: string;
  name: string;
  owner: string;
  domain: AssetDomain;
  confidentiality_value: number;
  integrity_value: number;
  availability_value: number;
  average_value: number;
  created_at: string;
  updated_at: string;
  evidence?: string;
  ai_analysis?: any;
}

export interface Threat {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Risk {
  id: string;
  asset_id: string;
  threat_id: string;
  impact_level: number;
  probability_level: number;
  risk_total: number;
  risk_zone: RiskZone;
  status: RiskStatus;
  created_at: string;
  updated_at: string;
  evidence?: string;
  ai_analysis?: any;
}

export interface TreatmentPlan {
  id: string;
  risk_id: string;
  safeguards: string;
  iso_27002_controls: string;
  risk_owner: string;
  timeline: string;
  implementation_status: ImplementationStatus;
  residual_probability_level?: number;
  residual_impact_level?: number;
  residual_risk_total?: number;
  residual_risk_zone?: RiskZone;
  created_at: string;
  updated_at: string;
  evidence?: string;
  ai_analysis?: any;
}

export interface RiskWithDetails extends Risk {
  asset: Asset;
  threat: Threat;
  treatment_plan?: TreatmentPlan;
}

export interface CreateAsset {
  name: string;
  owner: string;
  domain: AssetDomain;
  confidentiality_value: number;
  integrity_value: number;
  availability_value: number;
  evidence?: string;
}

export interface CreateRisk {
  asset_id: string;
  threat_id: string;
  impact_level: number;
  probability_level: number;
  status?: RiskStatus;
}

export interface CreateTreatmentPlan {
  risk_id: string;
  safeguards: string;
  iso_27002_controls: string;
  risk_owner: string;
  timeline: string;
  implementation_status?: ImplementationStatus;
  residual_probability_level?: number;
  residual_impact_level?: number;
  residual_risk_total?: number;
  residual_risk_zone?: RiskZone;
  evidence?: string;
}

export const DOMAIN_LABELS: Record<AssetDomain, string> = {
  HW: 'Hardware',
  SW: 'Software',
  D: 'Datos',
  U: 'Físico/Utilitario',
};

export const RISK_ZONE_LABELS: Record<RiskZone, string> = {
  E: 'Extremo',
  A: 'Alto',
  M: 'Moderado',
  B: 'Bajo',
};

export const RISK_ZONE_COLORS: Record<RiskZone, string> = {
  E: '#dc2626', // red-600
  A: '#ea580c', // orange-600
  M: '#ca8a04', // yellow-600
  B: '#16a34a', // green-600
};

export const IMPACT_LABELS = [
  { value: 1, label: 'Insignificante' },
  { value: 2, label: 'Menor' },
  { value: 3, label: 'Dañino' },
  { value: 4, label: 'Severo' },
  { value: 5, label: 'Crítico' },
];

export const PROBABILITY_LABELS = [
  { value: 1, label: 'Raro' },
  { value: 2, label: 'Improbable' },
  { value: 3, label: 'Posible' },
  { value: 4, label: 'Probable' },
  { value: 5, label: 'Casi Seguro' },
];

export const THREAT_SUGGESTIONS: Record<AssetDomain, string[]> = {
  HW: ['Fallas eléctricas', 'Acceso no autorizado', 'Malware/Virus'],
  D: [
    'Pérdida de datos (sin backups)',
    'Acceso no autorizado',
    'Fuga de datos',
    'Alteración no autorizada',
  ],
  SW: ['Malware por software desactualizado', 'Uso no licenciado'],
  U: ['Daño por inundaciones', 'Robo físico'],
};
