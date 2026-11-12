/**
 * LA PRÓXIMA LIMPIEZA DEL CLIENTE (Inicio, maqueta 04, PANEL-02).
 *
 * La tarjeta grande y oscura del Inicio: cuándo, qué, quién viene y dónde,
 * con «Ver detalles» y, si todavía se puede, «Cambiar fecha». Sin ninguna
 * próxima, invita a reservar.
 *
 * Estilos: dashboard.css (cf-client-next*).
 */

import { Link } from "react-router-dom";
import { Avatar } from "../Avatar";

// Las horas que faltan para que empiece y hasta cuándo se puede cambiar,
// las mismas que el servidor (Booking.change_deadline): 24 h antes.
const CHANGE_HOURS = 24;

const madridDate = (date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);

// "Hoy", "Mañana" o "El sábado 14": lo que se dice en voz alta.
const dayLabel = (startsAt) => {
    const date = startsAt.slice(0, 10);

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    if (date === madridDate()) return "Hoy";
    if (date === madridDate(tomorrowDate)) return "Mañana";

    const text = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric" })
        .format(new Date(`${date}T12:00:00`));

    return `El ${text}`;
};

// La fecha de la cajita: "SÁB" y "14".
const dateBox = (startsAt) => {
    const date = new Date(`${startsAt.slice(0, 10)}T12:00:00`);
    return {
        weekday: new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date).replace(".", ""),
        day: date.getDate(),
    };
};

const hoursOf = (day) =>
    Math.round((Date.parse(day.ends_at) - Date.parse(day.starts_at)) / 3600000);

// "4,9": la nota con coma, como se escribe en español.
const ratingText = (rating) => Number(rating).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// "C/ Alcalá 120, 3.º B": lo justo para reconocer la casa.
const shortAddress = (address) => {
    if (!address) return "Dirección pendiente";
    const floor = address.floor ? `, ${address.floor}` : "";
    return `${address.street} ${address.number}${floor}`;
};

// Solo se ofrece cambiar la fecha mientras se puede: confirmada y a más de
// 24 h del primer día. Lo vuelve a comprobar el servidor en el detalle.
const canChange = (booking) => {
    if (booking.status !== "confirmed") return false;
    const firstStart = Math.min(...(booking.days || []).map((day) => Date.parse(day.starts_at)));
    return Number.isFinite(firstStart) && firstStart - CHANGE_HOURS * 3600000 > Date.now();
};


export const NextBooking = ({ booking, day }) => {
    if (!booking || !day) {
        return (
            <section className="cf-client-next cf-client-next--empty">
                <p className="cf-client-next__eyebrow">Tu próxima limpieza</p>
                <h2 className="cf-client-next__title">No tienes ninguna limpieza próxima</h2>
                <p className="cf-client-next__meta">Cuando reserves una, aquí verás cuándo vamos y quién va.</p>

                <div className="cf-client-next__actions">
                    <Link to="/dashboard/book" className="cf-dash-btn cf-dash-btn--accent">
                        <i className="fa-solid fa-plus" aria-hidden="true"></i>
                        Reservar limpieza
                    </Link>
                </div>
            </section>
        );
    }

    const box = dateBox(day.starts_at);
    const detail = `/dashboard/contracted-services/${booking.booking_id}`;
    const hours = hoursOf(day);

    return (
        <section className="cf-client-next" aria-labelledby="client-next-title">
            <p className="cf-client-next__eyebrow">Tu próxima limpieza</p>

            <div className="cf-client-next__when">
                <div className="cf-client-next__datebox" aria-hidden="true">
                    <small>{box.weekday}</small>
                    <b>{box.day}</b>
                </div>

                <div>
                    <h2 className="cf-client-next__title" id="client-next-title">{booking.service.name}</h2>
                    <p className="cf-client-next__meta">
                        {dayLabel(day.starts_at)} · {day.starts_at.slice(11, 16)} – {day.ends_at.slice(11, 16)} · {hours} h
                    </p>
                </div>
            </div>

            <div className="cf-client-next__grid">
                <div className="cf-client-next__item">
                    {booking.worker_name
                        ? <Avatar name={booking.worker_name} src={booking.worker_avatar_url} size="sm" tone="accent" />
                        : <i className="fa-solid fa-user" aria-hidden="true"></i>}
                    <div>
                        <small>Quién viene</small>
                        {booking.worker_name || "Por asignar"}
                        {/* Su nota, si ya tiene valoraciones (worker_rating). */}
                        {booking.worker_rating != null && (
                            <span className="cf-client-next__rating">
                                <i className="fa-solid fa-star" aria-hidden="true"></i>
                                {ratingText(booking.worker_rating)}
                                <span className="sr-only"> de 5</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="cf-client-next__item">
                    <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                    <div>
                        <small>Dónde</small>
                        {shortAddress(booking.address)}
                    </div>
                </div>
            </div>

            <div className="cf-client-next__actions">
                <Link to={detail} className="cf-dash-btn cf-dash-btn--accent">Ver detalles</Link>
                {/* La fecha se cambia en el detalle, que es donde está el formulario. */}
                {canChange(booking) && (
                    <Link to={detail} className="cf-dash-btn cf-client-next__ghost">Cambiar fecha</Link>
                )}
            </div>
        </section>
    );
};
