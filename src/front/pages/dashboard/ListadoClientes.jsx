/**
 * CLIENTES (ENCARGADO, maqueta 06, PANEL-04).
 *
 * La otra mitad de la gente que gestiona el encargado. El patrón de todas
 * las listas del encargado: las vistas en tarjetas (Todos, Activos y Dados
 * de baja) y un solo bloque con el buscador, la tabla y el pie. Cada fila
 * (ClientRow.jsx) se despliega y enseña sus direcciones y su historial.
 *
 * La diferencia está debajo: aquí la lista viene paginada del servidor,
 * porque son los clientes de toda la empresa. Por eso la búsqueda, la
 * pestaña y los contadores se piden a la API en vez de calcularse con lo
 * recibido, que solo es una tanda.
 *
 * No se crean, no se editan y no se borran: solo se dan de alta o de
 * baja. Borrar no es una decisión nuestra, es que la base de datos no
 * deja quitar a alguien del que cuelgan reservas y direcciones.
 *
 * API: services/clientService.js · Estilos: dashboard.css (cf-clients__*).
 */

import { useCallback, useEffect, useRef, useState } from "react"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { getClients, toggleClientStatus } from "../../services/clientService"
import { SearchBox } from "../../components/dashboard/SearchBox"
import { ClientRow } from "../../components/dashboard/clients/ClientRow"
import { PageHead } from "../../components/dashboard/PageHead"
import { ListViews } from "../../components/dashboard/list/ListViews"
import "../../dashboard.css"

const FILTERS = [
    { value: "all", label: "Todos", hint: "clientes registrados", icon: "fa-address-book" },
    { value: "active", label: "Activos", hint: "pueden reservar", icon: "fa-user-check" },
    { value: "inactive", label: "Dados de baja", hint: "sin acceso", icon: "fa-user-slash" },
]

// Cuántos se piden por tanda. El mismo número que usa el backend por
// defecto; se escribe aquí para que el "Ver más" sepa cuánto pedir.
const PAGE_SIZE = 25

// Lo que se espera a que pare de escribir antes de preguntar al
// servidor. Sin esto se dispara una petición por tecla.
const SEARCH_DELAY = 300

const SKELETON_ROWS = 5

const PageHeader = () => (
    <PageHead
        title="Clientes"
        subtitle="Quién contrata, cómo contactarle y cuánto lleva con nosotros. Darle de baja cierra su acceso y cancela lo pendiente, sin borrar su historial."
    />
)

export const ListadoClientes = () => {
    const { store, dispatch } = useGlobalReducer()

    // ------------------------------------------------------------------
    // ESTADO
    // ------------------------------------------------------------------

    const [clients, setClients] = useState([])
    const [counts, setCounts] = useState({ all: 0, active: 0, inactive: 0 })
    const [total, setTotal] = useState(0)

    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [loadError, setLoadError] = useState("")

    const [filter, setFilter] = useState("all")

    // Dos textos: `query` es lo que se está escribiendo y `search` lo que
    // ya se ha preguntado. Separarlos es lo que permite esperar a que
    // pare de teclear sin que el campo se quede trabado.
    const [query, setQuery] = useState("")
    const [search, setSearch] = useState("")

    const [togglingId, setTogglingId] = useState(null)
    const [toggleError, setToggleError] = useState("")
    const [notice, setNotice] = useState("")

    const [confirming, setConfirming] = useState(null)
    const dialogRef = useRef(null)

    // ------------------------------------------------------------------
    // CARGA
    // ------------------------------------------------------------------

    useEffect(() => {
        const id = setTimeout(() => setSearch(query), SEARCH_DELAY)

        return () => clearTimeout(id)
    }, [query])

    const load = useCallback(async () => {
        setLoading(true)
        setLoadError("")

        const result = await getClients(store.token, { q: search, state: filter, limit: PAGE_SIZE })

        if (result.status === 401) {
            dispatch({ type: "LOGOUT" })
            return
        }

        if (result.ok) {
            setClients(result.data.clients)
            setCounts(result.data.counts)
            setTotal(result.data.count)
        } else {
            setLoadError(result.data.message)
        }

        setLoading(false)
    }, [store.token, search, filter, dispatch])

    useEffect(() => {
        if (store.token) load()
    }, [store.token, load])

    // "Ver más" pide la siguiente tanda desde donde se quedó y la añade.
    const loadMore = async () => {
        setLoadingMore(true)

        const result = await getClients(store.token, {
            q: search, state: filter, limit: PAGE_SIZE, offset: clients.length,
        })

        setLoadingMore(false)

        if (!result.ok) {
            setToggleError(result.data.message)
            return
        }

        setClients((actuales) => [...actuales, ...result.data.clients])
    }

    useEffect(() => {
        if (confirming) dialogRef.current?.showModal()
    }, [confirming])

    // ------------------------------------------------------------------
    // ALTA Y BAJA
    // ------------------------------------------------------------------

    const changeStatus = async (client, isActive) => {
        setTogglingId(client.user_id)
        setToggleError("")
        setNotice("")

        const result = await toggleClientStatus(store.token, client.user_id, isActive)

        if (result.status === 401) {
            dispatch({ type: "LOGOUT" })
            return
        }

        setTogglingId(null)

        if (!result.ok) {
            setToggleError(result.data.message)
            return
        }

        const canceladas = result.data.cancelled

        // Se corrige la fila en el sitio en vez de recargar la lista: una
        // recarga perdería las tandas que ya se hayan traído con "Ver más".
        // Al darle de baja no le quedan pendientes, porque acaban de
        // cancelarse.
        setClients((actuales) => actuales.map((item) =>
            item.user_id === client.user_id
                ? {
                    ...item,
                    is_active: isActive,
                    pending_count: isActive ? item.pending_count : 0,
                    next_pending_at: isActive ? item.next_pending_at : null,
                }
                : item
        ))

        setCounts((actuales) => ({
            all: actuales.all,
            active: actuales.active + (isActive ? 1 : -1),
            inactive: actuales.inactive + (isActive ? -1 : 1),
        }))

        const quien = `${client.name} ${client.last_name}`

        setNotice(isActive
            ? `${quien} vuelve a estar activo.`
            : canceladas > 0
                ? `${quien} está de baja. Se ${canceladas === 1 ? "ha cancelado 1 servicio" : `han cancelado ${canceladas} servicios`}.`
                : `${quien} está de baja.`)
    }

    // Dar de baja pregunta, porque cancela sus servicios. Dar de alta no:
    // no destruye nada. Mismo criterio que en Trabajadores.
    const handleSwitch = (client) => {
        if (client.is_active) {
            setConfirming(client)
        } else {
            changeStatus(client, true)
        }
    }

    const closeDialog = () => dialogRef.current?.close()

    const confirmDeactivate = () => {
        const client = confirming
        closeDialog()
        changeStatus(client, false)
    }

    // ------------------------------------------------------------------
    // PANTALLA
    // ------------------------------------------------------------------

    if (loading) {
        return (
            <section className="cf-clients" aria-busy="true">
                <PageHeader />

                <p className="sr-only">Cargando clientes...</p>

                <ul className="cf-lpanel cf-clients__list" aria-hidden="true">
                    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <li className="cf-clients__row" key={index}>
                            <div className="cf-clients__main">
                                <span />
                                <div className="cf-clients__person">
                                    <span className="cf-dash-skel cf-skel-avatar" />
                                    <div className="cf-clients__who">
                                        <span className="cf-dash-skel cf-clients__skel-name" />
                                        <span className="cf-dash-skel cf-clients__skel-sub" />
                                    </div>
                                </div>
                                <span className="cf-dash-skel cf-clients__skel-sub" />
                                <span className="cf-dash-skel cf-clients__skel-sub" />
                                <span className="cf-dash-skel cf-clients__skel-sub" />
                                <span className="cf-dash-skel cf-clients__skel-switch" />
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        )
    }

    if (loadError) {
        return (
            <section className="cf-clients">
                <PageHeader />

                <div className="cf-dash-state cf-dash-state--error" role="alert">
                    <span className="cf-dash-state__icon">
                        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                    </span>
                    <p className="cf-dash-state__title">No se han podido cargar los clientes</p>
                    <p className="cf-dash-state__text">{loadError}</p>
                    <button type="button" className="cf-dash-btn" onClick={load}>
                        Reintentar
                    </button>
                </div>
            </section>
        )
    }

    // Las sugerencias salen de lo que hay cargado: lo que no se ha traído
    // todavía no se puede sugerir. Al escribir, quien busca de verdad es
    // el servidor.
    const searchOptions = clients.map((client) => ({
        id: client.user_id,
        name: `${client.name} ${client.last_name}`,
        description: `${client.email} ${client.phone || ""}`,
        meta: client.email,
        active: client.is_active,
    }))

    const searching = search.trim() !== ""
    const quedan = total - clients.length

    return (
        <section className="cf-clients">
            <PageHeader />

            {toggleError && (
                <p className="cf-dash-alert" role="alert">{toggleError}</p>
            )}

            {notice && (
                <p className="cf-dash-results" role="status">
                    <span>{notice}</span>
                    <button type="button" onClick={() => setNotice("")}>Vale</button>
                </p>
            )}

            <ListViews
                label="Vistas de clientes"
                active={filter}
                onChange={setFilter}
                views={FILTERS.map((option) => ({ ...option, count: counts[option.value] }))}
            />

            {/* Un solo bloque: el buscador (con sugerencias), la tabla y el pie. */}
            <div className="cf-lpanel">
                <div className="cf-lbar cf-clients__bar">
                    <SearchBox
                        id="client-search"
                        label="Buscar por nombre, correo o teléfono"
                        value={query}
                        onChange={setQuery}
                        options={searchOptions}
                        inactiveLabel="De baja"
                        onSelect={(option) => setQuery(option.name)}
                    />
                </div>

                {clients.length === 0 ? (
                    <div className="cf-dash-state">
                        <span className="cf-dash-state__icon">
                            <i className={`fa-solid ${searching ? "fa-magnifying-glass" : "fa-address-book"}`} aria-hidden="true" />
                        </span>
                        <p className="cf-dash-state__title">
                            {searching ? `Nadie coincide con «${search.trim()}»` : "Todavía no hay clientes"}
                        </p>
                        <p className="cf-dash-state__text">
                            {searching
                                ? "Prueba con otra palabra: se busca en el nombre, el correo y el teléfono."
                                : "Aparecerán aquí en cuanto alguien se registre."}
                        </p>
                        {searching && (
                            <button type="button" className="cf-dash-btn cf-dash-btn--ghost" onClick={() => setQuery("")}>
                                Borrar búsqueda
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <ul className="cf-clients__list">
                            <li className="cf-clients__head" aria-hidden="true">
                                <span />
                                <span>Cliente</span>
                                <span>Contacto</span>
                                <span>Servicios</span>
                                <span>Dirección principal</span>
                                <span>Estado</span>
                            </li>

                            {clients.map((client) => (
                                <ClientRow
                                    key={client.user_id}
                                    client={client}
                                    query={search}
                                    busy={togglingId === client.user_id}
                                    onSwitch={handleSwitch}
                                />
                            ))}
                        </ul>

                        <div className="cf-lpanel__foot">
                            <p role="status">
                                Mostrando {clients.length} de {total} {total === 1 ? "cliente" : "clientes"}
                            </p>

                            {quedan > 0 && (
                                <button
                                    type="button"
                                    className="cf-dash-btn cf-dash-btn--ghost cf-dash-btn--sm"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? "Cargando..." : "Ver más"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {confirming && (
                <dialog
                    ref={dialogRef}
                    className="cf-dash-modal"
                    aria-labelledby="confirm-client-title"
                    aria-describedby="confirm-client-text"
                    onClose={() => setConfirming(null)}
                    onClick={(event) => event.target === event.currentTarget && closeDialog()}
                >
                    <div className="cf-dash-modal__body">
                        <span className="cf-dash-modal__icon">
                            <i className="fa-solid fa-power-off" aria-hidden="true" />
                        </span>
                        <h2 className="cf-dash-modal__title" id="confirm-client-title">
                            ¿Dar de baja a {confirming.name} {confirming.last_name}?
                        </h2>

                        {/* Dos textos y no uno: si no tiene nada pendiente, avisar
                            de que no se recupera asusta sin motivo. */}
                        <div className="cf-dash-modal__text" id="confirm-client-text">
                            <p>Dejará de poder entrar en su cuenta.</p>

                            {confirming.pending_count > 0 ? (
                                <p className="cf-clients__warn">
                                    Y se cancelarán sus{" "}
                                    <strong>
                                        {confirming.pending_count}{" "}
                                        {confirming.pending_count === 1 ? "servicio pendiente" : "servicios pendientes"}
                                    </strong>
                                    , el primero el{" "}
                                    {new Date(confirming.next_pending_at).toLocaleDateString("es-ES", {
                                        day: "numeric", month: "long",
                                    })}
                                    . Se cancelan como CleanFlow, igual que cuando un trabajador causa baja.
                                    <strong> Volver a darle de alta no los recupera.</strong>
                                </p>
                            ) : (
                                <p>No tiene servicios pendientes, así que no se cancela nada.</p>
                            )}
                        </div>

                        <div className="cf-dash-modal__actions">
                            {/* autoFocus en Volver: con Enter no se da de baja por error. */}
                            <button type="button" className="cf-dash-btn cf-dash-btn--ghost" onClick={closeDialog} autoFocus>
                                Volver
                            </button>
                            <button type="button" className="cf-dash-btn cf-dash-btn--danger" onClick={confirmDeactivate}>
                                {confirming.pending_count > 0 ? "Dar de baja y cancelar" : "Dar de baja"}
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </section>
    )
}
