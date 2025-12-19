/*
  # Seed Initial Data for RiskCEBE

  ## Overview
  Populates the database with actual data for CEBE (Centro de Educación Básica Especial)
  based on the provided risk management documentation.
  Includes real assets, threats, risks, and treatment plans from contenido.md

  ## Data Inserted

  ### Common Threats
  Based on actual threats identified in the risk assessment

  ### Actual Assets (10 assets from inventory)
  - Hardware: Computadora de Dirección, Computadora de Secretaría, Conexión a Internet
  - Software: Software de Ofimática
  - Data: Registros Académicos, Información de Identificación Personal, Informes Psicopedagógicos
  - Utilities: Archivo Físico, Comunicados a Padres, Plan de Cámaras de Seguridad

  ### Actual Risks and Treatment Plans
  Based on the comprehensive risk evaluation from contenido.md
*/

-- Insert actual threats from contenido.md
INSERT INTO threats (name, description) VALUES
  ('Fallas eléctricas', 'Interrupciones o fluctuaciones en el suministro eléctrico que pueden dañar equipos'),
  ('Pérdida de datos (sin backups)', 'Pérdida irreversible de información por falta de respaldos'),
  ('Acceso no autorizado', 'Acceso físico o lógico no autorizado a sistemas o información'),
  ('Daño por inundaciones', 'Daño físico a instalaciones y equipos por eventos de inundación'),
  ('Interrupción de servicio / Malware', 'Interrupción de servicios o infección por software malicioso'),
  ('Malware por software desactualizado', 'Vulnerabilidades en software sin actualizar que permiten ataques'),
  ('Uso no licenciado', 'Uso de software sin licencia que puede causar problemas legales'),
  ('Fuga de datos', 'Divulgación no autorizada de información confidencial'),
  ('Alteración no autorizada', 'Modificación no autorizada de datos que afecta su integridad'),
  ('Robo de identidad', 'Sustracción y uso no autorizado de información de identificación personal')
ON CONFLICT (name) DO NOTHING;

-- Insert actual assets from contenido.md with their valuation scores
INSERT INTO assets (name, owner, domain, confidentiality_value, integrity_value, availability_value) VALUES
  ('Computadora de Dirección', 'Directora del CEBE', 'HW', 5, 5, 3),
  ('Computadora de Secretaría', 'Secretaria Académica', 'HW', 5, 5, 3),
  ('Registros Académicos de Estudiantes', 'Directora / Secretaria', 'D', 5, 5, 3),
  ('Información de Identificación Personal (Alumnos y Personal)', 'Directora / Secretaria', 'D', 5, 5, 3),
  ('Informes Psicopedagógicos y Médicos', 'Directora del CEBE', 'D', 5, 5, 1),
  ('Conexión a Internet (Router Wi-Fi)', 'Proveedor de Internet / Dirección', 'HW', 1, 3, 3),
  ('Plan de Implementación de Cámaras de Seguridad', 'Directora del CEBE', 'D', 3, 3, 3),
  ('Archivo Físico de Documentación Administrativa', 'Directora / Secretaria', 'U', 3, 5, 1),
  ('Software de Ofimática', 'Usuarios de los equipos', 'SW', 1, 3, 3),
  ('Comunicados a Padres de Familia', 'Secretaria Académica', 'D', 3, 5, 3)
ON CONFLICT (name) DO NOTHING;

-- Insert actual risks based on comprehensive risk evaluation from contenido.md

-- Risks for Computadora de Dirección
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Fallas eléctricas';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  3, -- Dañino impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Acceso no autorizado';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  2, -- Improbable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Malware/Virus';

-- Risks for Computadora de Secretaría
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Computadora de Secretaría' AND t.name = 'Fallas eléctricas';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Computadora de Secretaría' AND t.name = 'Pérdida de datos (sin backups)';

-- Risks for Registros Académicos de Estudiantes
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Registros Académicos de Estudiantes' AND t.name = 'Alteración no autorizada';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Registros Académicos de Estudiantes' AND t.name = 'Pérdida de datos (sin backups)';

-- Risks for Información de Identificación Personal
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Información de Identificación Personal (Alumnos y Personal)' AND t.name = 'Fuga de datos';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  2, -- Improbable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Información de Identificación Personal (Alumnos y Personal)' AND t.name = 'Robo de identidad';

-- Risks for Informes Psicopedagógicos y Médicos
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Informes Psicopedagógicos y Médicos' AND t.name = 'Daño por inundaciones';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  5, -- Critical impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Informes Psicopedagógicos y Médicos' AND t.name = 'Acceso no autorizado';

-- Risks for Conexión a Internet (Router Wi-Fi)
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  4, -- Probable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Conexión a Internet (Router Wi-Fi)' AND t.name = 'Interrupción de servicio / Malware';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  3, -- Dañino impact
  5, -- Casi Seguro
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Conexión a Internet (Router Wi-Fi)' AND t.name = 'Acceso no autorizado';

-- Risks for Software de Ofimática
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  3, -- Dañino impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Software de Ofimática' AND t.name = 'Malware por software desactualizado';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  2, -- Menor impact
  2, -- Improbable
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Software de Ofimática' AND t.name = 'Uso no licenciado';

-- Risks for Archivo Físico de Documentación Administrativa
INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  4, -- Severe impact
  3, -- Possible
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Archivo Físico de Documentación Administrativa' AND t.name = 'Pérdida de datos (sin backups)';

INSERT INTO risks (asset_id, threat_id, impact_level, probability_level, status)
SELECT 
  a.id,
  t.id,
  3, -- Dañino impact
  1, -- Raro
  'Identificado'
FROM assets a, threats t
WHERE a.name = 'Archivo Físico de Documentación Administrativa' AND t.name = 'Robo físico';

-- Insert actual treatment plans based on safeguards and controls from contenido.md

-- Treatment for electrical failure risk on Computadora de Dirección
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar sistema de alimentación ininterrumpida (UPS) para equipos críticos',
  'A.11.2.3 - Seguridad del cableado',
  'Jefe de TI',
  '30 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Fallas eléctricas';

-- Treatment for unauthorized access risk on Computadora de Dirección
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar políticas de contraseñas seguras y bloqueo automático de sesiones',
  'A.9.2.1 - Registro y baja de usuarios; A.9.4.2 - Procedimientos seguros de inicio de sesión',
  'Administrador de Sistemas',
  '15 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Acceso no autorizado';

-- Treatment for malware risk on Computadora de Dirección
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Instalar y mantener actualizado software antivirus en todos los equipos',
  'A.12.6.1 - Gestión de vulnerabilidades técnicas; A.12.2.1 - Controles contra código malicioso',
  'Técnico de Soporte',
  '7 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Computadora de Dirección' AND t.name = 'Malware/Virus';

-- Treatment for electrical failure risk on Computadora de Secretaría
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Proteger equipos con reguladores de voltaje y sistemas UPS',
  'A.11.2.3 - Seguridad del cableado',
  'Coordinador Administrativo',
  '30 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Computadora de Secretaría' AND t.name = 'Fallas eléctricas';

-- Treatment for data loss risk on Computadora de Secretaría
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar backups automáticos diarios en almacenamiento externo seguro',
  'A.12.3.1 - Copias de seguridad de la información',
  'Secretaria General',
  '10 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Computadora de Secretaría' AND t.name = 'Pérdida de datos (sin backups)';

-- Treatment for unauthorized alteration risk on student academic records
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar sistema de control de accesos y registro de auditoría para modificaciones',
  'A.9.2.1 - Registro y baja de usuarios; A.9.4.2 - Procedimientos seguros de inicio de sesión',
  'Coordinador Académico',
  '20 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Registros Académicos de Estudiantes' AND t.name = 'Alteración no autorizada';

-- Treatment for data loss risk on student academic records
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Establecer política de backups regulares y almacenamiento fuera del sitio',
  'A.12.3.1 - Copias de seguridad de la información',
  'Director',
  '15 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Registros Académicos de Estudiantes' AND t.name = 'Pérdida de datos (sin backups)';

-- Treatment for data leakage risk on personal identification information
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar políticas de protección de datos personales y capacitación al personal',
  'A.8.2.3 - Tratamiento de activos',
  'Responsable de Protección de Datos',
  '25 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Información de Identificación Personal (Alumnos y Personal)' AND t.name = 'Fuga de datos';

-- Treatment for identity theft risk
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Establecer protocolos de verificación de identidad para accesos sensibles',
  'A.9.4.2 - Procedimientos seguros de inicio de sesión',
  'Coordinador de Seguridad',
  '40 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Información de Identificación Personal (Alumnos y Personal)' AND t.name = 'Robo de identidad';

-- Treatment for flood damage risk on psychological and medical reports
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Almacenar documentos críticos en mobiliario elevado y áreas secas',
  'A.11.1.4 - Protección contra amenazas externas y ambientales',
  'Psicóloga',
  '35 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Informes Psicopedagógicos y Médicos' AND t.name = 'Daño por inundaciones';

-- Treatment for unauthorized access risk on psychological and medical reports
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar archivos con llave y control de accesos para información confidencial',
  'A.11.1.2 - Controles de acceso físico',
  'Enfermera',
  '20 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Informes Psicopedagógicos y Médicos' AND t.name = 'Acceso no autorizado';

-- Treatment for service interruption risk on internet connection
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Configurar redundancia de conexión y monitoreo continuo del servicio',
  'A.13.1.1 - Controles de red',
  'Técnico de Redes',
  '15 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Conexión a Internet (Router Wi-Fi)' AND t.name = 'Interrupción de servicio / Malware';

-- Treatment for unauthorized access risk on internet connection
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar seguridad WPA3, cambiar contraseñas predeterminadas y ocultar SSID',
  'A.13.1.1 - Controles de red',
  'Administrador de Red',
  '5 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Conexión a Internet (Router Wi-Fi)' AND t.name = 'Acceso no autorizado';

-- Treatment for outdated software risk on office software
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Establecer política de actualizaciones automáticas y parches de seguridad',
  'A.12.6.1 - Gestión de vulnerabilidades técnicas',
  'Coordinador de TI',
  '10 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Software de Ofimática' AND t.name = 'Malware por software desactualizado';

-- Treatment for unlicensed software risk
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Regularizar licencias de software y establecer inventario de aplicaciones',
  'A.18.1.1 - Identificación de los requisitos legales aplicables',
  'Administrador',
  '60 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Software de Ofimática' AND t.name = 'Uso no licenciado';

-- Treatment for data loss risk on physical administrative documentation
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Digitalizar documentos críticos y establecer sistema de archivo organizado',
  'A.8.2.3 - Tratamiento de activos',
  'Archivista',
  '45 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Archivo Físico de Documentación Administrativa' AND t.name = 'Pérdida de datos (sin backups)';

-- Treatment for physical theft risk
INSERT INTO treatment_plans (risk_id, safeguards, iso_27002_controls, risk_owner, timeline, implementation_status)
SELECT 
  r.id,
  'Implementar sistema de seguridad física: candados, alarmas y control de accesos',
  'A.11.1.2 - Controles de acceso físico',
  'Jefe de Seguridad',
  '30 días',
  'Pendiente'
FROM risks r
JOIN assets a ON r.asset_id = a.id
JOIN threats t ON r.threat_id = t.id
WHERE a.name = 'Archivo Físico de Documentación Administrativa' AND t.name = 'Robo físico';