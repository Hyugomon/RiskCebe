import { useState, useEffect } from 'react';
import { X, FileText, Brain, Bot, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { aiSpecialist } from '../services/aiSpecialist';
import {
  RiskWithDetails,
  CreateTreatmentPlan,
  RiskZone,
  RISK_ZONE_LABELS,
  RISK_ZONE_COLORS,
  ImplementationStatus,
} from '../types/database';

export function RiskPlan() {
  const [risks, setRisks] = useState<RiskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterZone, setFilterZone] = useState<RiskZone | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskWithDetails | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEvidence, setAiEvidence] = useState('');
  const [formData, setFormData] = useState<CreateTreatmentPlan>({
    risk_id: '',
    safeguards: '',
    iso_27002_controls: '',
    risk_owner: '',
    timeline: '',
    implementation_status: 'Pendiente',
    evidence: '',
  });

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    const { data: risksData, error } = await supabase
      .from('risks')
      .select(`
        *,
        asset:assets(*),
        threat:threats(*),
        treatment_plan:treatment_plans(*)
      `)
      .order('risk_total', { ascending: false });

    if (!error && risksData) {
      const formattedRisks = risksData.map((risk: any) => ({
        ...risk,
        asset: Array.isArray(risk.asset) ? risk.asset[0] : risk.asset,
        threat: Array.isArray(risk.threat) ? risk.threat[0] : risk.threat,
        treatment_plan: Array.isArray(risk.treatment_plan)
          ? risk.treatment_plan[0]
          : risk.treatment_plan,
      }));
      setRisks(formattedRisks);
    }
    setLoading(false);
  };

  const filteredRisks =
    filterZone === 'all'
      ? risks
      : risks.filter((risk) => risk.risk_zone === filterZone);

  const openModal = (risk: RiskWithDetails) => {
    setSelectedRisk(risk);
    setAiEvidence(risk.treatment_plan?.evidence || '');

    if (risk.treatment_plan) {
      setFormData({
        risk_id: risk.id,
        safeguards: risk.treatment_plan.safeguards,
        iso_27002_controls: risk.treatment_plan.iso_27002_controls,
        risk_owner: risk.treatment_plan.risk_owner,
        timeline: risk.treatment_plan.timeline,
        implementation_status: risk.treatment_plan.implementation_status,
      });
    } else {
      setFormData({
        risk_id: risk.id,
        safeguards: '',
        iso_27002_controls: '',
        risk_owner: '',
        timeline: '',
        implementation_status: 'Pendiente',
        evidence: '',
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRisk(null);
  };

  const handleAIGeneratePlan = async () => {
    if (!selectedRisk) return;
    setAiLoading(true);
    try {
      const result = await aiSpecialist.generateRiskPlan({
        asset_name: selectedRisk.asset.name,
        threat_name: selectedRisk.threat.name,
        threat_description: selectedRisk.threat.description,
        impact_level: selectedRisk.impact_level,
        probability_level: selectedRisk.probability_level
      });

      setFormData({
        ...formData,
        safeguards: result.safeguards,
        iso_27002_controls: result.iso_controls,
        evidence: result.reasoning
      });
      setAiEvidence(result.reasoning);
    } catch (e) {
      alert("Error generating plan with AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRisk?.treatment_plan) {
      const { error } = await supabase
        .from('treatment_plans')
        .update({
          safeguards: formData.safeguards,
          iso_27002_controls: formData.iso_27002_controls,
          risk_owner: formData.risk_owner,
          timeline: formData.timeline,
          implementation_status: formData.implementation_status,
          evidence: formData.evidence
        })
        .eq('id', selectedRisk.treatment_plan.id);

      if (!error) {
        await loadRisks();
        closeModal();
      }
    } else {
      const { error } = await supabase.from('treatment_plans').insert([formData]);

      if (!error) {
        await loadRisks();
        closeModal();
      }
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Activo',
      'Amenaza',
      'Impacto',
      'Probabilidad',
      'Total',
      'Zona',
      'Estado',
      'Salvaguardas',
      'Controles ISO 27002',
      'Dueño del Riesgo',
      'Timeline',
      'Estado de Implementación',
    ];

    const rows = risks.map((risk) => [
      risk.asset.name,
      risk.threat.name,
      risk.impact_level,
      risk.probability_level,
      risk.risk_total,
      RISK_ZONE_LABELS[risk.risk_zone],
      risk.status,
      risk.treatment_plan?.safeguards || '',
      risk.treatment_plan?.iso_27002_controls || '',
      risk.treatment_plan?.risk_owner || '',
      risk.treatment_plan?.timeline || '',
      risk.treatment_plan?.implementation_status || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plan_riesgos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando riesgos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Plan de Tratamiento de Riesgos</h2>
          <p className="text-slate-600 mt-1">
            Gestione los planes de tratamiento para riesgos identificados
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Exportar a CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterZone('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterZone === 'all'
            ? 'bg-slate-900 text-white'
            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
        >
          Todos ({risks.length})
        </button>
        {(['E', 'A', 'M', 'B'] as RiskZone[]).map((zone) => (
          <button
            key={zone}
            onClick={() => setFilterZone(zone)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterZone === zone
              ? 'text-white'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            style={{
              backgroundColor: filterZone === zone ? RISK_ZONE_COLORS[zone] : undefined,
            }}
          >
            {RISK_ZONE_LABELS[zone]} ({risks.filter((r) => r.risk_zone === zone).length})
          </button>
        ))}
      </div>

      {/* Risks table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amenaza
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Impacto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Probabilidad
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado Plan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRisks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {risk.asset.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{risk.threat.name}</td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">
                    {risk.impact_level}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">
                    {risk.probability_level}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-slate-900">
                    {risk.risk_total}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: RISK_ZONE_COLORS[risk.risk_zone] }}
                    >
                      {RISK_ZONE_LABELS[risk.risk_zone]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {risk.treatment_plan ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.treatment_plan.implementation_status === 'Implementado'
                          ? 'bg-green-100 text-green-800'
                          : risk.treatment_plan.implementation_status === 'En Progreso'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-slate-100 text-slate-800'
                          }`}
                      >
                        {risk.treatment_plan.implementation_status}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Sin plan</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => openModal(risk)}
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      {risk.treatment_plan ? 'Editar Plan' : 'Crear Plan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Treatment Plan Modal */}
      {showModal && selectedRisk && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={closeModal} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Plan de Tratamiento de Riesgo
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedRisk.asset.name} - {selectedRisk.threat.name}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: RISK_ZONE_COLORS[selectedRisk.risk_zone] }}
                    >
                      Riesgo {RISK_ZONE_LABELS[selectedRisk.risk_zone]}
                    </span>
                    <span className="text-sm text-slate-600">
                      Total: {selectedRisk.risk_total} (Impacto: {selectedRisk.impact_level},
                      Probabilidad: {selectedRisk.probability_level})
                    </span>
                  </div>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Salvaguardas / Controles a Implementar
                    </label>
                    <button
                      type="button"
                      onClick={handleAIGeneratePlan}
                      disabled={aiLoading}
                      className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-200"
                    >
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                      Sugerir con IA
                    </button>
                  </div>
                  <textarea
                    value={formData.safeguards}
                    onChange={(e) => setFormData({ ...formData, safeguards: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Describa las salvaguardas y controles que se implementarán..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Controles ISO 27002
                  </label>
                  <input
                    type="text"
                    value={formData.iso_27002_controls}
                    onChange={(e) =>
                      setFormData({ ...formData, iso_27002_controls: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Ej: A.11.2.3, A.12.3.1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dueño del Riesgo
                    </label>
                    <input
                      type="text"
                      value={formData.risk_owner}
                      onChange={(e) => setFormData({ ...formData, risk_owner: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Persona responsable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estado de Implementación
                    </label>
                    <select
                      value={formData.implementation_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          implementation_status: e.target.value as ImplementationStatus,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Implementado">Implementado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Timeline de Implementación
                  </label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Ej: Octubre (adquisición), Noviembre (instalación)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {selectedRisk.treatment_plan ? 'Actualizar Plan' : 'Crear Plan'}
                  </button>
                </div>

                {aiEvidence && (
                  <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex gap-2 mb-1">
                      <Brain className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-700">Evidencia del Especialista IA</span>
                    </div>
                    <p className="text-sm text-slate-600 italic whitespace-pre-wrap">
                      "{aiEvidence}"
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
