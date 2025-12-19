import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Save, AlertTriangle, CheckCircle, Bot, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { aiSpecialist } from '../services/aiSpecialist';
import {
    Asset,
    RiskZone,
    RISK_ZONE_LABELS,
    RISK_ZONE_COLORS,
    ImplementationStatus
} from '../types/database';

// Helper to calculate risk zone
const calculateRiskZone = (total: number): RiskZone => {
    if (total >= 20) return 'E';
    if (total >= 13) return 'A';
    if (total >= 6) return 'M';
    return 'B';
};

const STEPS = [
    { id: 1, title: 'Valoración de Activo', description: 'Definir el impacto' },
    { id: 2, title: 'Identificar Amenaza', description: 'Evaluar probabilidad' },
    { id: 3, title: 'Matriz de Riesgo', description: 'Visualizar el riesgo inicial' },
    { id: 4, title: 'Plan de Tratamiento', description: 'Definir controles' },
    { id: 5, title: 'Riesgo Residual', description: 'Re-evaluación post-control' },
];

export function RiskWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [aiLoading, setAiLoading] = useState(false);

    // Wizard State
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [impactValue, setImpactValue] = useState<number>(0);

    const [threatName, setThreatName] = useState('');
    const [probabilityValue, setProbabilityValue] = useState<number>(1);
    const [riskTotal, setRiskTotal] = useState<number>(0);

    const [safeguards, setSafeguards] = useState('');
    const [isoControls, setIsoControls] = useState('');
    const [riskOwner, setRiskOwner] = useState('');
    const [timeline, setTimeline] = useState('');
    const [status, setStatus] = useState<ImplementationStatus>('Pendiente');
    const [aiEvidence, setAiEvidence] = useState('');

    const [newProbability, setNewProbability] = useState<number>(1);
    const [residualTotal, setResidualTotal] = useState<number>(0);

    useEffect(() => {
        loadAssets();
    }, []);

    // Update calculations when dependencies change
    useEffect(() => {
        if (selectedAsset) {
            // Logic: Impact is the MAX of C, I, A
            const maxVal = Math.max(
                selectedAsset.confidentiality_value,
                selectedAsset.integrity_value,
                selectedAsset.availability_value
            );
            setImpactValue(maxVal);
        }
    }, [selectedAsset]);

    useEffect(() => {
        setRiskTotal(impactValue * probabilityValue);
    }, [impactValue, probabilityValue]);

    useEffect(() => {
        // Residual Risk: Impact usually stays same, Probability changes
        setResidualTotal(impactValue * newProbability);
    }, [impactValue, newProbability]);

    const loadAssets = async () => {
        const { data } = await supabase.from('assets').select('*');
        if (data) setAssets(data);
    };

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(c => c + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleSave = async () => {
        if (!selectedAsset || !threatName) return;

        setLoading(true);
        try {
            // 1. Create Risk
            const { data: riskData, error: riskError } = await supabase
                .from('risks')
                .insert([{
                    asset_id: selectedAsset.id,
                    threat: { name: threatName, description: 'Identified via Wizard' },
                    impact_level: impactValue,
                    probability_level: probabilityValue,
                    risk_total: riskTotal,
                    risk_zone: calculateRiskZone(riskTotal),
                    status: 'Identificado'
                }])
                .select()
                .single();

            if (riskError) throw riskError;

            // 2. Create Treatment Plan
            const { error: planError } = await supabase
                .from('treatment_plans')
                .insert([{
                    risk_id: riskData.id,
                    safeguards,
                    iso_27002_controls: isoControls,
                    risk_owner: riskOwner,
                    timeline,
                    implementation_status: status,
                    evidence: aiEvidence,
                    residual_probability_level: newProbability,
                    residual_impact_level: impactValue,
                    residual_risk_total: residualTotal,
                    residual_risk_zone: calculateRiskZone(residualTotal)
                }]);

            if (planError) throw planError;

            alert('Riesgo gestionado exitosamente!');
            // Reset or navigate away (optional)
            // window.location.href = '/risks';
        } catch (e) {
            console.error(e);
            alert('Error guardando el riesgo. Verifique la conexión o contacte al administrador.');
        } finally {
            setLoading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!selectedAsset) return;
        setAiLoading(true);
        try {
            // Mocking the call or using the real service if available
            const result = await aiSpecialist.generateRiskPlan({
                asset_name: selectedAsset.name,
                threat_name: threatName || 'Amenaza Genérica',
                threat_description: 'Generado via Wizard',
                impact_level: impactValue,
                probability_level: probabilityValue
            });
            setSafeguards(result.safeguards);
            setIsoControls(result.iso_controls);
            setAiEvidence(result.reasoning);
        } catch (e) {
            console.error(e);
            // Fallback or alert
        } finally {
            setAiLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Selecciona el Activo</h3>
                <select
                    className="w-full p-3 rounded-lg border border-slate-300"
                    onChange={(e) => setSelectedAsset(assets.find(a => a.id === e.target.value) || null)}
                    value={selectedAsset?.id || ''}
                >
                    <option value="">-- Seleccionar --</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>

            {selectedAsset && (
                <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg text-center ${selectedAsset.confidentiality_value === impactValue ? 'bg-red-50 border-2 border-red-500' : 'bg-white border'}`}>
                        <div className="text-sm text-slate-500">Confidencialidad</div>
                        <div className="text-2xl font-bold">{selectedAsset.confidentiality_value}</div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${selectedAsset.integrity_value === impactValue ? 'bg-red-50 border-2 border-red-500' : 'bg-white border'}`}>
                        <div className="text-sm text-slate-500">Integridad</div>
                        <div className="text-2xl font-bold">{selectedAsset.integrity_value}</div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${selectedAsset.availability_value === impactValue ? 'bg-red-50 border-2 border-red-500' : 'bg-white border'}`}>
                        <div className="text-sm text-slate-500">Disponibilidad</div>
                        <div className="text-2xl font-bold">{selectedAsset.availability_value}</div>
                    </div>
                </div>
            )}

            {selectedAsset && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center gap-3">
                    <AlertTriangle className="text-blue-600 w-6 h-6" />
                    <div>
                        <div className="font-semibold text-blue-900">Impacto Definido: {impactValue}</div>
                        <div className="text-sm text-blue-700">Tomamos el valor más alto (Criterio del "Peor Escenario")</div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">¿Cuál es la amenaza?</label>
                <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-slate-300"
                    placeholder="Ej: Ransomware, Acceso no autorizado..."
                    value={threatName}
                    onChange={e => setThreatName(e.target.value)}
                />
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-4">
                    Probabilidad de Ocurrencia (1-5)
                </label>
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={probabilityValue}
                    onChange={e => setProbabilityValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>1 (Raro)</span>
                    <span>5 (Muy Probable)</span>
                </div>
                <div className="mt-4 text-center font-bold text-3xl text-slate-800">
                    {probabilityValue}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => {
        const zone = calculateRiskZone(riskTotal);
        const color = RISK_ZONE_COLORS[zone];
        const label = RISK_ZONE_LABELS[zone];

        return (
            <div className="space-y-6 animate-fadeIn text-center">
                <h3 className="text-xl font-bold">Cálculo de Riesgo</h3>

                <div className="flex items-center justify-center gap-8 text-2xl font-bold text-slate-700">
                    <div className="text-center">
                        <div className="text-sm font-normal text-slate-500">Impacto</div>
                        {impactValue}
                    </div>
                    <div className="text-slate-300">×</div>
                    <div className="text-center">
                        <div className="text-sm font-normal text-slate-500">Probabilidad</div>
                        {probabilityValue}
                    </div>
                    <div className="text-slate-300">=</div>
                    <div className="text-center">
                        <div className="text-sm font-normal text-slate-500">Riesgo Total</div>
                        <span style={{ color }}>{riskTotal}</span>
                    </div>
                </div>

                <div className="max-w-md mx-auto p-6 rounded-xl border-4" style={{ borderColor: color, backgroundColor: `${color}10` }}>
                    <div className="text-3xl font-black uppercase mb-2" style={{ color }}>{label}</div>
                    <p className="text-slate-600">
                        Este nivel de riesgo requiere {zone === 'E' || zone === 'A' ? 'acción inmediata' : 'monitoreo'}.
                    </p>
                </div>
            </div>
        );
    };

    const renderStep4 = () => (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Definir Controles</h3>
                <button
                    onClick={handleAIGenerate}
                    disabled={aiLoading}
                    className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 border border-indigo-200"
                >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    Sugerir con IA
                </button>
            </div>

            <textarea
                className="w-full p-3 rounded-lg border border-slate-300"
                rows={4}
                placeholder="¿Qué vamos a hacer? (Ej: Instalar Antivirus)"
                value={safeguards}
                onChange={e => setSafeguards(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
                <input
                    className="p-3 rounded-lg border border-slate-300"
                    placeholder="Dueño del Riesgo (Ej: Gerente RRHH)"
                    value={riskOwner}
                    onChange={e => setRiskOwner(e.target.value)}
                />
                <input
                    className="p-3 rounded-lg border border-slate-300"
                    placeholder="Timeline (Ej: Q4 2024)"
                    value={timeline}
                    onChange={e => setTimeline(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input
                    className="p-3 rounded-lg border border-slate-300"
                    placeholder="Controles ISO (Ej: A.12.1.1)"
                    value={isoControls}
                    onChange={e => setIsoControls(e.target.value)}
                />
                <select
                    className="p-3 rounded-lg border border-slate-300"
                    value={status}
                    onChange={e => setStatus(e.target.value as ImplementationStatus)}
                >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Implementado">Implementado</option>
                </select>
            </div>
        </div>
    );

    const renderStep5 = () => {
        const oldZone = calculateRiskZone(riskTotal);
        const newZone = calculateRiskZone(residualTotal);

        return (
            <div className="space-y-8 animate-fadeIn">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">Re-evaluación del Riesgo Residual</h3>
                    <p className="text-slate-600 text-sm mb-6">
                        Después de implementar los controles, el Impacto (4) permanece igual (los datos siguen siendo confidenciales),
                        pero la <strong>Probabilidad</strong> debería bajar.
                    </p>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nueva Probabilidad Estimada
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={newProbability}
                        onChange={e => setNewProbability(parseInt(e.target.value))}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center font-bold text-2xl text-green-700 mt-2">{newProbability}</div>
                </div>

                <div className="grid grid-cols-2 gap-8 items-center">
                    <div className="text-center opacity-50">
                        <div className="text-sm uppercase font-bold text-slate-500">Antes</div>
                        <div className="text-4xl font-black" style={{ color: RISK_ZONE_COLORS[oldZone] }}>{riskTotal}</div>
                        <div className="text-xs">{RISK_ZONE_LABELS[oldZone]}</div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowRight className="w-8 h-8 text-slate-300" />
                    </div>

                    <div className="text-center transform scale-110 transition-transform">
                        <div className="text-sm uppercase font-bold text-slate-500">Después</div>
                        <div className="text-5xl font-black" style={{ color: RISK_ZONE_COLORS[newZone] }}>{residualTotal}</div>
                        <div className="text-xs font-bold" style={{ color: RISK_ZONE_COLORS[newZone] }}>{RISK_ZONE_LABELS[newZone]}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Stepper */}
            <div className="flex justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`flex flex-col items-center bg-white px-2 ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${currentStep === step.id ? 'bg-slate-900 text-white' :
                                currentStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                        </div>
                        <div className="text-xs font-semibold text-slate-900">{step.title}</div>
                        <div className="text-[10px] text-slate-500 hide-below-sm">{step.description}</div>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px]">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{STEPS[currentStep - 1].title}</h2>

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Anterior
                </button>

                {currentStep < 5 ? (
                    <button
                        onClick={handleNext}
                        disabled={!selectedAsset || (currentStep === 2 && !threatName)}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                        Siguiente
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Completar Plan
                    </button>
                )}
            </div>
        </div>
    );
}
