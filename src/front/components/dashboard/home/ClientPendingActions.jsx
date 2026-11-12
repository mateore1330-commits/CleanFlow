/**
 * LO QUE LE TOCA AL CLIENTE (Inicio, maqueta 04, PANEL-02).
 *
 * Confirmar cómo fue un servicio (lo que caduca, primero y destacado),
 * valorarlo o seguir una reclamación. Cada fila lleva al detalle de la
 * reserva, que es donde se hace. Sin nada pendiente, no se pinta.
 *
 * Estilos: dashboard.css (cf-client-pending*, cf-client-action*).
 */

import { Link } from "react-router-dom";

// El servicio se da por bueno solo a los 3 días de terminar. Los nombres
// van tal cual, sin artículo: «la fin de obra» no concuerda.
const confirmationDeadline = (completedAt) => {
    if (!completedAt) return "";

    const deadline = new Date(`${completedAt.slice(0, 10)}T12:00:00`);
    deadline.setDate(deadline.getDate() + 3);

    return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
    }).format(deadline);
};

// El día en que se hizo: "Del 2 de noviembre".
const doneOn = (booking) => {
    const date = booking.completed_at || booking.days?.[0]?.starts_at;
    if (!date) return "";
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" })
        .format(new Date(`${date.slice(0, 10)}T12:00:00`));
};

const ActionRow = ({ booking, title, text, action, icon, tone, primary = false }) => (
    <li className={`cf-client-action cf-client-action--${tone}`}>
        <span className="cf-client-action__icon" aria-hidden="true">
            <i className={`fa-solid ${icon}`}></i>
        </span>

        <div className="cf-client-action__content">
            <b>{title}</b>
            <span>{text}</span>
        </div>

        <Link
            to={`/dashboard/contracted-services/${booking.booking_id}`}
            className={primary ? "cf-dash-btn cf-dash-btn--sm" : "cf-dash-btn cf-dash-btn--sm cf-dash-btn--ghost"}
        >
            {action}
        </Link>
    </li>
);

export const ClientPendingActions = ({ bookings }) => {
    // Lo que caduca aparece primero porque requiere una respuesta rápida.
    const confirmations = bookings.filter(
        (booking) => booking.confirmation === "pending"
    );

    const reviews = bookings.filter(
        (booking) =>
            ["confirmed", "auto_confirmed"].includes(booking.confirmation) &&
            !booking.review
    );

    const claims = bookings.filter(
        (booking) => booking.confirmation === "in_review"
    );

    const total = confirmations.length + reviews.length + claims.length;

    if (total === 0) return null;

    return (
        <section className="cf-client-pending" aria-labelledby="client-pending-title">
            <div className="cf-client-pending__head">
                <div>
                    <p className="cf-client-pending__eyebrow">Pendientes</p>
                    <h2 className="cf-client-pending__title" id="client-pending-title">Lo que te toca</h2>
                </div>
                <span className="cf-client-pending__count">
                    {total}
                    <span className="sr-only"> pendientes</span>
                </span>
            </div>

            <ul className="cf-client-pending__list">
                {confirmations.map((booking) => (
                    <ActionRow
                        key={`confirmation-${booking.booking_id}`}
                        booking={booking}
                        title={`Confirma cómo fue ${booking.service.name}`}
                        text={
                            booking.completed_at
                                ? `Se dará por bueno el ${confirmationDeadline(booking.completed_at)}`
                                : "Confírmala o cuéntanos si algo no fue bien"
                        }
                        action="Responder"
                        icon="fa-clock"
                        tone="urgent"
                        primary
                    />
                ))}

                {reviews.map((booking) => (
                    <ActionRow
                        key={`review-${booking.booking_id}`}
                        booking={booking}
                        title={`Valora ${booking.service.name}`}
                        text={[doneOn(booking) && `Del ${doneOn(booking)}`, booking.worker_name && `con ${booking.worker_name}`].filter(Boolean).join(" ")}
                        action="Valorar"
                        icon="fa-star"
                        tone="review"
                    />
                ))}

                {claims.map((booking) => (
                    <ActionRow
                        key={`claim-${booking.booking_id}`}
                        booking={booking}
                        title={`Reclamación de ${booking.service.name}`}
                        text="Estamos mirando lo que pasó. Aquí puedes ver cómo va."
                        action="Ver estado"
                        icon="fa-magnifying-glass"
                        tone="info"
                    />
                ))}
            </ul>
        </section>
    );
};
