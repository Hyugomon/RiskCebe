import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  Asset,
  Threat,
  CreateRisk,
  THREAT_SUGGESTIONS,
  IMPACT_LABELS,
  PROBABILITY_LABELS,
} from '../types/database';

type Step = 1 | 2 | 3;

interface ThreatSelection {
  threat: Threat;
  selected: boolean;
}

interface RiskEvaluation {
  threat_id: string;
  threat_name: string;
  impact_level: number;
  probability_level: number;
}

export function Diagnostic() {
  const [step, setStep] = useState<Step>(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedThreats, setSelectedThreats] = useState<ThreatSelection[]>([]);
  const [riskEvaluations, setRiskEvaluations] = useState<RiskEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadAssets();
    loadThreats();
  }, []);

  const loadAssets = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('name');

    if (!error && data) {
      setAssets(data);
    }
  };

  const loadThreats = async () => {
    const { data, error } = await supabase
      .from('threats')
      .select('*')
      .order('name');

    if (!error && data) {
      setThreats(data);
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);

    const suggestedThreatNames = THREAT_SUGGESTIONS[asset.domain] || [];
    const suggestedThreats = threats.filter((t) =>
      suggestedThreatNames.includes(t.name)
    );

    const otherThreats = threats.filter(
      (t) => !suggestedThreatNames.includes(t.name)
    );

    setSelectedThreats([
      ...suggestedThreats.map((t) => ({ threat: t, selected: true })),
      ...otherThreats.map((t) => ({ threat: t, selected: false })),
    ]);
  };

  const toggleThreat = (index: number) => {
    const updated = [...selectedThreats];
    updated[index].selected = !updated[index].selected;
    setSelectedThreats(updated);
  };

  const initializeRiskEvaluations = () => {
    const evaluations: RiskEvaluation[] = selectedThreats
      .filter((st) => st.selected)
      .map((st) => ({
        threat_id: st.threat.id,
        threat_name: st.threat.name,
        impact_level: 3,
        probability_level: 3,
      }));

    setRiskEvaluations(evaluations);
  };

  const updateRiskEvaluation = (
    index: number,
    field: 'impact_level' | 'probability_level',
    value: number
  ) => {
    const updated = [...riskEvaluations];
    updated[index][field] = value;
    setRiskEvaluations(updated);
  };

  const handleNext = () => {
    if (step === 1 && selectedAsset) {
      setStep(2);
    } else if (step === 2) {
      initializeRiskEvaluations();
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAsset) return;

    setLoading(true);

    const risksToCreate: CreateRisk[] = riskEvaluations.map((evaluation) => ({
      asset_id: selectedAsset.id,
      threat_id: evaluation.threat_id,
      impact_level: evaluation.impact_level,
      probability_level: evaluation.probability_level,
      status: 'Identificado',
    }));

    const { error } = await supabase.from('risks').insert(risksToCreate);

    if (!error) {
      setCompleted(true);
    }

    setLoading(false);
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedAsset(null);
    setSelectedThreats([]);
    setRiskEvaluations([]);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Diagnóstico Completado
          </h2>
          <p className="text-slate-600 mb-6">
            Se han identificado {riskEvaluations.length} riesgo(s) para el activo{' '}
            <strong>{selectedAsset?.name}</strong>
          </p>
          <button
            onClick={resetWizard}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Realizar Otro Diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-slate-900' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-slate-600">Seleccionar Activo</span>
          <span className="text-sm text-slate-600">Identificar Amenazas</span>
          <span className="text-sm text-slate-600">Evaluar Riesgo</span>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Step 1: Asset Selection */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Paso 1: Seleccione un Activo
            </h3>
            <p className="text-slate-600 mb-6">
              Elija el activo de información que desea evaluar
            </p>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleAssetSelect(asset)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedAsset?.id === asset.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{asset.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Propietario: {asset.owner} | Valor promedio:{' '}
                    {Number(asset.average_value).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Threat Identification */}
        {step === 2 && selectedAsset && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Paso 2: Identificar Amenazas
            </h3>
            <p className="text-slate-600 mb-2">
              Activo seleccionado: <strong>{selectedAsset.name}</strong>
            </p>
            <p className="text-slate-600 mb-6">
              Las amenazas sugeridas están preseleccionadas según el tipo de activo. Puede
              modificar la selección según sea necesario.
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedThreats.map((st, index) => (
                <label
                  key={st.threat.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={st.selected}
                    onChange={() => toggleThreat(index)}
                    className="mt-1 w-4 h-4 text-slate-900 rounded focus:ring-slate-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{st.threat.name}</div>
                    {st.threat.description && (
                      <div className="text-sm text-slate-600 mt-1">
                        {st.threat.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Risk Evaluation */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Paso 3: Evaluar Riesgo
            </h3>
            <p className="text-slate-600 mb-6">
              Para cada amenaza, evalúe el nivel de impacto y probabilidad
            </p>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {riskEvaluations.map((evaluation, index) => (
                <div key={evaluation.threat_id} className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-4">{evaluation.threat_name}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Impacto
                      </label>
                      <select
                        value={evaluation.impact_level}
                        onChange={(e) =>
                          updateRiskEvaluation(index, 'impact_level', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      >
                        {IMPACT_LABELS.map((label) => (
                          <option key={label.value} value={label.value}>
                            [{label.value}] {label.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Probabilidad
                      </label>
                      <select
                        value={evaluation.probability_level}
                        onChange={(e) =>
                          updateRiskEvaluation(
                            index,
                            'probability_level',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      >
                        {PROBABILITY_LABELS.map((label) => (
                          <option key={label.value} value={label.value}>
                            [{label.value}] {label.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedAsset) ||
                (step === 2 && !selectedThreats.some((st) => st.selected))
              }
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Finalizar Diagnóstico'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
