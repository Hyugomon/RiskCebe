import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Brain, Bot, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Asset, CreateAsset, AssetDomain, DOMAIN_LABELS } from '../types/database';
import { aiSpecialist } from '../services/aiSpecialist';

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [formData, setFormData] = useState<CreateAsset>({
    name: '',
    owner: '',
    domain: 'HW',
    confidentiality_value: 3,
    integrity_value: 3,
    availability_value: 3,
    evidence: '',
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssets(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAsset) {
      const { error } = await supabase
        .from('assets')
        .update(formData)
        .eq('id', editingAsset.id);

      if (!error) {
        await loadAssets();
        closeModal();
      }
    } else {
      const { error } = await supabase.from('assets').insert([formData]);

      if (!error) {
        await loadAssets();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este activo?')) {
      const { error } = await supabase.from('assets').delete().eq('id', id);

      if (!error) {
        await loadAssets();
      }
    }
  };

  const openModal = (asset?: Asset) => {
    setAiReasoning(asset?.evidence || '');
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        owner: asset.owner,
        domain: asset.domain,
        confidentiality_value: asset.confidentiality_value,
        integrity_value: asset.integrity_value,
        availability_value: asset.availability_value,
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        owner: '',
        domain: 'HW',
        confidentiality_value: 3,
        integrity_value: 3,
        availability_value: 3,
        evidence: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAsset(null);
  };

  const handleAIDiagnosis = async () => {
    if (!formData.name || !formData.domain || !formData.owner) {
      alert("Por favor complete Nombre, Propietario y Dominio antes de solicitar el diagnóstico.");
      return;
    }
    setAiLoading(true);
    try {
      const result = await aiSpecialist.diagnoseAsset({
        name: formData.name,
        domain: formData.domain,
        owner: formData.owner,
      });
      setFormData({
        ...formData,
        confidentiality_value: result.confidentiality_value,
        integrity_value: result.integrity_value,
        availability_value: result.availability_value,
        evidence: result.reasoning
      });
      setAiReasoning(result.reasoning);
    } catch (e) {
      alert("Error al conectar con el especialista IA.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando activos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Activos</h2>
          <p className="text-slate-600 mt-1">Administre los activos de información del CEBE</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Activo
        </button>
      </div>

      {/* Assets table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Dominio
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  C
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  I
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  A
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{asset.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{asset.owner}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {DOMAIN_LABELS[asset.domain]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">
                    {asset.confidentiality_value}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">
                    {asset.integrity_value}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">
                    {asset.availability_value}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-medium text-slate-900">
                    {Number(asset.average_value).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => openModal(asset)}
                      className="inline-flex items-center text-slate-600 hover:text-slate-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="inline-flex items-center text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={closeModal} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingAsset ? 'Editar Activo' : 'Nuevo Activo'}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre del Activo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Propietario
                    </label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dominio
                    </label>
                    <select
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value as AssetDomain })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium text-slate-700">
                      Valoración CIA (1-5)
                    </p>
                    <button
                      type="button"
                      onClick={handleAIDiagnosis}
                      disabled={aiLoading}
                      className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-200"
                    >
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                      Autodiagnóstico IA
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">
                        Confidencialidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.confidentiality_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confidentiality_value: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">Integridad</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.integrity_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            integrity_value: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2">Disponibilidad</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.availability_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availability_value: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {aiReasoning && (
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex gap-2 mb-1">
                        <Brain className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-700">Evidencia del Especialista IA</span>
                      </div>
                      <p className="text-sm text-slate-600 italic whitespace-pre-wrap">
                        "{aiReasoning}"
                      </p>
                    </div>
                  )}
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
                    {editingAsset ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
