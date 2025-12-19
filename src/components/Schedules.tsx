
import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Schedule {
    id: string;
    title: string;
    description: string;
    audit_date: string;
    status: 'Pendiente' | 'Coordinado' | 'Realizado' | 'Cancelado';
    coordinator_notes: string;
    created_at: string;
}

interface CreateSchedule {
    title: string;
    description: string;
    audit_date: string;
    status: 'Pendiente' | 'Coordinado' | 'Realizado' | 'Cancelado';
    coordinator_notes: string;
}

export function Schedules() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [formData, setFormData] = useState<CreateSchedule>({
        title: '',
        description: '',
        audit_date: '',
        status: 'Pendiente',
        coordinator_notes: ''
    });

    useEffect(() => {
        loadSchedules();
        loadTreatmentPlans();
    }, []);

    const loadSchedules = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('schedules')
            .select('*')
            .order('audit_date', { ascending: true });

        if (!error && data) {
            setSchedules(data);
        }
        setLoading(false);
    };

    const loadTreatmentPlans = async () => {
        const { data, error } = await supabase
            .from('treatment_plans')
            .select(`
                *,
                risks (
                    assets (name),
                    threats (name)
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTreatmentPlans(data);
        }
    };

    const openModal = (schedule?: Schedule) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                title: schedule.title,
                description: schedule.description || '',
                audit_date: schedule.audit_date.split('T')[0], // Assuming ISO
                status: schedule.status,
                coordinator_notes: schedule.coordinator_notes || ''
            });
        } else {
            setEditingSchedule(null);
            setFormData({
                title: '',
                description: '',
                audit_date: '',
                status: 'Pendiente',
                coordinator_notes: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSchedule(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSchedule) {
            const { error } = await supabase
                .from('schedules')
                .update(formData)
                .eq('id', editingSchedule.id);

            if (!error) {
                await loadSchedules();
                closeModal();
            }
        } else {
            const { error } = await supabase
                .from('schedules')
                .insert([formData]);

            if (!error) {
                await loadSchedules();
                closeModal();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar este evento?')) {
            const { error } = await supabase.from('schedules').delete().eq('id', id);
            if (!error) await loadSchedules();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Realizado': return 'bg-green-100 text-green-800';
            case 'Coordinado': return 'bg-blue-100 text-blue-800';
            case 'Cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) return <div className="p-8 text-center flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Section 1: Auditorías y Coordinación */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Coordinación y Cronograma</h2>
                        <p className="text-slate-600 mt-1">Gestión de auditorías y actividades con Dirección Educativa</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Agendar Actividad
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {schedules.map(schedule => (
                        <div key={schedule.id} className="bg-white p-5 rounded-lg shadow border border-slate-200 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(schedule.audit_date).toLocaleDateString()}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}>
                                    {schedule.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{schedule.title}</h3>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {schedule.description || "Sin descripción"}
                            </p>
                            {schedule.coordinator_notes && (
                                <div className="mb-4 bg-slate-50 p-2 rounded text-xs text-slate-500">
                                    <strong>Notas:</strong> {schedule.coordinator_notes}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button onClick={() => openModal(schedule)} className="text-slate-400 hover:text-slate-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(schedule.id)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {schedules.length === 0 && (
                        <div className="col-span-full text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            No hay actividades programadas.
                        </div>
                    )}
                </div>
            </div>

            {/* Section 2: Seguimiento de Planes de Tratamiento */}
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Seguimiento de Planes de Tratamiento</h2>
                    <p className="text-slate-600 mt-1">Sincronización con planes de riesgo activos</p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                            <tr>
                                <th className="px-6 py-4">Activo / Amenaza</th>
                                <th className="px-6 py-4">Responsable</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Salvaguardas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {treatmentPlans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{plan.risks?.assets?.name || 'Desconocido'}</div>
                                        <div className="text-xs text-slate-500">{plan.risks?.threats?.name || 'Amenaza desconocida'}</div>
                                    </td>
                                    <td className="px-6 py-4">{plan.risk_owner}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{plan.timeline}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.implementation_status === 'Implementado' ? 'bg-green-100 text-green-800' :
                                            plan.implementation_status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {plan.implementation_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={plan.safeguards}>
                                        {plan.safeguards}
                                    </td>
                                </tr>
                            ))}
                            {treatmentPlans.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No hay planes de tratamiento registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black opacity-30" onClick={closeModal} />
                        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingSchedule ? 'Editar Actividad' : 'Nueva Actividad'}
                                </h3>
                                <button onClick={closeModal}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                                        value={formData.audit_date}
                                        onChange={e => setFormData({ ...formData, audit_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Coordinado">Coordinado</option>
                                        <option value="Realizado">Realizado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vincular con Plan de Tratamiento (Opcional)</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 bg-slate-50"
                                        onChange={(e) => {
                                            const planId = e.target.value;
                                            if (!planId) return;

                                            // Find selected plan
                                            const plan = treatmentPlans.find(p => p.id === planId);
                                            if (plan) {
                                                setFormData({
                                                    ...formData,
                                                    title: formData.title || `Gestión Riesgo: ${plan.risks?.assets?.name}`,
                                                    description: (formData.description ? formData.description + '\n\n' : '') +
                                                        `**Contexto de Riesgo**\nActivo: ${plan.risks?.assets?.name}\nAmenaza: ${plan.risks?.threats?.name}\nSalvaguarda: ${plan.safeguards}\nEstado Plan: ${plan.implementation_status}`,
                                                    coordinator_notes: (formData.coordinator_notes ? formData.coordinator_notes + '\n' : '') +
                                                        `Responsable: ${plan.risk_owner} | Timeline: ${plan.timeline}`
                                                });
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="">-- Seleccionar Plan para auto-completar --</option>
                                        {treatmentPlans.map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.risks?.assets?.name} - {plan.risks?.threats?.name} ({plan.implementation_status})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Seleccionar un plan completará automáticamente los campos de título y descripción.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notas de Coordinación</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500"
                                        rows={2}
                                        value={formData.coordinator_notes}
                                        onChange={e => setFormData({ ...formData, coordinator_notes: e.target.value })}
                                        placeholder="Detalles de coordinación con Dirección Educativa..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-50 border rounded-lg">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
