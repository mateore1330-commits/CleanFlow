/**
 * SERVICIOS CONTRATADOS · el listado del cliente (maqueta 04, PANEL-02).
 *
 * Todo lo que ha contratado, en filas, repartido en pestañas y con el
 * estado de cada servicio a la vista. Toda la fila lleva a su detalle.
 *
 * Solo lee: confirmar, reclamar, valorar y cancelar son otras issues y
 * añadirán sus botones en el detalle, no aquí.
 *
 * Estilos: dashboard.css, sección 9 (cf-myservices y cf-mybooking).
 */

import "../../dashboard.css";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { getMyBookings } from "../../services/bookingService";
import { BookingCard } from "../../components/dashboard/bookings/BookingCard";
import { BookingFilters, NO_FILTERS } from "../../components/dashboard/bookings/BookingFilters";
import { matchesSearch } from "../../components/dashboard/SearchBox";
import { PageHead } from "../../components/dashboard/PageHead";

// Lo que dice cada pestaña cuando se queda sin nada que enseñar.
const EMPTY_TAB = {
    all: "Todavía no hay nada que enseñar aquí.",
    pending: "No tienes ningún servicio por delante.",
    done: "Aquí aparecerán tus servicios en cuanto se hagan.",
    cancelled: "No has cancelado ningún servicio.",
};

/**
 * A qué pestaña va cada estado.
 *
 * "En curso" es un pendiente: el servicio se está haciendo ahora mismo,
 * así que no está ni realizado ni cancelado.
 */
const tabOf = (status) => {
    if (status === "cancelled") return "cancelled";
    if (status === "completed" || status === "not_done") return "done";

    return "pending";
};

/** ¿Entra este servicio en lo que se está buscando? */
const matchesFilters = (booking, { query, from, to }) => {
    if (!matchesSearch(query, booking.service?.name, booking.worker_name)) return false;

    // Por el primer día, que es la fecha que enseña la tarjeta. Las dos
    // fechas son ISO, así que se comparan como texto sin convertir nada.
    const day = booking.days[0].starts_at.slice(0, 10);

    return (!from || day >= from) && (!to || day <= to);
};

// Cuántas barras grises se pintan mientras llega la respuesta.
const SKELETON_ROWS = 3;

export const MyBookings = () => {
    const { store, dispatch } = useGlobalReducer();

    const [bookings, setBookings] = useState([]);
    const [filters, setFilters] = useState(NO_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const result = await getMyBookings(store.token);

        // Sesión caducada: se cierra aquí y ProtectedRoutes hace el resto.
        if (result.status === 401) {
            setLoading(false);
            dispatch({ type: "LOGOUT" });
            return;
        }

        if (result.ok) setBookings(result.data.bookings);
        else setError(result.data.message);

        setLoading(false);
    }, [store.token, dispatch]);

    useEffect(() => { load(); }, [load]);

    // Primero el texto y las fechas; la pestaña, al final. Así los
    // contadores dicen lo que va a salir al pulsar cada una y ninguna
    // promete servicios que el filtro ya ha descartado.
    const found = bookings.filter((booking) => matchesFilters(booking, filters));

    const shown = filters.tab === "all"
        ? found
        : found.filter((booking) => tabOf(booking.status) === filters.tab);

    // Con filtros puestos, un resultado vacío significa otra cosa.
    const filtering = Boolean(filters.query || filters.from || filters.to);

    const counts = found.reduce(
        (total, booking) => ({ ...total, [tabOf(booking.status)]: total[tabOf(booking.status)] + 1 }),
        { all: found.length, pending: 0, done: 0, cancelled: 0 }
    );

    return (
        <div className="cf-myservices">

            {/* ---------- CABECERA ---------- */}

            <PageHead
                title="Servicios contratados"
                subtitle="Todas tus limpiezas, las que vienen y las que ya pasaron."
                actions={
                    <Link to="/dashboard/book" className="cf-dash-btn cf-dash-btn--accent">
                        <i className="fa-solid fa-plus" aria-hidden="true"></i>
                        Contratar un servicio
                    </Link>
                }
            />

            {error && <p className="cf-dash-alert" role="alert">{error}</p>}

            {/* ---------- FILTROS ---------- */}

            <BookingFilters
                filters={filters}
                counts={counts}
                total={bookings.length}
                shown={shown.length}
                onChange={setFilters}
            />

            {/* ---------- LISTA ---------- */}

            {loading ? (
                <ul className="cf-myservices__list">
                    {Array.from({ length: SKELETON_ROWS }, (_, row) => (
                        <li key={row} aria-hidden="true">
                            <div className="cf-mybooking cf-mybooking--skel">
                                <div className="cf-dash-skel cf-mybooking__skel-date"></div>
                                <div>
                                    <div className="cf-dash-skel cf-mybooking__skel-title"></div>
                                    <div className="cf-dash-skel cf-mybooking__skel-meta"></div>
                                </div>
                                <div className="cf-dash-skel cf-mybooking__skel-state"></div>
                                <div className="cf-dash-skel cf-mybooking__skel-price"></div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : bookings.length === 0 ? (
                <div className="cf-dash-state">
                    <span className="cf-dash-state__icon">
                        <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                    </span>
                    <p className="cf-dash-state__title">Todavía no has contratado nada</p>
                    <p className="cf-dash-state__text">
                        Cuando reserves un servicio lo verás aquí, con su estado y sus fotos.
                    </p>
                    <Link to="/dashboard/book" className="cf-dash-btn">
                        <i className="fa-solid fa-plus" aria-hidden="true"></i>
                        Contratar un servicio
                    </Link>
                </div>
            ) : shown.length === 0 && filtering ? (
                <div className="cf-dash-state">
                    <span className="cf-dash-state__icon">
                        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    </span>
                    <p className="cf-dash-state__title">Ningún servicio coincide</p>
                    <p className="cf-dash-state__text">
                        Prueba con otro nombre o amplía las fechas.
                    </p>
                    <button type="button" className="cf-dash-btn cf-dash-btn--ghost" onClick={() => setFilters(NO_FILTERS)}>
                        Quitar filtros
                    </button>
                </div>
            ) : shown.length === 0 ? (
                <div className="cf-dash-state">
                    <span className="cf-dash-state__icon">
                        <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
                    </span>
                    <p className="cf-dash-state__title">Nada en esta pestaña</p>
                    <p className="cf-dash-state__text">{EMPTY_TAB[filters.tab]}</p>
                </div>
            ) : (
                <ul className="cf-myservices__list">
                    {shown.map((booking) => (
                        <BookingCard
                            key={booking.booking_id}
                            booking={booking}
                            to={`/dashboard/contracted-services/${booking.booking_id}`}
                        />
                    ))}
                </ul>
            )}

        </div>
    );
};
