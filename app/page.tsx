import { RegistroForm, FormHeader } from '@/components/registro/registro-form'
import { QueryProvider } from '@/components/providers/query-provider'

export default function Page() {
  return (
    <QueryProvider>
      <main className="min-h-screen bg-[#fff8ed] px-5 py-8 text-slate-950 sm:px-8 sm:py-12">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl shadow-orange-950/10 sm:p-10">
          <FormHeader />
          <div className="my-8 h-px bg-orange-100" />
          <RegistroForm />
        </section>
      </main>
    </QueryProvider>
  )
}
