/**
 * BARRA DE FILTROS DE RESERVAS (ENCARGADO, maqueta 06, PANEL-04).
 *
 * Arriba las tres vistas en tarjetas (Todas, Afectadas y Con incidencia),
 * y debajo una sola barra: el buscador a la izquierda y tres
 * desplegables a la derecha (estado, servicio y fechas). Lo elegido se
 * dice en el propio botón, con su ✕; «Limpiar» lo quita todo.
 *
 * Estado y servicio son de SELECCIÓN MÚLTIPLE: se marcan varios y el
 * panel no se cierra al marcar, porque casi nunca se elige uno solo.
 * Cada opción enseña cuántas reservas hay, contadas sin su propio filtro
 * pero con los demás: si contaran lo ya filtrado, al marcar una el resto
 * se pondría a cero y parecería que no hay nada más.
 *
 * Solo pinta y avisa: quien filtra de verdad es la API.
 *
 *   filters: { tab, q, status[], service[], from, to }  ·  onChange: los nuevos
 *   facets:  { status: {...}, service: {...} }
 *
 * Las tres vistas, con sus números (counts), van aparte: ManagedBookingViews,
 * al final de este archivo, porque se pintan fuera del bloque de la lista.
 *
 * Estilos: dashboard.css, sección 20 (cf-views, cf-lbar, cf-ldrop).
 */

import { useEffect, useRef, useState } from "react"
import { ListViews } from "../list/ListViews"
import { ListBar, ListDrop } from "../list/ListBar"

// «No realizadas» va aparte: no se hicieron, así que no son «Realizadas»
// (FIX-02). El servidor las cuenta igual que las demás.
const ESTADOS = [
    { value: "pending", label: "Pendientes" },
    { value: "done", label: "Realizadas" },
    { value: "not_done", label: "No realizadas" },
    { value: "cancelled", label: "Canceladas" },
]

/** Los mismos tres atajos que ya tiene "Mis servicios" del cliente. */
const isoOf = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const ATAJOS = [
    {
        value: "month", label: "Este mes",
        range: (hoy) => ({
            from: isoOf(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
            to: isoOf(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
        }),
    },
    {
        value: "quarter", label: "Últimos 3 meses",
        range: (hoy) => ({
            from: isoOf(new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1)),
            to: isoOf(hoy),
        }),
    },
    {
        value: "year", label: "Este año",
        range: (hoy) => ({ from: `${hoy.getFullYear()}-01-01`, to: `${hoy.getFullYear()}-12-31` }),
    },
]

const diaCorto = (iso) =>
    new Date(`${iso}T12:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "")

export const ManagedBookingFilters = ({ filters, facets, services, onChange }) => {
    // Cuál de los tres paneles está abierto, o null. Solo uno: dos a la
    // vez se solaparían.
    const [abierto, setAbierto] = useState(null)
    const barra = useRef(null)

    const set = (cambios) => onChange({ ...filters, ...cambios })

    // Se cierra al pulsar fuera y con Escape, como cualquier menú. Los
    // dos oyentes se quitan al cerrarlo.
    useEffect(() => {
        if (!abierto) return

        const fuera = (event) => {
            if (!barra.current?.contains(event.target)) setAbierto(null)
        }

        const escape = (event) => {
            if (event.key === "Escape") setAbierto(null)
        }

        document.addEventListener("mousedown", fuera)
        document.addEventListener("keydown", escape)

        return () => {
            document.removeEventListener("mousedown", fuera)
            document.removeEventListener("keydown", escape)
        }
    }, [abierto])

    /** Marca o desmarca un valor de una de las dos listas. */
    const alternar = (campo, valor) => {
        const lista = filters[campo]

        set({ [campo]: lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor] })
    }

    const atajoPuesto = ATAJOS.find((a) => {
        const r = a.range(new Date())
        return r.from === filters.from && r.to === filters.to
    })

    const rotuloFechas = () => {
        if (atajoPuesto) return atajoPuesto.label
        if (filters.from && filters.to) return `${diaCorto(filters.from)} – ${diaCorto(filters.to)}`
        if (filters.from) return `desde el ${diaCorto(filters.from)}`
        if (filters.to) return `hasta el ${diaCorto(filters.to)}`

        return null
    }

    /** Lo elegido, dicho en corto: el nombre si es uno, o cuántos. */
    const elegido = (lista, nombre) =>
        lista.length === 0 ? null
            : lista.length === 1 ? nombre(lista[0])
                : `${lista.length}`

    const nombreServicio = (id) => services.find((s) => String(s.service_id) === String(id))?.name || "Servicio"

    const panel = (cual) => () => setAbierto(abierto === cual ? null : cual)

    const hayFiltros = Boolean(filters.q.trim() || filters.status.length || filters.service.length
        || filters.from || filters.to)

    return (
        <ListBar
            barRef={barra}
            search={{
                label: "Buscar reservas",
                placeholder: "Buscar cliente, trabajador o servicio",
                value: filters.q,
                onChange: (q) => set({ q }),
            }}
            onClear={hayFiltros ? () => set({ q: "", status: [], service: [], from: "", to: "" }) : null}
        >
            {/* ---------- ESTADO ---------- */}
            <ListDrop
                label="Estado"
                value={elegido(filters.status, (v) => ESTADOS.find((e) => e.value === v).label)}
                open={abierto === "status"}
                onToggle={panel("status")}
                onClear={() => set({ status: [] })}
            >
                <p className="cf-ldrop__head">Estado</p>
                {ESTADOS.map((e) => (
                    <label className="cf-ldrop__opt" key={e.value}>
                        <input
                            type="checkbox"
                            checked={filters.status.includes(e.value)}
                            onChange={() => alternar("status", e.value)}
                        />
                        {e.label}
                        <span className="cf-ldrop__n">{facets.status?.[e.value] ?? 0}</span>
                    </label>
                ))}
            </ListDrop>

            {/* ---------- SERVICIO ---------- */}
            <ListDrop
                label="Servicio"
                value={elegido(filters.service, (v) => nombreServicio(v).replace("Limpieza ", ""))}
                open={abierto === "service"}
                onToggle={panel("service")}
                onClear={() => set({ service: [] })}
            >
                <p className="cf-ldrop__head">Tipo de servicio</p>
                {services.map((s) => (
                    <label className="cf-ldrop__opt" key={s.service_id}>
                        <input
                            type="checkbox"
                            checked={filters.service.includes(String(s.service_id))}
                            onChange={() => alternar("service", String(s.service_id))}
                        />
                        {s.name}
                        <span className="cf-ldrop__n">{facets.service?.[String(s.service_id)] ?? 0}</span>
                    </label>
                ))}
            </ListDrop>

            {/* ---------- FECHAS ---------- */}
            <ListDrop
                label="Fechas"
                icon="fa-calendar"
                value={rotuloFechas()}
                open={abierto === "dates"}
                onToggle={panel("dates")}
                onClear={() => set({ from: "", to: "" })}
            >
                <div className="cf-ldrop__quick">
                    {ATAJOS.map((a) => (
                        <button
                            key={a.value}
                            type="button"
                            aria-pressed={atajoPuesto?.value === a.value}
                            onClick={() => set(a.range(new Date()))}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>

                <div className="cf-ldrop__range">
                    <label className="cf-ldrop__field">
                        <span>Desde</span>
                        <input
                            type="date"
                            className="cf-dash-input"
                            value={filters.from}
                            onChange={(event) => set({ from: event.target.value })}
                        />
                    </label>
                    <label className="cf-ldrop__field">
                        <span>Hasta</span>
                        <input
                            type="date"
                            className="cf-dash-input"
                            value={filters.to}
                            onChange={(event) => set({ to: event.target.value })}
                        />
                    </label>
                </div>
            </ListDrop>
        </ListBar>
    )
}

/**
 * LAS TRES VISTAS DE RESERVAS, en tarjetas: van fuera del bloque de la
 * lista, encima (maqueta 06).
 */
export const ManagedBookingViews = ({ filters, counts, onChange }) => {
    // Lo urgente solo se pinta urgente si hay algo: un «0» en rojo asusta
    // para nada.
    const vistas = [
        { value: "all", label: "Todas", count: counts.all, hint: "reservas en total", icon: "fa-layer-group" },
        {
            value: "affected", label: "Afectadas", count: counts.affected, icon: "fa-user-slash",
            hint: counts.affected > 0 ? "necesitan un sustituto" : "todo en orden",
            tone: counts.affected > 0 ? "warn" : undefined,
        },
        {
            value: "incident", label: "Con incidencia", count: counts.incident, icon: "fa-triangle-exclamation",
            hint: counts.incident > 0 ? "por resolver" : "ninguna abierta",
            tone: counts.incident > 0 ? "hot" : undefined,
        },
    ]

    return (
        <ListViews
            label="Vistas de reservas"
            views={vistas}
            active={filters.tab}
            onChange={(tab) => onChange({ ...filters, tab })}
        />
    )
}
