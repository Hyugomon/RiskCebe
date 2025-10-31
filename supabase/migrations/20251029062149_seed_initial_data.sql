/*
  # Seed Initial Data for RiskCEBE

  ## Overview
  Populates the database with initial data for a CEBE (Centro de Educación Básica Especial)
  including assets, common threats, identified risks, and treatment plans.

  ## Data Inserted

  ### Common Threats
  - Electrical failures
  - Unauthorized access
  - Malware/Viruses
  - Data loss (no backups)
  - Data leakage
  - Unauthorized alteration
  - Outdated software malware
  - Unlicensed software use
  - Flood damage
  - Physical theft

  ### Sample Assets (10 assets covering all domains)
  - Hardware: Director's computer, Administrative computer, Server
  - Software: Student information system, Accounting software
  - Data: Student records, Financial information
  - Utilities: Server room, Backup storage, Network equipment

  ### Sample Risks and Treatment Plans
  Based on typical CEBE cybersecurity scenarios
*/

-- Insert common threats
INSERT INTO threats (name, description) VALUES
  ('Fallas eléctricas', 'Interrupciones o fluctuaciones en el suministro eléctrico que pueden dañar equipos'),
  ('Acceso no autorizado', 'Acceso físico o lógico no autorizado a sistemas o información'),
  ('Malware/Virus', 'Software malicioso que puede dañar sistemas o robar información'),
  ('Pérdida de datos (sin backups)', 'Pérdida irreversible de información por falta de respaldos'),
  ('Fuga de datos', 'Divulgación no autorizada de información confidencial'),
  ('Alteración no autorizada', 'Modificación no autorizada de datos que afecta su integridad'),
  ('Malware por software desactualizado', 'Vulnerabilidades en software sin actualizar que permiten ataques'),
  ('Uso no licenciado', 'Uso de software sin licencia que puede causar problemas legales'),
  ('Daño por inundaciones', 'Daño físico a instalaciones y equipos por eventos de inundación'),
  ('Robo físico', 'Sustracción física de equipos o dispositivos')
ON CONFLICT (name) DO NOTHING;

-- Insert sample assets
INSERT INTO assets (name, owner, domain, confidentiality_value, integrity_value, availability_value) VALUES
  ('Computadora de Dirección', 'Directora del CEBE', 'HW', 4, 4, 5),
  ('Computadora Administrativa', 'Secretaria', 'HW', 3, 4, 4),
  ('Servidor Principal', 'Personal de TI', 'HW', 5, 5, 5),
  ('Sistema de Información Estudiantil', 'Directora del CEBE', 'SW', 5, 5, 4),
  ('Software de Contabilidad', 'Contador', 'SW', 4, 5, 3),
  ('Registros de Estudiantes', 'Directora del CEBE', 'D', 5, 5, 4),
  ('Información Financiera', 'Contador', 'D', 5, 5, 3),
  ('Sala de Servidores', 'Personal de TI', 'U', 4, 4, 5),
  ('Almacenamiento de Respaldos', 'Personal de TI', 'U', 5, 5, 4),
  ('Equipos de Red', 'Personal de TI', 'HW', 3, 4, 5);

-- Insert sample risks (based on common CEBE scenarios)
-- We'll create risks for critical assets with appropriate threat combinations

-- Risks for Servidor Principal (critical hardware)
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Servidor Principal' AND t.name = 'Fallas eléctricas';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Servidor Principal' AND t.name = 'Acceso no autorizado';

-- Risks for Registros de Estudiantes (critical data)
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Registros de Estudiantes' AND t.name = 'Pérdida de datos (sin backups)';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Registros de Estudiantes' AND t.name = 'Fuga de datos';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  2, -- Improbable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Registros de Estudiantes' AND t.name = 'Alteración no autorizada';

-- Risks for Sistema de Información Estudiantil
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Sistema de Información Estudiantil' AND t.name = 'Malware por software desactualizado';

-- Risks for Sala de Servidores
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  2, -- Improbable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Sala de Servidores' AND t.name = 'Daño por inundaciones';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Sala de Servidores' AND t.name = 'Acceso no autorizado';

-- Risks for Computadora de Dirección
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Malware/Virus';

-- Risks for Software de Contabilidad
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  3, -- Dañino impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Software de Contabilidad' AND t.name = 'Uso no licenciado';

-- Insert treatment plans for high and extreme risks
-- Treatment for Servidor Principal - Fallas eléctricas
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Instalar UPS (Sistema de Alimentación Ininterrumpida) y estabilizadores de voltaje. Implementar monitoreo de energía.',
  'A.11.2.3 - Seguridad del cableado',
  'Directora del CEBE',
  'Octubre (adquisición), Noviembre (instalación)',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Servidor Principal' AND t.name = 'Fallas eléctricas';

-- Treatment for Registros de Estudiantes - Pérdida de datos
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar sistema de respaldos automáticos diarios con almacenamiento en la nube. Realizar pruebas de restauración mensuales.',
  'A.12.3.1 - Copias de seguridad de la información',
  'Personal de TI',
  'Octubre (configuración), Noviembre (implementación)',
  'En Progreso'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Registros de Estudiantes' AND t.name = 'Pérdida de datos (sin backups)';

-- Treatment for Servidor Principal - Acceso no autorizado
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar autenticación de dos factores, control de acceso basado en roles, y registro de auditoría de accesos.',
  'A.9.2.1 - Registro y baja de usuarios; A.9.4.2 - Procedimientos seguros de inicio de sesión',
  'Personal de TI',
  'Septiembre (planificación), Octubre (implementación)',
  'En Progreso'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Servidor Principal' AND t.name = 'Acceso no autorizado';

-- Treatment for Sistema de Información Estudiantil - Malware
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar política de actualización automática de software. Instalar antivirus empresarial con actualizaciones automáticas.',
  'A.12.6.1 - Gestión de vulnerabilidades técnicas; A.12.2.1 - Controles contra código malicioso',
  'Personal de TI',
  'Inmediato (Septiembre)',
  'Implementado'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Sistema de Información Estudiantil' AND t.name = 'Malware por software desactualizado';

-- Treatment for Sala de Servidores - Acceso no autorizado
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Instalar cerradura electrónica con registro de accesos. Implementar cámaras de seguridad. Establecer política de acceso restringido.',
  'A.11.1.2 - Controles de acceso físico; A.11.1.4 - Protección contra amenazas externas y ambientales',
  'Directora del CEBE',
  'Octubre (adquisición), Noviembre (instalación)',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Sala de Servidores' AND t.name = 'Acceso no autorizado';

-- Treatment for Registros de Estudiantes - Fuga de datos
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar cifrado de datos en reposo y en tránsito. Establecer políticas de clasificación de información y control de acceso.',
  'A.10.1.1 - Política de uso de controles criptográficos; A.8.2.3 - Tratamiento de activos',
  'Directora del CEBE',
  'Octubre (desarrollo de políticas), Noviembre (implementación técnica)',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Registros de Estudiantes' AND t.name = 'Fuga de datos';