"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList, RefreshCw, Users } from "lucide-react";
import { registroApi, RegistroListado } from "@/lib/registro-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-4xl font-black tracking-tight text-slate-950">{value}</p>
    </article>
  );
}

function RecentRow({ registro }: { registro: RegistroListado }) {
  const usuario = registro.usuario?.replace(`${registro.r_cedula} - `, "") || "Sin usuario";

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-4 font-semibold text-slate-800">{registro.r_cedula || "Sin cédula"}</td>
      <td className="px-4 py-4 font-semibold text-slate-800">{usuario}</td>
      <td className="px-4 py-4 text-slate-600">
        <p>{registro.provincia_nombre || "Sin provincia"}</p>
        <p className="mt-1 text-xs text-slate-500">
          {[registro.canton_nombre, registro.barrio_nombre].filter(Boolean).join(" · ") || "Sin ubicación"}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(registro.r_fecha)}</td>
      <td className="px-4 py-4 font-semibold text-slate-800">{registro.registrador_nombre || "Sin registrador"}</td>
    </tr>
  );
}

export function MetricasDashboard() {
  const registros = useQuery({
    queryKey: ["registros"],
    queryFn: registroApi.listar,
  });

  if (registros.isLoading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Cargando métricas...</div>;
  }

  if (registros.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-bold text-red-800">No se pudieron cargar las métricas.</p>
        <button
          type="button"
          onClick={() => registros.refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
        >
          <RefreshCw className="size-4" /> Reintentar
        </button>
      </div>
    );
  }

  const allRecords = registros.data ?? [];
  const recentRecords = [...allRecords]
    .sort((a, b) => new Date(b.r_fecha).getTime() - new Date(a.r_fecha).getTime())
    .slice(0, 5);
  const registradores = new Set(allRecords.map((registro) => registro.registrador_nombre).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Total de registros" value={allRecords.length} icon={ClipboardList} tone="bg-orange-100 text-orange-700" />
        <MetricCard label="Registradores" value={registradores} icon={Users} tone="bg-violet-100 text-violet-700" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Actividad reciente</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Últimos registros</h2>
          </div>
          <p className="text-sm text-slate-500">Mostrando {recentRecords.length} de {allRecords.length}</p>
        </div>
        {recentRecords.length === 0 ? (
          <p className="border-t border-slate-100 p-8 text-center text-slate-500">Todavía no hay registros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Cédula</th>
                  <th className="px-4 py-3 font-bold">Usuario</th>
                  <th className="px-4 py-3 font-bold">Ubicación</th>
                  <th className="px-4 py-3 font-bold">Fecha</th>
                  <th className="px-4 py-3 font-bold">Registrador</th>
                </tr>
              </thead>
              <tbody>{recentRecords.map((registro) => <RecentRow key={registro.r_id} registro={registro} />)}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}