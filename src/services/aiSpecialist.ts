
import { callAI } from '../lib/ai';
import { supabase } from '../lib/supabase';

// Interfaces based on DB Schema
export interface Asset {
    id?: string;
    name: string;
    domain: 'HW' | 'SW' | 'D' | 'U';
    owner: string;
}

export interface AssessmentResult {
    confidentiality_value: number;
    integrity_value: number;
    availability_value: number;
    reasoning: string;
}

export interface RiskContext {
    asset_name: string;
    threat_name: string;
    threat_description: string;
    impact_level: number;
    probability_level: number;
}

export interface TreatmentPlanSuggestion {
    safeguards: string;
    iso_controls: string;
    reasoning: string;
}

export interface RiskEvaluation {
    threat_name: string;
    impact_level: number;
    probability_level: number;
    reasoning?: string;
}


export const aiSpecialist = {

    async diagnoseAsset(asset: Asset): Promise<AssessmentResult> {
        const systemPrompt = `Eres un experto Auditor ISO 27001 y Especialista en Riesgos.
Tu tarea es analizar un Activo Organizacional y asignar valores de Confidencialidad, Integridad y Disponibilidad (CID) (1-5) basados en su criticidad.

IMPORTANTE: TODO EL CONTENIDO DEBE ESTAR EN ESPAÑOL. Solo los términos técnicos estándar pueden mantenerse en inglés si es necesario.

Valores:
1: Bajo/Público
5: Crítico/Top Secret

Formato de salida JSON (NO uses markdown, solo JSON crudo):
{
  "confidentiality_value": number,
  "integrity_value": number,
  "availability_value": number,
  "reasoning": "Explicación detallada de por qué se asignaron estos valores, citando principios de seguridad. (EN ESPAÑOL)"
}
`;

        const userPrompt = `Asset Name: ${asset.name}
Domain: ${asset.domain}
Owner: ${asset.owner}

Please diagnose this asset and assign CIA values.`;

        const responseText = await callAI(systemPrompt, userPrompt);

        // Log the interaction
        await logInteraction('diagnoseAsset', userPrompt, responseText);

        try {
            // Cleaning potential markdown code blocks
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse AI response", e);
            return {
                confidentiality_value: 3,
                integrity_value: 3,
                availability_value: 3,
                reasoning: "AI Parsing Error. Defaulting to medium values. Raw response: " + responseText
            };
        }
    },

    async generateRiskPlan(risk: RiskContext): Promise<TreatmentPlanSuggestion> {
        const systemPrompt = `Eres un experto Gerente de Riesgos de Ciberseguridad utilizando los estándares ISO 27005 e ISO 27002.
Tu tarea es proponer un Plan de Tratamiento de Riesgos para un Riesgo específico (Activo + Amenaza).

IMPORTANTE: TODO EL CONTENIDO DEBE ESTAR EN ESPAÑOL. Solo los términos técnicos estándar pueden mantenerse en inglés si es necesario.

Debes proporcionar:
1. Salvaguardas: Medidas técnicas o administrativas específicas.
2. Controles ISO 27002: Controles específicos (ej. A.5.15, A.12.3) que apliquen.
3. Razonamiento: Por qué este tratamiento es apropiado.

Formato de salida JSON (NO uses markdown, solo JSON crudo):
{
  "safeguards": "Lista de salvaguardas (EN ESPAÑOL)...",
  "iso_controls": "Lista de controles ISO...",
  "reasoning": "Explicación... (EN ESPAÑOL)"
}
`;

        const userPrompt = `Risk Scenario:
Asset: ${risk.asset_name}
Threat: ${risk.threat_name} (${risk.threat_description})
Current Impact: ${risk.impact_level}
Current Probability: ${risk.probability_level}

Propose a treatment plan.`;

        const responseText = await callAI(systemPrompt, userPrompt);

        // Log
        await logInteraction('generateRiskPlan', userPrompt, responseText);

        try {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error", e);
            return {
                safeguards: "Error parsing AI suggestion.",
                iso_controls: "",
                reasoning: responseText
            };
        }
    },

    async assessRisks(asset: Asset, availableThreats: string[]): Promise<RiskEvaluation[]> {
        const systemPrompt = `Eres un experto Gerente de Riesgos de Ciberseguridad.
Tu tarea es identificar cuáles de las amenazas proporcionadas son relevantes para un Activo específico y asignar valores de Impacto y Probabilidad (1-5).

IMPORTANTE: TODO EL CONTENIDO DEBE ESTAR EN ESPAÑOL.

Entradas:
Asset Name: ${asset.name}
Asset Domain: ${asset.domain}
Available Threats: ${availableThreats.join(', ')}

Debes devolver un JSON con un array de objetos "evaluations". Solo incluye las amenazas que sean RELEVANTES (Probabilidad > 1).
Formato JSON:
{
  "evaluations": [
    {
      "threat_name": "Nombre exacto de la amenaza de la lista",
      "impact_level": number, // 1-5
      "probability_level": number, // 1-5
      "reasoning": "Breve justificación"
    }
  ]
}
`;

        const userPrompt = `Analiza el activo "${asset.name}" y determina los riesgos relevantes de la lista proporcionada.`;

        const responseText = await callAI(systemPrompt, userPrompt);
        await logInteraction('assessRisks', userPrompt, responseText);

        try {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);
            return data.evaluations || [];
        } catch (e) {
            console.error("JSON Parse Error in assessRisks", e);
            return [];
        }
    }
};


async function logInteraction(func: string, prompt: string, response: string) {
    const { error } = await supabase.from('ai_logs').insert({
        function_name: func,
        prompt: prompt,
        response: response,
        model_used: 'models/gemini-3-flash-preview'
    });
    if (error) console.error("Failed to log AI interaction", error);
}
