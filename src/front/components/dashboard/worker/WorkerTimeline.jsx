/**
 * LÍNEA DE TIEMPO DEL SERVICIO, PARA EL TRABAJADOR.
 *
 * Tres hitos: asignado, en curso y finalizado, cada uno con su hora real
 * (o «Pendiente»). Y dos finales que cortan el camino: cancelado y no
 * realizado.
 *
 * En vertical en la columna de la derecha, como en la maqueta 05. En el
 * móvil va tumbada: tres hitos en columna se comerían media pantalla.
 *
 * Estilos: dashboard.css, sección 10 (cf-wtrack).
 */

import { shortMoment } from "../bookings/bookingFormat";

const DONE = { icon: "fa-check", tone: "" };
const TODO = { icon: "fa-circle", tone: "--todo" };
const STOPPED = { icon: "fa-xmark", tone: "--fail" };
// El paso en el que se está: en marcha, con el play (maqueta 05).
const NOW = { icon: "fa-play", tone: "--now" };

/** Los hitos de este servicio, en orden. */
const stepsOf = (booking) => {
    // Pendiente todavía no es «Asignado»: se dice tal cual (PANEL-03).
    const assigned = booking.status === "pending"
        ? { icon: "fa-clock", tone: "--now", name: "Pendiente de confirmar" }
        : { ...DONE, name: "Asignado" };

    if (booking.status === "cancelled") {
        return [assigned, { ...STOPPED, name: "Cancelado" }];
    }

    if (booking.status === "not_done") {
        return [
            assigned,
            {
                ...STOPPED,
                name: "No realizado",
                when: booking.started_at && shortMoment(booking.started_at),
            },
        ];
    }

    return [
        assigned,
        booking.started_at
            ? { ...(booking.completed_at ? DONE : NOW), name: "En curso", when: shortMoment(booking.started_at) }
            : { ...TODO, name: "En curso", when: "Pendiente" },
        booking.completed_at
            ? { ...DONE, name: "Finalizado", when: shortMoment(booking.completed_at) }
            : { ...TODO, name: "Finalizado", when: "Pendiente" },
    ];
};

export const WorkerTimeline = ({ booking }) => (
    <section className="cf-wblock">
        <h2 className="cf-wblock__title">Progreso</h2>

        <div className="cf-wtrack">
            {stepsOf(booking).map((step) => (
                <div key={step.name} className={`cf-wtrack__step cf-wtrack__step${step.tone}`}>
                    <span className="cf-wtrack__mark">
                        <i className={`fa-solid ${step.icon}`} aria-hidden="true"></i>
                    </span>
                    <span className="cf-wtrack__name">{step.name}</span>
                    {step.when && <span className="cf-wtrack__when">{step.when}</span>}
                </div>
            ))}
        </div>
    </section>
);
