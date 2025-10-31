# RiskCEBE - Sistema de Gestión de Riesgos de Ciberseguridad

Sistema web full-stack para la gestión automatizada de riesgos de ciberseguridad en Centros de Educación Básica Especial (CEBE).

## Características Principales

- **Gestión de Activos**: CRUD completo para activos de información (Hardware, Software, Datos, Utilitarios)
- **Diagnóstico Automático**: Wizard de 3 pasos para identificación y evaluación de riesgos
  - Paso 1: Selección de activo
  - Paso 2: Identificación automática de amenazas según dominio del activo
  - Paso 3: Evaluación de impacto y probabilidad
- **Plan de Tratamiento de Riesgos**: Gestión de controles con clasificación por zona de riesgo
- **Dashboard Analítico**: Visualizaciones y estadísticas en tiempo real
- **Exportación CSV**: Generación de reportes de riesgos
- **Sistema de Autenticación**: Control de acceso basado en roles

## Tecnologías Utilizadas

### Frontend
- React 18 con TypeScript
- Vite como build tool
- Tailwind CSS para estilos
- Lucide React para iconos

### Backend
- Supabase (PostgreSQL)
- Row Level Security (RLS) activado
- APIs RESTful automáticas

### Base de Datos
- PostgreSQL con Supabase
- 4 tablas principales: assets, threats, risks, treatment_plans
- Triggers automáticos para campos calculados

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase (ya configurada)

### Variables de Entorno

El archivo `.env` ya está configurado con las credenciales de Supabase:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Instalación

1. Instalar dependencias:

```bash
npm install
```

2. La base de datos ya está configurada con:
   - Esquema completo (assets, threats, risks, treatment_plans)
   - Datos de prueba (10 activos, amenazas comunes, riesgos y planes)
   - Políticas RLS activadas

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

4. Abrir el navegador en `http://localhost:5173`

### Credenciales de Prueba

Para acceder al sistema, necesitas crear un usuario en Supabase. Usa la consola de Supabase o crea uno desde el formulario de login.

**Credenciales sugeridas:**
- Email: admin@cebe.edu.pe
- Contraseña: admin123456

Para crear el usuario de prueba desde SQL:

```sql
-- Ejecutar en la consola SQL de Supabase
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'admin@cebe.edu.pe',
  crypt('admin123456', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

## Estructura del Proyecto

```
project/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Assets.tsx     # Módulo de gestión de activos
│   │   ├── Dashboard.tsx  # Dashboard con estadísticas
│   │   ├── Diagnostic.tsx # Wizard de diagnóstico
│   │   ├── Layout.tsx     # Layout principal con navegación
│   │   ├── Login.tsx      # Página de login
│   │   └── RiskPlan.tsx   # Módulo de planes de tratamiento
│   ├── contexts/
│   │   └── AuthContext.tsx # Contexto de autenticación
│   ├── lib/
│   │   └── supabase.ts    # Cliente de Supabase
│   ├── types/
│   │   └── database.ts    # Tipos TypeScript
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── .env                   # Variables de entorno
├── package.json           # Dependencias
└── README.md             # Este archivo
```

## Modelo de Datos

### Assets (Activos)
- ID único
- Nombre, propietario, dominio (HW/SW/D/U)
- Valores CIA (Confidencialidad, Integridad, Disponibilidad) del 1-5
- Promedio calculado automáticamente

### Threats (Amenazas)
- ID único
- Nombre y descripción
- Catálogo precargado con amenazas comunes

### Risks (Riesgos)
- Relación Asset + Threat
- Impacto (1-5) y Probabilidad (1-5)
- Total calculado: Impacto × Probabilidad
- Zona de riesgo calculada: E (Extremo), A (Alto), M (Moderado), B (Bajo)
- Estado: Identificado, Tratado, Asumido

### Treatment Plans (Planes de Tratamiento)
- Vinculado a un riesgo
- Salvaguardas y controles ISO 27002
- Dueño del riesgo y timeline
- Estado: Pendiente, En Progreso, Implementado

## Lógica de Negocio

### Matriz de Riesgo

La clasificación de zonas de riesgo sigue esta lógica:

- **Extremo (E)**: Total ≥ 20 O (Probabilidad=5 Y Impacto=4)
- **Alto (A)**: 9 ≤ Total < 20
- **Moderado (M)**: 3 ≤ Total < 9
- **Bajo (B)**: Total < 3

### Sugerencia Automática de Amenazas

El sistema sugiere amenazas según el dominio del activo:

- **Hardware (HW)**: Fallas eléctricas, Acceso no autorizado, Malware/Virus
- **Software (SW)**: Malware por software desactualizado, Uso no licenciado
- **Datos (D)**: Pérdida de datos, Acceso no autorizado, Fuga de datos, Alteración no autorizada
- **Físico/Utilitario (U)**: Daño por inundaciones, Robo físico

## Flujo de Trabajo

1. **Registrar Activos**: Agregar los activos de información del CEBE
2. **Diagnóstico**: Usar el wizard para identificar riesgos por activo
3. **Priorización**: Revisar riesgos en el módulo de Plan de Riesgos
4. **Tratamiento**: Crear planes para riesgos Extremos y Altos
5. **Seguimiento**: Actualizar estado de implementación
6. **Análisis**: Monitorear progreso en el Dashboard

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint

# Type checking
npm run typecheck
```

## Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Autenticación obligatoria para acceso al sistema
- Políticas de acceso configuradas para usuarios autenticados
- Contraseñas hasheadas con bcrypt
- Tokens JWT para sesiones

## Características de la Base de Datos

- **Campos Calculados**: `average_value`, `risk_total`, `risk_zone` se calculan automáticamente
- **Triggers**: `updated_at` se actualiza automáticamente
- **Constraints**: Validación de valores CIA (1-5), dominios, estados
- **Índices**: Optimización de consultas frecuentes
- **Integridad Referencial**: Cascadas en eliminación de activos

## Datos de Prueba Precargados

El sistema viene con datos de ejemplo:

- 10 activos variados (servidores, computadoras, software, datos)
- 10 amenazas comunes de ciberseguridad
- 10 riesgos identificados con diferentes niveles
- 6 planes de tratamiento en diversos estados

## Soporte

Para problemas o preguntas sobre el sistema, contactar al administrador del proyecto.

## Licencia

Sistema desarrollado específicamente para uso en Centros de Educación Básica Especial.
