/**
 * UNA FILA DE SERVICIOS CONTRATADOS (maqueta 04, PANEL-02).
 *
 * La fecha, el servicio con el día y la hora, quién va, el estado, el
 * precio y una flecha. Toda la fila es un enlace al detalle: funciona con
 * el ratón, con el teclado y con el lector de pantalla, sin trucos.
 *
 * Si espera la confirmación del cliente, lo dice debajo del día, en ámbar
 * y con los días que quedan: es lo que tiene que hacer.
 *
 * Estilos: dashboard.css, sección 9 (cf-mybooking).
 */

import { Link } from "react-router-dom";
import { BookingStatusPill, awaitsConfirmation } from "./BookingStatusPill";
import { EUROS, dayOf, monthOf, timeOf, daysLeft } from "./bookingFormat";
import { Avatar } from "../Avatar";

// "Sábado": el día de la semana del primer día.
const weekdayOf = (isoDate) => {
    const text = new Date(`${isoDate.slice(0, 10)}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long" });
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const BookingCard = ({ booking, to }) => {
    const [first] = booking.days;
    const moreDays = booking.days.length - 1;
    const waiting = awaitsConfirmation(booking);
    const left = waiting ? daysLeft(booking.completed_at) : 0;
    const cancelled = booking.status === "cancelled";

    return (
        <li>
            <Link className="cf-mybooking" to={to}>
                <span className="cf-mybooking__date" aria-hidden="true">
                    <b>{dayOf(first.starts_at)}</b>
                    <small>{monthOf(first.starts_at)}</small>
                </span>

                <span className="cf-mybooking__main">
                    <span className="cf-mybooking__service">
                        {booking.service?.name || "Servicio no disponible"}
                    </span>

                    <span className="cf-mybooking__meta">
                        {weekdayOf(first.starts_at)} · {timeOf(first.starts_at)} – {timeOf(first.ends_at)}
                        {/* Solo si el servicio dura varios días: lo normal es uno. */}
                        {moreDays > 0 && (
                            <b className="cf-mybooking__more">+{moreDays} {moreDays === 1 ? "día" : "días"}</b>
                        )}
                    </span>

                    {waiting && (
                        <span className="cf-mybooking__notice">
                            <i className="fa-solid fa-clock" aria-hidden="true"></i>
                            Confírmala
                            {left > 0 && `: ${left === 1 ? "queda 1 día" : `quedan ${left} días`}`}
                        </span>
                    )}
                </span>

                <span className="cf-mybooking__who">
                    <Avatar name={booking.worker_name} src={booking.worker_avatar_url} size="sm" tone="accent" />
                    {booking.worker_name || "Sin asignar"}
                </span>

                <span className="cf-mybooking__state">
                    <BookingStatusPill status={booking.status} awaitingConfirmation={waiting} />
                </span>

                {/* Cancelada, tachado: ya no se cobra. */}
                <span className={cancelled ? "cf-mybooking__price cf-mybooking__price--cancelled" : "cf-mybooking__price"}>
                    {EUROS.format(booking.total_price)}
                </span>

                <i className="fa-solid fa-chevron-right cf-mybooking__chevron" aria-hidden="true"></i>
            </Link>
        </li>
    );
};
