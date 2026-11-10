/**
 * INICIO DEL TRABAJADOR (maqueta 05, PANEL-03).
 *
 * El día de un vistazo: arriba, el saludo con los servicios y las horas de
 * hoy. A la izquierda, el servicio de ahora en grande (dirección, cliente,
 * tareas y el botón), lo que se quedó a medias y lo que viene. A la
 * derecha, la jornada de hoy, la nota y las ausencias.
 *
 * Se refresca solo cada minuto y al volver a la pestaña: el móvil se deja
 * abierto en el bolsillo y vuelve del mapa.
 *
 * Estilos: dashboard.css, sección 16 (cf-worker-home__*, cf-wnow).
 */

import "../../../dashboard.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getWorkerBookings, startBookingDay } from "../../../services/bookingService";
import { madridToday, madridMoment } from "../../../utils/madridDate";
import { longDate, timeOf } from "../../../components/dashboard/bookings/bookingFormat";
import { WorkerAbsences } from "../../../components/dashboard/home/WorkerAbsences";
import { WorkerRating } from "../../../components/dashboard/worker/WorkerRating";
import { WorkerJourney } from "../../../components/dashboard/home/WorkerJourney";
import { WorkerUpcoming } from "../../../components/dashboard/home/WorkerUpcoming";
import { WorkerUnfinished } from "../../../components/dashboard/home/WorkerUnfinished";
import { workerHomeData, serviceName, addressText, hoursText, taskPath } from "../../../components/dashboard/home/workerHomeData";
import { PageHead } from "../../../components/dashboard/PageHead";

/** El enlace de Google Maps con la dirección, para ir sin escribirla. */
const mapsOf = (address) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export const WorkerHome = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acting, setActing] = useState(false);
    const [now, setNow] = useState(() => new Date());
    const mounted = useRef(false);
    const fetching = useRef(false);
    const actionLock = useRef(false);
    const today = madridToday(now);

    const load = useCallback(async () => {
        if (fetching.current) return;
        fetching.current = true;
        try {
            const result = await getWorkerBookings(store.token);
            if (!mounted.current) return;
            if (result.status === 401) {
                dispatch({ type: "LOGOUT" });
                return;
            }
            if (!result.ok) setError(result.data?.message || "No se ha podido cargar tu jornada.");
            else {
                setBookings(result.data.bookings || []);
                setError("");
            }
        } catch {
            if (mounted.current) setError("No se ha podido cargar tu jornada. Inténtalo de nuevo.");
        } finally {
            fetching.current = false;
            if (mounted.current) setLoading(false);
        }
    }, [store.token, dispatch]);

    useEffect(() => {
        mounted.current = true;
        load();
        const refresh = () => {
            if (document.visibilityState !== "hidden") {
                setNow(new Date());
                load();
            }
        };
        // Volver del mapa o dejar abierto el móvil no debe congelar la jornada.
        const timer = window.setInterval(refresh, 60000);
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            mounted.current = false;
            window.clearInterval(timer);
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [load]);

    const data = workerHomeData(bookings, today, madridMoment(now));
    const current = data.current;

    const openCurrent = async () => {
        if (!current || actionLock.current) return;
        const { booking, day } = current;
        if (day.started_at) {
            navigate(taskPath(booking));
            return;
        }
        actionLock.current = true;
        setActing(true);
        setError("");
        try {
            const result = await startBookingDay(booking.booking_id, day.booking_day_id, store.token);
            if (!mounted.current) return;
            if (result.status === 401) dispatch({ type: "LOGOUT" });
            else if (result.ok) navigate(taskPath(booking));
            else setError(result.data?.message || "No se ha podido empezar el servicio.");
        } catch {
            if (mounted.current) setError("No se ha podido empezar el servicio. Inténtalo de nuevo.");
        } finally {
            actionLock.current = false;
            if (mounted.current) setActing(false);
        }
    };

    if (loading) return (
        <div className="cf-worker-home" aria-busy="true" role="status">
            <p>Cargando tu jornada…</p>
            <div className="cf-dash-skel cf-worker-home__skeleton" aria-hidden="true" />
        </div>
    );

    // Sin una respuesta fiable no presentamos un falso día libre.
    if (error && bookings.length === 0) return (
        <div className="cf-worker-home cf-dash-state">
            <h1>Tu inicio</h1>
            <p role="alert">{error}</p>
            <button className="cf-dash-btn" onClick={load}>Reintentar</button>
        </div>
    );

    const name = store.user?.name?.trim().split(/\s+/)[0];
    const address = current && current.booking.address && addressText(current.booking.address);
    const next = data.future[0];

    // "Martes 10 de noviembre · 3 servicios · 9 h previstas hoy"
    const summary = data.services > 0
        ? `${longDate(today)} · ${data.services} ${data.services === 1 ? "servicio" : "servicios"} · ${hoursText(data.hours)} previstas hoy`
        : `${longDate(today)} · Sin servicios hoy`;

    return (
        <div className="cf-worker-home">
            {error && <div className="cf-dash-alert" role="alert">
                <p>{error}</p><button className="cf-dash-btn cf-dash-btn--ghost" onClick={load}>Reintentar</button>
            </div>}

            <PageHead title={`Hola${name ? `, ${name}` : ""}`} subtitle={summary} />

            <div className="cf-worker-home__grid">
                <div className="cf-worker-home__stack">
                    {current ? <CurrentService current={current} address={address} acting={acting} onOpen={openCurrent} />
                        : <section className="cf-wnow cf-wnow--empty" aria-labelledby="now-title">
                            <p className="cf-wnow__live">Hoy</p>
                            <h2 id="now-title">{data.journey.length ? "Has terminado tu jornada" : "Sin servicios hoy"}</h2>
                            <p className="cf-wnow__time">
                                {next ? `El siguiente: ${longDate(next.day.starts_at).toLowerCase()}, ${timeOf(next.day.starts_at)} – ${timeOf(next.day.ends_at)} · ${serviceName(next.booking)}.`
                                    : "No tienes próximos servicios asignados."}
                            </p>
                        </section>}
                    <WorkerUnfinished items={data.unfinished} />
                    <WorkerUpcoming today={today} future={data.future} />
                </div>

                <aside className="cf-worker-home__stack" aria-label="Tu información">
                    <WorkerJourney journey={data.journey} current={current} hours={data.hours} />
                    <section className="cf-worker-home__rating" aria-label="Tu nota">
                        <WorkerRating token={store.token} />
                    </section>
                    <WorkerAbsences today={today} />
                </aside>
            </div>
        </div>
    );
};

/**
 * EL SERVICIO DE AHORA, EN GRANDE.
 *
 * Todo lo que hace falta sin entrar al detalle: dónde (con el botón a
 * Google Maps), con quién (con el botón de llamar, si ya hay teléfono),
 * cuántas tareas lleva y el botón para empezar o seguir.
 */
const CurrentService = ({ current, address, acting, onOpen }) => {
    const { booking, day } = current;
    const started = Boolean(day.started_at);
    const pending = booking.status === "pending";
    const tasks = booking.tasks || [];
    const done = tasks.filter((task) => task.status === "completed").length;

    return (
        <section className="cf-wnow" aria-labelledby="now-title">
            <p className={`cf-wnow__live${started ? " cf-wnow__live--on" : ""}`}>
                {started ? "En curso" : "Tu siguiente servicio"}
            </p>
            <h2 id="now-title">{serviceName(booking)}</h2>
            <p className="cf-wnow__time">
                {timeOf(day.starts_at)} – {timeOf(day.ends_at)}
                {started && ` · empezaste a las ${timeOf(day.started_at)}`}
            </p>

            <div className="cf-wnow__rows">
                <div className="cf-wnow__row">
                    <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                    <div><small>Dirección</small>{address || "Dirección no disponible"}</div>
                    {address && (
                        <a className="cf-wnow__act" href={mapsOf(address)} target="_blank" rel="noreferrer"
                            aria-label="Abrir la dirección en Google Maps">
                            <i className="fa-solid fa-diamond-turn-right" aria-hidden="true"></i>
                        </a>
                    )}
                </div>

                <div className="cf-wnow__row">
                    <i className="fa-solid fa-user" aria-hidden="true"></i>
                    <div><small>Cliente</small>{booking.client_name || "Cliente"}</div>
                    {booking.client_phone && (
                        <a className="cf-wnow__act" href={`tel:${booking.client_phone}`}
                            aria-label={`Llamar al cliente, ${booking.client_phone}`}>
                            <i className="fa-solid fa-phone" aria-hidden="true"></i>
                        </a>
                    )}
                </div>
            </div>

            {tasks.length > 0 && <>
                <p className="cf-wnow__prog-l"><span>Tareas</span><b>{done} de {tasks.length}</b></p>
                <span className="cf-wnow__prog" aria-hidden="true">
                    <span style={{ width: `${(done / tasks.length) * 100}%` }}></span>
                </span>
            </>}

            {pending && <p className="cf-wnow__note">Está pendiente de confirmar: podrás empezar cuando se confirme.</p>}

            <button className="cf-dash-btn cf-wnow__btn" disabled={acting || pending} onClick={onOpen}>
                {acting ? "Empezando…" : started ? "Seguir con el servicio" : "Empezar el servicio"}
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
        </section>
    );
};
