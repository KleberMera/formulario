export type CatalogItem = { id: number; nombre: string }

export type Evento = CatalogItem & {
  fecha: string
  estado: string
}

export type Registrador = CatalogItem & {
  nombres: string
  apellidos: string
}

export type RegistroDto = {
  cedula?: string
  telefono?: string
  codigo?: string
  nombres: string
  apellidos: string
  provinciaId?: number
  cantonId?: number
  barrioId?: number
  registradorId: number
  eventoId: number
  observacion?: string
  latitud?: number
  longitud?: number
}

export type RegistroListado = {
  r_id: number
  r_cedula: string | null
  r_telefono: string | null
  r_fecha: string
  r_estado: string
  provincia_nombre: string | null
  canton_nombre: string | null
  barrio_nombre: string | null
  usuario: string | null
  registrador_nombre: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
type ApiResponse<T> = { data: T; message: string; status: number }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.message ?? 'No se pudo completar la solicitud')
  return (body as ApiResponse<T>).data
}

export const registroApi = {
  getRegistradores: () => request<Registrador[]>('/registro/registradores-activos'),
  getEventosActivos: () => request<Evento[]>('/registro/eventos-activos'),
  getProvincias: () => request<CatalogItem[]>('/provincia'),
  getCantones: (provinciaId: number) => request<CatalogItem[]>(`/canton/provincia/${provinciaId}`),
  getBarrios: (cantonId: number) => request<CatalogItem[]>(`/barrio/canton/${cantonId}`),
  listar: () => request<RegistroListado[]>('/registro/listar'),
  crear: (registro: RegistroDto) => request<unknown>('/registro/crear', {
    method: 'POST',
    body: JSON.stringify(registro),
  }),
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 10)
}

export function optionalNumber(value: string) {
  return value ? Number(value) : undefined
}
