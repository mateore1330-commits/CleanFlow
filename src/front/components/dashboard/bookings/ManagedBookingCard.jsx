/**
 * UNA FILA DE RESERVAS, VISTA POR EL ENCARGADO (maqueta 06, PANEL-04).
 *
 * La fecha, el servicio con el día y la hora, el Cliente y el Trabajador
 * en columnas separadas (con su nombre, para no confundirlos), el estado y
 * el precio. En el móvil, cliente y trabajador bajan con su etiqueta
 * delante.
 *
 * Las dos marcas van junto al servicio y NO se pintan igual, a propósito:
 *
 *   Afectada       ámbar -> se resuelve aquí mismo, en un diálogo
 *   N incidencias  rojo  -> lleva a Incidencias, que tiene su pantalla
 *
 * La fila no se abre: el detalle desde Reservas no entra (PENDIENTES.md).
 *
 * Solo pinta: avisa con onAffected y onIncidents.
 *
 * Estilos: dashboard.css, sección «Reservas (encargado)» (cf-mrow).
 */

import { BookingStatusPill } from "./BookingStatusPill"
import { EUROS, dayOf, monthOf, timeOf } from "./bookingFormat"
import { Avatar } from "../Avatar"

// "Ausencia: baja" -> "baja". El motivo se lee dentro de la frase de la
// marca, así que va en minúscula y sin la etiqueta de delante.
const motivoCorto = (reason) => reason.replace(/^Ausencia:\s*/, "").toLowerCase()

// "Jueves": el día de la semana del primer día.
const diaSemana = (iso) => {
    const texto = new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long" })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export const ManagedBookingCard = ({ booking, onAffected, onIncidents }) => {
    const [primero] = booking.days
    const masDias = booking.days.length - 1

    const motivos = booking.affected_reasons || []
    const incidencias = booking.open_incidents || 0
    const cancelada = booking.status === "cancelled"

    return (
        <li className="cf-mrow">
            <span className="cf-mrow__date" aria-hidden="true">
                <b>{dayOf(primero.starts_at)}</b>
                <small>{monthOf(primero.starts_at)}</small>
            </span>

            <div className="cf-mrow__main">
                <p className="cf-mrow__service">
                    {booking.service_name}

                    {motivos.length > 0 && (
                        <button
                            type="button"
                            className="cf-mrow__mark cf-mrow__mark--affected"
                            onClick={() => onAffected(booking)}
                        >
                            <i className="fa-solid fa-user-slash" aria-hidden="true"></i>
                            Afectada · {motivos.map(motivoCorto).join(", ")}
                        </button>
                    )}

                    {incidencias > 0 && (
                        <button
                            type="button"
                            className="cf-mrow__mark cf-mrow__mark--incident"
                            onClick={() => onIncidents(booking)}
                        >
                            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                            {incidencias === 1 ? "1 incidencia" : `${incidencias} incidencias`}
                        </button>
                    )}
                </p>

                <p className="cf-mrow__sub">
                    {diaSemana(primero.starts_at)} {dayOf(primero.starts_at)} {monthOf(primero.starts_at)}
                    {" · "}{timeOf(primero.starts_at)} – {timeOf(primero.ends_at)}
                    {masDias > 0 && <b className="cf-mrow__more">+{masDias} {masDias === 1 ? "día" : "días"}</b>}
                </p>
            </div>

            <p className="cf-mrow__who" data-label="Cliente">
                <span className="cf-mrow__label">Cliente</span>
                <Avatar name={booking.client_name} src={booking.client_avatar_url} size="sm" />
                <span className="cf-mrow__name">{booking.client_name}</span>
            </p>

            <p className="cf-mrow__who" data-label="Trabajador">
                <span className="cf-mrow__label">Trabajador</span>
                <Avatar name={booking.worker_name} src={booking.worker_avatar_url} size="sm" tone="accent" />
                <span className={`cf-mrow__name${booking.worker_name ? "" : " cf-mrow__name--none"}`}>
                    {booking.worker_name || "Sin asignar"}
                </span>
            </p>

            <span className="cf-mrow__state">
                <BookingStatusPill status={booking.status} />
            </span>

            {/* Cancelada, tachado: ya no se cobra. */}
            <span className={`cf-mrow__price${cancelada ? " cf-mrow__price--cancelled" : ""}`}>
                {EUROS.format(booking.total_price)}
            </span>
        </li>
    )
}
