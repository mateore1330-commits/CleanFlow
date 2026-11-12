/**
 * UNA INCIDENCIA, VISTA POR EL ENCARGADO (maqueta 06, PANEL-04).
 *
 * Arriba, su estado, el motivo y quién la abrió y cuándo. Luego de qué
 * servicio habla, qué pasó entre comillas y sus fotos. Con el botón de
 * resolver mientras siga abierta, y con la nota cuando ya se cerró. El
 * borde izquierdo dice el estado: rojo abierta, verde resuelta.
 *
 * Un "servicio no realizado" se distingue a simple vista: no es una
 * figura rota, es un cliente sin servicio y un hueco que decidir.
 *
 * Solo pinta y avisa; quien llama a la API es la página.
 *
 * Estilos: dashboard.css, sección 11 (cf-incard).
 */

import { longDate, shortMoment, timeOf } from "../bookings/bookingFormat";

// El motivo, dicho como en el formulario del trabajador: al lado sale
// quién la abrió, y con "Del cliente" en los dos sitios no se sabía si
// hablaba de la culpa o de quién la escribió.
const TYPES = {
    client: "Por algo del cliente",
    company: "Por algo nuestro",
};

export const IncidentCard = ({ incident, busy, onResolve, onZoom }) => {
    const booking = incident.booking || {};

    // La incidencia de un servicio que no se pudo hacer: la abre el
    // trabajador al marcarlo, y es la que hay que atender antes.
    const notDone = booking.status === "not_done";

    const classes = [
        "cf-incard",
        incident.resolved && "cf-incard--done",
        notDone && !incident.resolved && "cf-incard--notdone",
    ].filter(Boolean).join(" ");

    return (
        <li>
            <article className={classes}>

                <div className="cf-incard__top">
                    {incident.resolved ? (
                        <span className="cf-bookstate cf-bookstate--done">
                            <i className="fa-solid fa-check" aria-hidden="true"></i>
                            Resuelta
                        </span>
                    ) : (
                        <span className="cf-bookstate cf-bookstate--fail">
                            <span className="cf-bookstate__dot"></span>
                            Abierta
                        </span>
                    )}

                    {notDone && (
                        <span className="cf-incard__tag cf-incard__tag--notdone">
                            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                            Servicio no realizado
                        </span>
                    )}

                    <span className={`cf-incard__tag cf-incard__tag--${incident.incident_type}`}>
                        {TYPES[incident.incident_type] || "Incidencia"}
                    </span>

                    <span className="cf-incard__who">
                        {incident.source === "client"
                            ? "La abrió el cliente"
                            : `La abrió ${booking.worker_name || "el trabajador"}`}
                        {incident.created_at && ` · ${shortMoment(incident.created_at)}`}
                    </span>
                </div>

                <div className="cf-incard__ref">
                    <h2 className="cf-incard__service">
                        {booking.service || "Servicio no disponible"}
                    </h2>

                    {/* «Trabajador» y no «Trabajadora»: no sabemos quién es, y
                        es la palabra de las columnas de Reservas. */}
                    <p className="cf-incard__meta">
                        Reserva n.º {incident.booking_id}
                        {booking.starts_at && <> · {longDate(booking.starts_at)}, {timeOf(booking.starts_at)}</>}
                        {booking.client_name && ` · Cliente: ${booking.client_name}`}
                        {booking.worker_name && ` · Trabajador: ${booking.worker_name}`}
                    </p>
                </div>

                <p className="cf-incard__text">«{incident.description}»</p>

                {incident.media?.length > 0 && (
                    <div className="cf-incard__shots">
                        {incident.media.map((photo) => (
                            <button
                                key={photo.media_id}
                                type="button"
                                className="cf-bookshot"
                                onClick={() => onZoom({
                                    url: photo.media_url,
                                    label: `Incidencia de la reserva n.º ${incident.booking_id}`,
                                })}
                            >
                                <img
                                    className="cf-bookshot__img"
                                    src={photo.media_url}
                                    alt="Foto de la incidencia"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Ya cerrada: se enseña lo que se decidió y desaparece el
                    botón. No se puede reabrir ni reescribir. */}
                {incident.resolved && incident.resolution && (
                    <p className="cf-incard__fix">
                        <strong>
                            Resuelta
                            {incident.resolved_at &&
                                ` el ${longDate(incident.resolved_at).toLowerCase()}`}
                        </strong>
                        {incident.resolution}
                    </p>
                )}

                {!incident.resolved && (
                    <div className="cf-incard__foot">
                        {/* Lo que pasa mientras: si la abrió el cliente, su
                            reserva espera a que se resuelva. */}
                        {incident.source === "client" && (
                            <span className="cf-incard__note">La reserva está en revisión hasta que la resuelvas.</span>
                        )}

                        <button
                            type="button"
                            className="cf-dash-btn cf-dash-btn--sm"
                            disabled={busy}
                            onClick={() => onResolve(incident)}
                        >
                            <i className="fa-solid fa-check" aria-hidden="true"></i>
                            Resolver
                        </button>
                    </div>
                )}

            </article>
        </li>
    );
};
