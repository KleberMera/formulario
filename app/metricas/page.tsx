import { BarChart3 } from "lucide-react"
import { QueryProvider } from "@/components/providers/query-provider"
import { MetricasDashboard } from "@/components/metricas/metricas-dashboard"

export default function MetricasPage() {
  return (
    <QueryProvider>
      <main className="min-h-screen bg-[#f5f7f8] px-5 py-8 text-slate-950 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ef4b19] text-white shadow-lg shadow-orange-200">
                  <BarChart3 className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Panel de control</p>
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Métricas de registros</h1>
                </div>
              </div>
            </div>
          </header>
          <MetricasDashboard />
        </div>
      </main>
    </QueryProvider>
  )
}