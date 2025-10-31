import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Package, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RiskWithDetails, RISK_ZONE_LABELS, RISK_ZONE_COLORS, RiskZone } from '../types/database';

interface Stats {
  totalAssets: number;
  totalRisks: number;
  criticalRisks: number;
  riskDistribution: Record<RiskZone, number>;
  implementationStatus: Record<string, number>;
  topRisks: RiskWithDetails[];
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    totalRisks: 0,
    criticalRisks: 0,
    riskDistribution: { E: 0, A: 0, M: 0, B: 0 },
    implementationStatus: { Pendiente: 0, 'En Progreso': 0, Implementado: 0 },
    topRisks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    const [assetsResult, risksResult, treatmentPlansResult] = await Promise.all([
      supabase.from('assets').select('id'),
      supabase
        .from('risks')
        .select(
          `
        *,
        asset:assets(*),
        threat:threats(*)
      `
        )
        .order('risk_total', { ascending: false }),
      supabase.from('treatment_plans').select('implementation_status'),
    ]);

    const totalAssets = assetsResult.data?.length || 0;
    const risks = risksResult.data || [];
    const treatmentPlans = treatmentPlansResult.data || [];

    const formattedRisks: RiskWithDetails[] = risks.map((risk: any) => ({
      ...risk,
      asset: Array.isArray(risk.asset) ? risk.asset[0] : risk.asset,
      threat: Array.isArray(risk.threat) ? risk.threat[0] : risk.threat,
    }));

    const totalRisks = formattedRisks.length;
    const criticalRisks = formattedRisks.filter(
      (r) => r.risk_zone === 'E' || r.risk_zone === 'A'
    ).length;

    const riskDistribution = formattedRisks.reduce(
      (acc, risk) => {
        acc[risk.risk_zone]++;
        return acc;
      },
      { E: 0, A: 0, M: 0, B: 0 } as Record<RiskZone, number>
    );

    const implementationStatus = treatmentPlans.reduce(
      (acc, plan) => {
        acc[plan.implementation_status]++;
        return acc;
      },
      { Pendiente: 0, 'En Progreso': 0, Implementado: 0 } as Record<string, number>
    );

    const topRisks = formattedRisks.slice(0, 5);

    setStats({
      totalAssets,
      totalRisks,
      criticalRisks,
      riskDistribution,
      implementationStatus,
      topRisks,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando dashboard...</div>
      </div>
    );
  }

  const riskDistributionTotal = Object.values(stats.riskDistribution).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard de Riesgos</h2>
        <p className="text-slate-600 mt-1">
          Vista general del estado de riesgos de ciberseguridad
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Activos</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalAssets}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Riesgos</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRisks}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Riesgos Críticos</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalRisks}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Extremos y Altos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Planes Implementados</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.implementationStatus.Implementado}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            De {Object.values(stats.implementationStatus).reduce((sum, val) => sum + val, 0)}{' '}
            planes
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Distribución de Riesgos por Zona
          </h3>
          <div className="space-y-4">
            {(['E', 'A', 'M', 'B'] as RiskZone[]).map((zone) => {
              const count = stats.riskDistribution[zone];
              const percentage =
                riskDistributionTotal > 0 ? (count / riskDistributionTotal) * 100 : 0;

              return (
                <div key={zone}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {RISK_ZONE_LABELS[zone]}
                    </span>
                    <span className="text-sm text-slate-600">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: RISK_ZONE_COLORS[zone],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pie chart visualization */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {(() => {
                  let currentAngle = 0;
                  return (['E', 'A', 'M', 'B'] as RiskZone[]).map((zone) => {
                    const count = stats.riskDistribution[zone];
                    const percentage =
                      riskDistributionTotal > 0 ? (count / riskDistributionTotal) * 100 : 0;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;

                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;

                    return count > 0 ? (
                      <path
                        key={zone}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={RISK_ZONE_COLORS[zone]}
                        opacity="0.9"
                      />
                    ) : null;
                  });
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* Implementation Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Estado de Implementación de Controles
          </h3>
          <div className="space-y-6">
            {Object.entries(stats.implementationStatus).map(([status, count]) => {
              const total = Object.values(stats.implementationStatus).reduce(
                (sum, val) => sum + val,
                0
              );
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const color =
                status === 'Implementado'
                  ? '#16a34a'
                  : status === 'En Progreso'
                  ? '#ca8a04'
                  : '#64748b';

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{status}</span>
                    <span className="text-sm text-slate-600">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar chart visualization */}
          <div className="mt-6 flex items-end justify-around h-40">
            {Object.entries(stats.implementationStatus).map(([status, count]) => {
              const total = Object.values(stats.implementationStatus).reduce(
                (sum, val) => sum + val,
                0
              );
              const height = total > 0 ? (count / total) * 100 : 0;
              const color =
                status === 'Implementado'
                  ? '#16a34a'
                  : status === 'En Progreso'
                  ? '#ca8a04'
                  : '#64748b';

              return (
                <div key={status} className="flex flex-col items-center gap-2">
                  <div className="text-sm font-bold text-slate-900">{count}</div>
                  <div
                    className="w-16 rounded-t transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      backgroundColor: color,
                      minHeight: count > 0 ? '20px' : '0',
                    }}
                  />
                  <div className="text-xs text-slate-600 text-center w-20">{status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 5 Critical Risks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Riesgos Críticos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Activo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Amenaza
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                  Zona
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats.topRisks.map((risk, index) => (
                <tr key={risk.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {risk.asset.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{risk.threat.name}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-slate-900">
                    {risk.risk_total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: RISK_ZONE_COLORS[risk.risk_zone] }}
                    >
                      {RISK_ZONE_LABELS[risk.risk_zone]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
