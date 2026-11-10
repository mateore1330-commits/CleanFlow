/**
 * RESERVAS (ENCARGADO, maqueta 06, PANEL-04).
 *
 * Todo lo que ha contratado la empresa, de quién es y en qué punto está.
 * Hasta ahora no había forma de verlo: GET /bookings es del cliente y
 * del trabajador, y cada uno veía las suyas.
 *
 * Dentro viven las dos colas que antes eran secciones aparte, cada una
 * como vista y como marca en la fila:
 *
 *   Afectada      -> se resuelve aquí, en un diálogo (ResolveAffected)
 *   N incidencias -> lleva a Incidencias filtrada por esa reserva, que
 *                    es donde viven su historia, sus fotos y su historial
 *
 * La lista viene paginada del servidor y los filtros viajan en la
 * petición: son las reservas de toda la empresa, no las de uno.
 *
 * Se puede abrir en una vista desde un enlace: ?vista=afectadas o
 * ?vista=incidencias. Así llegan los avisos del Inicio (PANEL-04).
 *
 * API: services/bookingService.js · Estilos: dashboard.css (cf-bookings,
 * cf-mrow, y las piezas comunes de la sección 20).
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { getManagedBookings } from "../../services/bookingService"
import { getAllServices } from "../../services/serviceService"
import {
    getReplacements, reassignBooking, cancelCompany, refreshAffected,
} from "../../services/absenceService"
import { ManagedBookingFilters, ManagedBookingViews } from "../../components/dashboard/bookings/ManagedBookingFilters"
import { ManagedBookingCard } from "../../components/dashboard/bookings/ManagedBookingCard"
import { ResolveAffected } from "../../components/dashboard/absences/ResolveAffected"
import { PageHead } from "../../components/dashboard/PageHead"
import "../../dashboard.css"

const PAGE_SIZE = 25

// Lo que se espera a que pare de escribir antes de preguntar al
// servidor. Sin esto se dispara una petición por tecla.
const SEARCH_DELAY = 300

const SKELETON_ROWS = 4

const SIN_FILTROS = { tab: "all", q: "", status: [], service: [], from: "", to: "" }

const VACIO = {
    all: "Todavía no hay ninguna reserva.",
    affected: "Ninguna reserva necesita que la reasignes. Todo en orden.",
    incident: "No hay ninguna reserva con incidencias abiertas.",
}

// La vista que pide el enlace (?vista=…) y la de cada valor, para escribirla.
const VISTA_DE = { afectadas: "affected", incidencias: "incident" }
const NOMBRE_DE = { affected: "afectadas", incident: "incidencias" }

const PageHeader = () => (
    <PageHead
        title="Reservas"
        subtitle="Todas las reservas de CleanFlow. Lo que necesita atención, en su vista."
    />
)

// La cabecera de la tabla: la misma rejilla que cada fila (cf-mrow).
const TableHead = () => (
    <div className="cf-mrow cf-mrow--head" aria-hidden="true">
        <span></span>
        <span>Servicio</span>
        <span>Cliente</span>
        <span>Trabajador</span>
        <span>Estado</span>
        <span>Precio</span>
    </div>
)

export const ListadoReservas = () => {
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const vistaPedida = VISTA_DE[params.get("vista")] || "all"

    // ------------------------------------------------------------------
    // ESTADO
    // ------------------------------------------------------------------

    const [bookings, setBookings] = useState([])
    const [counts, setCounts] = useState({ all: 0, affected: 0, incident: 0 })
    const [facets, setFacets] = useState({ status: {}, service: {} })
    const [total, setTotal] = useState(0)
    const [services, setServices] = useState([])

    // `loading` es cualquier carga; `ready` dice si ya se pintó alguna
    // vez. El esqueleto solo sale la primera: si saliera en cada filtro,
    // la barra se desmontaría, el panel abierto se cerraría y el cursor
    // se saldría del buscador a media palabra.
    const [loading, setLoading] = useState(true)
    const [ready, setReady] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [loadError, setLoadError] = useState("")
    const [actionError, setActionError] = useState("")

    const [filters, setFilters] = useState({ ...SIN_FILTROS, tab: vistaPedida })

    // Si se llega con otra vista estando ya aquí (un aviso del Inicio con
    // la página abierta en otra pestaña del navegador), se cambia a ella.
    useEffect(() => {
        setFilters((actuales) => (actuales.tab === vistaPedida ? actuales : { ...actuales, tab: vistaPedida }))
    }, [vistaPedida])

    /** Cambia los filtros y deja la vista escrita en la dirección. */
    const cambiarFiltros = (nuevos) => {
        setFilters(nuevos)

        if (nuevos.tab !== filters.tab) {
            setParams(NOMBRE_DE[nuevos.tab] ? { vista: NOMBRE_DE[nuevos.tab] } : {}, { replace: true })
        }
    }

    // El texto que se está escribiendo y el que ya se preguntó. Separarlos
    // es lo que permite esperar sin que el campo se quede trabado.
    const [search, setSearch] = useState("")

    // La reserva afectada que se está resolviendo, o null.
    const [resolving, setResolving] = useState(null)
    const dialogRef = useRef(null)

    // ------------------------------------------------------------------
    // CARGA
    // ------------------------------------------------------------------

    useEffect(() => {
        const id = setTimeout(() => setSearch(filters.q), SEARCH_DELAY)

        return () => clearTimeout(id)
    }, [filters.q])

    // Los servicios del desplegable, una sola vez. Se piden los de
    // gestión y no los públicos: hay reservas de servicios ya
    // desactivados y también hay que poder filtrarlas.
    useEffect(() => {
        if (!store.token) return

        getAllServices(store.token).then((result) => {
            if (result.ok) setServices(result.data)
        })
    }, [store.token])

    const load = useCallback(async () => {
        setLoading(true)
        setLoadError("")

        const result = await getManagedBookings(store.token, {
            ...filters, q: search, limit: PAGE_SIZE,
        })

        if (result.status === 401) {
            dispatch({ type: "LOGOUT" })
            return
        }

        if (result.ok) {
            setBookings(result.data.bookings)
            setCounts(result.data.counts)
            setFacets(result.data.facets)
            setTotal(result.data.count)
        } else {
            setLoadError(result.data.message)
        }

        setLoading(false)
        setReady(true)

        // Las dependencias se escriben una a una y NO va `filters`
        // entero: quien manda al buscar es `search`, que es el que ya
        // esperó. Con filters.q aquí, cada tecla lanzaría una petición
        // y la espera no serviría de nada.
    }, [store.token, search, filters.tab, filters.status, filters.service,
        filters.from, filters.to, dispatch])

    useEffect(() => {
        if (store.token) load()
    }, [store.token, load])

    const loadMore = async () => {
        setLoadingMore(true)

        const result = await getManagedBookings(store.token, {
            ...filters, q: search, limit: PAGE_SIZE, offset: bookings.length,
        })

        setLoadingMore(false)

        if (!result.ok) {
            setActionError(result.data.message)
            return
        }

        setBookings((actuales) => [...actuales, ...result.data.bookings])
    }

    useEffect(() => {
        if (resolving) dialogRef.current?.showModal()
    }, [resolving])

    // ------------------------------------------------------------------
    // LAS DOS MARCAS
    // ------------------------------------------------------------------

    const closeDialog = () => dialogRef.current?.close()

    // Las tres llamadas que necesita ResolveAffected.
    const onFind = async (booking) => {
        const result = await getReplacements(booking.booking_id, store.token)

        return result.ok
            ? { ok: true, workers: result.data.workers }
            : { ok: false, message: result.data.message }
    }

    const trasResolver = () => {
        closeDialog()
        // El menú lleva el aviso sumado: hay que avisarle de que bajó.
        refreshAffected()
        load()
        setActionError("")
        return { ok: true }
    }

    const onReassign = async (booking, workerId) => {
        const result = await reassignBooking(booking.booking_id, workerId, store.token)

        return result.ok ? trasResolver() : { ok: false, message: result.data.message }
    }

    const onCancel = async (booking, reason) => {
        const result = await cancelCompany(booking.booking_id, reason, store.token)

        return result.ok ? trasResolver() : { ok: false, message: result.data.message }
    }

    // La incidencia no se resuelve aquí: tiene su pantalla, con su
    // historial y sus fotos. Se salta a ella filtrada por esta reserva.
    const onIncidents = (booking) =>
        navigate(`/dashboard/incidents?booking=${booking.booking_id}`)

    // ------------------------------------------------------------------
    // PANTALLA
    // ------------------------------------------------------------------

    if (!ready && loading) {
        return (
            <section className="cf-bookings" aria-busy="true">
                <PageHeader />
                <p className="sr-only">Cargando reservas...</p>

                <div className="cf-dash-skel cf-bookings__skel-views" aria-hidden="true" />

                <div className="cf-lpanel" aria-hidden="true">
                    <div className="cf-lbar">
                        <span className="cf-dash-skel cf-bookings__skel-search" />
                    </div>
                    <ul className="cf-lrows">
                        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                            <li className="cf-mrow" key={index}>
                                <span className="cf-dash-skel cf-bookings__skel-date" />
                                <div className="cf-mrow__main">
                                    <span className="cf-dash-skel cf-bookings__skel-name" />
                                    <span className="cf-dash-skel cf-bookings__skel-sub" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        )
    }

    if (loadError) {
        return (
            <section className="cf-bookings">
                <PageHeader />

                <div className="cf-dash-state cf-dash-state--error" role="alert">
                    <span className="cf-dash-state__icon">
                        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                    </span>
                    <p className="cf-dash-state__title">No se han podido cargar las reservas</p>
                    <p className="cf-dash-state__text">{loadError}</p>
                    <button type="button" className="cf-dash-btn" onClick={load}>Reintentar</button>
                </div>
            </section>
        )
    }

    const filtrando = Boolean(
        filters.tab !== "all" || search.trim() || filters.status.length
        || filters.service.length || filters.from || filters.to
    )

    const quedan = total - bookings.length

    return (
        <section className="cf-bookings" aria-busy={loading}>
            <PageHeader />

            {actionError && (
                <p className="cf-dash-alert" role="alert">{actionError}</p>
            )}

            {/* Las vistas van fuera del bloque; la barra, dentro, encima
                de la tabla: dos franjas antes de los datos. */}
            <ManagedBookingViews filters={filters} counts={counts} onChange={cambiarFiltros} />

            <div className="cf-lpanel">
                <ManagedBookingFilters
                    filters={filters}
                    counts={counts}
                    facets={facets}
                    services={services}
                    onChange={cambiarFiltros}
                />

                {bookings.length === 0 ? (
                    <div className="cf-dash-state">
                        <span className="cf-dash-state__icon">
                            <i className={`fa-solid ${filtrando ? "fa-magnifying-glass" : "fa-calendar-check"}`} aria-hidden="true" />
                        </span>
                        <p className="cf-dash-state__title">
                            {filtrando ? "Nada con estos filtros" : "Todavía no hay reservas"}
                        </p>
                        <p className="cf-dash-state__text">
                            {filtrando ? VACIO[filters.tab] : VACIO.all}
                        </p>
                        {filtrando && (
                            <button type="button" className="cf-dash-btn cf-dash-btn--ghost"
                                    onClick={() => cambiarFiltros(SIN_FILTROS)}>
                                Quitar los filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <TableHead />

                        <ul className="cf-lrows">
                            {bookings.map((booking) => (
                                <ManagedBookingCard
                                    key={booking.booking_id}
                                    booking={booking}
                                    onAffected={setResolving}
                                    onIncidents={onIncidents}
                                />
                            ))}
                        </ul>

                        {/* El pie: cuántas se ven y «Ver más» si quedan. */}
                        <div className="cf-lpanel__foot">
                            <p role="status">
                                {loading ? "Buscando…" : filtrando
                                    ? `${total} ${total === 1 ? "reserva" : "reservas"} con estos filtros`
                                    : `Mostrando ${bookings.length} de ${total}`}
                            </p>

                            {quedan > 0 && (
                                <button type="button" className="cf-dash-btn cf-dash-btn--ghost cf-dash-btn--sm"
                                        onClick={loadMore} disabled={loadingMore}>
                                    {loadingMore ? "Cargando..." : "Ver más"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {resolving && (
                <dialog
                    ref={dialogRef}
                    className="cf-dash-modal"
                    aria-labelledby="resolve-title"
                    onClose={() => setResolving(null)}
                    onClick={(event) => event.target === event.currentTarget && closeDialog()}
                >
                    <div className="cf-dash-modal__body cf-bookings__resolve">
                        <h2 className="cf-dash-modal__title" id="resolve-title">
                            Reserva #{resolving.booking_id} · {resolving.client_name}
                        </h2>
                        <p className="cf-bookings__resolve-sub">
                            {resolving.service_name} · {resolving.worker_name || "Sin asignar"} no puede
                            atenderla: {(resolving.affected_reasons || []).join(", ").toLowerCase()}.
                        </p>

                        <ResolveAffected
                            booking={resolving}
                            onFind={onFind}
                            onReassign={onReassign}
                            onCancel={onCancel}
                        />

                        <div className="cf-dash-modal__actions">
                            <button type="button" className="cf-dash-btn cf-dash-btn--ghost" onClick={closeDialog}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </section>
    )
}
