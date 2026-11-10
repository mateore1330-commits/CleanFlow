/**
 * TARJETA DE UN SERVICIO ASIGNADO (maqueta 05, PANEL-03).
 *
 * Una fila del listado del trabajador: cuándo, qué, a qué hora y dónde, en
 * qué punto está y, si hoy toca o ya está en marcha, cuántas tareas lleva.
 * Grande y fácil de tocar con el pulgar: la tarjeta entera es un enlace al
 * detalle, con el ratón, el teclado y el lector de pantalla.
 *
 * Las de hoy se distinguen con el borde y la fecha en color: son las
 * únicas que se pueden empezar.
 *
 * Estilos: dashboard.css, sección 10 (cf-wcard).
 */

import { Link } from "react-router-dom";
import { dayOf, monthOf, timeOf } from "../bookings/bookingFormat";
import { WorkerStatus } from "./WorkerStatus";

/** "Calle de Prueba, 1, Madrid": lo justo para reconocer la casa. */
const shortAddress = (address) =>
    address ? `${address.street}, ${address.number}, ${address.city}` : "Sin dirección";

export const WorkerBookingCard = ({ booking, today, to }) => {
    const [first] = booking.days;

    // Toda reserva nace con al menos un tramo, pero si alguna llegara sin
    // ellos la tarjeta reventaría y se llevaría la lista entera por
    // delante. Mejor no pintarla y que el resto se vea.
    if (!first) return null;

    const moreDays = booking.days.length - 1;
    const isToday = first.starts_at.slice(0, 10) === today;

    // La barra, solo cuando importa: hoy, o con el servicio en marcha.
    const total = booking.tasks.length;
    const done = booking.tasks.filter((task) => task.status === "completed").length;
    const showProgress = total > 0 && (isToday || booking.status === "in_progress");

    return (
        <li>
            <Link className={`cf-wcard${isToday ? " cf-wcard--today" : ""}`} to={to}>
                <span className="cf-wcard__date" aria-hidden="true">
                    <b>{dayOf(first.starts_at)}</b>
                    <small>{isToday ? "Hoy" : monthOf(first.starts_at)}</small>
                </span>

                <span className="cf-wcard__main">
                    <span className="cf-wcard__service">
                        {booking.service?.name || "Servicio no disponible"}
                        {/* Solo si dura varios días: lo normal es uno. */}
                        {moreDays > 0 && (
                            <b className="cf-wcard__more">+{moreDays} {moreDays === 1 ? "día" : "días"}</b>
                        )}
                    </span>

                    <span className="cf-wcard__meta">
                        {isToday && <span className="sr-only">Hoy, </span>}
                        {timeOf(first.starts_at)} – {timeOf(first.ends_at)} · {shortAddress(booking.address)}
                    </span>

                    {showProgress && (
                        <span className="cf-wcard__bar">
                            <span className="cf-wcard__track" aria-hidden="true">
                                <span className="cf-wcard__fill" style={{ width: `${(done / total) * 100}%` }}></span>
                            </span>
                            {done} de {total} tareas
                        </span>
                    )}
                </span>

                <span className="cf-wcard__state">
                    <WorkerStatus status={booking.status} />
                </span>
            </Link>
        </li>
    );
};
