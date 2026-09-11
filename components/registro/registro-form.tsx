"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Crosshair, Loader2, MapPin, Send, Waves } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { registroApi, onlyDigits, optionalNumber } from "@/lib/registro-api";

type FormState = {
  cedula: string;
  telefono: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  provinciaId: string;
  cantonId: string;
  barrioId: string;
  registradorId: string;
  observacion: string;
  latitud: string;
  longitud: string;
};

const initialState: FormState = {
  cedula: "",
  telefono: "",
  codigo: "",
  nombres: "",
  apellidos: "",
  provinciaId: "",
  cantonId: "",
  barrioId: "",
  registradorId: "",
  observacion: "",
  latitud: "",
  longitud: "",
};

function optionalCoordinate(value: string) {
  return value ? Number(Number(value).toFixed(7)) : undefined;
}

function Field({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label
      className="flex flex-col gap-2 text-sm font-semibold text-slate-700"
      htmlFor={name}
    >
      <span>
        {label}
        {required && <b className="ml-1 text-[#ef4b19]">*</b>}
      </span>
      <input
        id={name}
        name={name}
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  disabled,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: number; nombre: string }[];
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label
      className="flex flex-col gap-2 text-sm font-semibold text-slate-700"
      htmlFor={name}
    >
      <span>
        {label}
        {required && <b className="ml-1 text-[#ef4b19]">*</b>}
      </span>
      <select
        id={name}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal text-slate-900 outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="">Seleccionar...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchableSelect({
  label,
  name,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: number; nombre: string }[];
  disabled?: boolean;
}) {
  const selectedOption = options.find((option) => String(option.id) === value);
  const [search, setSearch] = useState(selectedOption?.nombre ?? "");
  const filteredOptions = options.filter((option) =>
    option.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setSearch(selectedOption?.nombre ?? "");
  }, [value, selectedOption?.nombre]);

  return (
    <label
      className="relative flex flex-col gap-2 text-sm font-semibold text-slate-700"
      htmlFor={name}
    >
      <span>{label}</span>
      <input
        id={name}
        name={name}
        value={search}
        disabled={disabled}
        placeholder="Buscar barrio..."
        autoComplete="off"
        onChange={(event) => {
          setSearch(event.target.value);
          onChange("");
        }}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {filteredOptions.length > 0 && !value && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(String(option.id));
                setSearch(option.nombre);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-normal text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              {option.nombre}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

export function RegistroForm() {
  const [form, setForm] = useState(initialState);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const registradores = useQuery({
    queryKey: ["registradores"],
    queryFn: registroApi.getRegistradores,
  });
  const eventos = useQuery({
    queryKey: ["eventos-activos"],
    queryFn: registroApi.getEventosActivos,
  });
  const provincias = useQuery({
    queryKey: ["provincias"],
    queryFn: registroApi.getProvincias,
  });
  const cantones = useQuery({
    queryKey: ["cantones", form.provinciaId],
    queryFn: () => registroApi.getCantones(Number(form.provinciaId)),
    enabled: Boolean(form.provinciaId),
  });
  const barrios = useQuery({
    queryKey: ["barrios", form.cantonId],
    queryFn: () => registroApi.getBarrios(Number(form.cantonId)),
    enabled: Boolean(form.cantonId),
  });
  const mutation = useMutation({
    mutationFn: registroApi.crear,
    onSuccess: () => {
      setForm(initialState);
      setLocationMessage("");
      Swal.fire({
        icon: "success",
        title: "Registro guardado",
        text: "La información fue enviada correctamente.",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#ef4b19",
        background: "#fff8ed",
        color: "#172033",
      });
    },
    onError: (e: Error) => {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: e.message,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4b19",
        background: "#fff8ed",
        color: "#172033",
      });
    },
  });
  const update = (name: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));

  useEffect(() => {
    if (!form.provinciaId) {
      update("cantonId", "");
      update("barrioId", "");
    }
  }, [form.provinciaId]);
  useEffect(() => {
    if (form.provinciaId && cantones.data && cantones.data.length === 0) {
      update("cantonId", "");
      update("barrioId", "");
    }
  }, [form.provinciaId, cantones.data]);
  useEffect(() => {
    if (!form.cantonId) update("barrioId", "");
  }, [form.cantonId]);

  function getLocation() {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "warning",
        title: "GPS no disponible",
        text: "Tu navegador no permite geolocalización.",
        confirmButtonColor: "#ef4b19",
        background: "#fff8ed",
        color: "#172033",
      });
      return;
    }
    setLocationLoading(true);
    setLocationMessage("Obteniendo coordenadas...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        update("latitud", coords.latitude.toFixed(7));
        update("longitud", coords.longitude.toFixed(7));
        setLocationMessage("Ubicación capturada correctamente.");
        setLocationLoading(false);
        Swal.fire({
          icon: "success",
          title: "Ubicación capturada",
          text: "Las coordenadas GPS fueron agregadas al registro.",
          timer: 1800,
          showConfirmButton: false,
          background: "#fff8ed",
          color: "#172033",
        });
      },
      () => {
        setLocationMessage(
          "No pudimos acceder a tu ubicación. Revisa los permisos del navegador.",
        );
        setLocationLoading(false);
        Swal.fire({
          icon: "error",
          title: "No se pudo obtener la ubicación",
          text: "Revisa los permisos de ubicación del navegador e inténtalo nuevamente.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#ef4b19",
          background: "#fff8ed",
          color: "#172033",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const eventoActivo = eventos.data?.[0];
    if (!eventoActivo) {
      Swal.fire({
        icon: "warning",
        title: "Evento no disponible",
        text: "No hay un evento activo disponible para este registro.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4b19",
        background: "#fff8ed",
        color: "#172033",
      });
      return;
    }
    Swal.fire({
      icon: "question",
      title: "¿Estás seguro de registrar esta información?",
      text: "Verifica los datos antes de enviarlos.",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Revisar datos",
      confirmButtonColor: "#ef4b19",
      cancelButtonColor: "#64748b",
      background: "#fff8ed",
      color: "#172033",
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      mutation.mutate({
        nombres: form.nombres,
        apellidos: form.apellidos,
        registradorId: Number(form.registradorId),
        eventoId: eventoActivo.id,
        cedula: form.cedula || undefined,
        telefono: form.telefono || undefined,
        codigo: form.codigo || undefined,
        provinciaId: optionalNumber(form.provinciaId),
        cantonId: optionalNumber(form.cantonId),
        barrioId: optionalNumber(form.barrioId),
        observacion: form.observacion || undefined,
        latitud: optionalCoordinate(form.latitud),
        longitud: optionalCoordinate(form.longitud),
      });
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      <section className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nombres"
          name="nombres"
          required
          value={form.nombres}
          onChange={(v) => update("nombres", v)}
          placeholder="Ej. María José"
        />
        <Field
          label="Apellidos"
          name="apellidos"
          required
          value={form.apellidos}
          onChange={(v) => update("apellidos", v)}
          placeholder="Ej. González"
        />
        <Field
          label="Cédula"
          name="cedula"
          value={form.cedula}
          onChange={(v) => update("cedula", onlyDigits(v))}
          placeholder="10 dígitos"
        />
        <Field
          label="Teléfono"
          name="telefono"
          value={form.telefono}
          onChange={(v) => update("telefono", onlyDigits(v))}
          placeholder="10 dígitos"
        />
      </section>
      <div className="h-px bg-slate-100" />
      <section className="grid gap-5 sm:grid-cols-3">
        <SelectField
          label="Provincia"
          name="provinciaId"
          value={form.provinciaId}
          onChange={(v) => update("provinciaId", v)}
          options={provincias.data ?? []}
        />
        {(cantones.isLoading || (cantones.data?.length ?? 0) > 0) && (
          <SelectField
            label="Cantón"
            name="cantonId"
            value={form.cantonId}
            onChange={(v) => update("cantonId", v)}
            options={cantones.data ?? []}
            disabled={!form.provinciaId || cantones.isLoading}
          />
        )}
        {form.cantonId &&
          (barrios.isLoading || (barrios.data?.length ?? 0) > 0) && (
            <SearchableSelect
              label="Barrio"
              name="barrioId"
              value={form.barrioId}
              onChange={(v) => update("barrioId", v)}
              options={barrios.data ?? []}
              disabled={barrios.isLoading}
            />
          )}
      </section>
      <section className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Registrador activo"
          name="registradorId"
          required
          value={form.registradorId}
          onChange={(v) => update("registradorId", v)}
          options={(registradores.data ?? []).map((item) => ({
            id: item.id,
            nombre: `${item.nombres} ${item.apellidos}`,
          }))}
        />
      </section>
      <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-bold text-sky-950">
              <MapPin className="size-5 text-sky-600" /> Ubicación del registro
            </p>
            <p className="mt-1 text-sm text-sky-700">
              Captura tus coordenadas automáticamente para ubicar la visita.
            </p>
          </div>
          <button
            type="button"
            onClick={getLocation}
            disabled={locationLoading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
          >
            {locationLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Crosshair className="size-4" />
            )}{" "}
            {locationLoading ? "Obteniendo..." : "Obtener ubicación"}
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Latitud"
            name="latitud"
            value={form.latitud}
            onChange={(v) => update("latitud", v)}
            placeholder="Se captura con GPS"
          />
          <Field
            label="Longitud"
            name="longitud"
            value={form.longitud}
            onChange={(v) => update("longitud", v)}
            placeholder="Se captura con GPS"
          />
        </div>
        {locationMessage && (
          <p className="mt-3 text-sm font-medium text-sky-700" role="status">
            {locationMessage}
          </p>
        )}
      </section>
      <Field
        label="Código"
        name="codigo"
        value={form.codigo}
        onChange={(v) => update("codigo", v)}
        placeholder="Opcional"
      />
      <label
        className="flex flex-col gap-2 text-sm font-semibold text-slate-700"
        htmlFor="observacion"
      >
        Observación<span className="font-normal text-slate-400">Opcional</span>
        <textarea
          id="observacion"
          value={form.observacion}
          onChange={(e) => update("observacion", e.target.value)}
          rows={4}
          placeholder="Agrega información adicional sobre el registro..."
          className="resize-none rounded-xl border border-slate-200 bg-white p-4 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f97316] focus:ring-4 focus:ring-orange-100"
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-13 items-center gap-3 rounded-xl bg-[#ef4b19] px-7 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#d93e10] disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}{" "}
          {mutation.isPending ? "Enviando..." : "Guardar registro"}
        </button>
      </div>
    </form>
  );
}

export function FormHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f97316] text-white shadow-lg shadow-orange-200">
        <Waves className="size-6" />
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        Registro Avanzada
      </h1>
    </div>
  );
}
