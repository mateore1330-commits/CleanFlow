/**
 * LA ACCIÓN DEL MOMENTO.
 *
 * Empezar, cerrar el día o finalizar el servicio. Solo una de las tres
 * tiene sentido en cada instante, así que solo se enseña una, con el
 * motivo escrito encima cuando todavía no se puede pulsar.
 *
 * Decide lo mismo que el backend, pero el backend manda: si responde
 * 409, la página enseña su mensaje. Esto solo evita el viaje.
 *
 * Debajo van las dos salidas de la #18: abrir una incidencia, que no
 * cambia nada del servicio, y darlo por no realizado, que lo cierra
 * para siempre.
 *
 * En el móvil, el botón del momento baja a una barra fija abajo
 * (WorkerActionBar, maqueta 05): siempre a mano, sin bajar hasta el final
 * de la pantalla. La página la pinta fuera de su contenedor, porque un
 * contenedor con container-type no deja a nada quedarse fijo a la
 * pantalla.
 *
 * Solo pinta y avisa: quien llama a la API es la página.
 *
 * Estilos: dashboard.css, sección 10 (cf-wact).
 */

import { dayOfToday } from "./WorkerToday";

/**
 * Qué toca ahora: { action, label, icon, ready, note } o null si no hay
 * nada que hacer (el servicio ya está cerrado, o no es hoy).
 */
export const nextAction = (booking, today) => {
    // Un servicio terminado, cancelado o no realizado ya no se toca.
    if (!["confirmed", "pending", "in_progress"].includes(booking.status)) return null;

    // Pendiente de confirmar: el backend solo deja empezar las
    // confirmadas, así que el botón se ve pero apagado, con el motivo.
    if (booking.status === "pending") {
        return {
            note: "Podrás empezar cuando se confirme.",
            label: "Empezar el servicio",
            icon: "fa-play",
            action: "start",
            ready: false,
        };
    }

    const day = dayOfToday(booking, today);

    // Sin tramo hoy no hay nada que empezar ni que cerrar: se prepara y
    // se vuelve el día que toca.
    if (!day) {
        return {
            note: "Podrás empezar el día del servicio.",
            label: "Empezar el servicio",
            icon: "fa-play",
            action: "start",
            ready: false,
        };
    }

    if (!day.started_at) {
        return { label: "Empezar el servicio", icon: "fa-play", action: "start", ready: true };
    }

    if (day.finished_at) {
        return { note: "Has cerrado el día. Nos vemos mañana.", label: null };
    }

    // Quedan días por delante: hoy se cierra, el servicio no.
    const ahead = booking.days.some((other) => other.starts_at.slice(0, 10) > today);

    if (ahead) {
        return {
            note: "Quedan tareas para los próximos días.",
            label: "Terminar el día",
            icon: "fa-arrow-right",
            action: "finishDay",
            ready: true,
            ghost: true,
        };
    }

    // Último día: para finalizar hay que haberlo cerrado todo.
    const pending = booking.tasks.filter((task) => task.status !== "completed").length;

    return {
        note: pending > 0
            ? `Te ${pending === 1 ? "falta 1 tarea" : `faltan ${pending} tareas`} por cerrar.`
            : null,
        label: "Finalizar servicio",
        icon: "fa-flag-checkered",
        action: "complete",
        ready: pending === 0,
    };
};

/** El botón del momento, con su motivo debajo si todavía no se puede. */
const MainButton = ({ next, busy, onAction }) => (
    <>
        <button
            type="button"
            className={`cf-dash-btn${next.ghost ? " cf-dash-btn--ghost" : ""}`}
            disabled={!next.ready || busy}
            onClick={() => onAction(next.action)}
        >
            <i className={`fa-solid ${next.icon}`} aria-hidden="true"></i>
            {next.label}
        </button>

        {next.note && <p className="cf-wact__note">{next.note}</p>}
    </>
);

export const WorkerActions = ({ booking, today, busy, onAction, onIncident, onNotDone }) => {
    const next = nextAction(booking, today);

    // Una incidencia se puede abrir mientras el servicio siga vivo.
    const canReport = booking.status !== "cancelled";

    // Darlo por no realizado, solo el día y antes de cerrarlo: las mismas
    // reglas que el backend.
    const canGiveUp =
        ["confirmed", "pending", "in_progress"].includes(booking.status)
        && booking.days.some((day) => day.starts_at.slice(0, 10) === today);

    // Sin acción y sin nada que contar, el bloque entero sobra.
    if (!next && !canReport) return null;

    return (
        <section className="cf-wblock cf-wact" aria-label="Qué hacer ahora">
            {/* En el móvil esta parte se esconde: la lleva la barra fija. */}
            {next?.label && (
                <div className="cf-wact__main">
                    <MainButton next={next} busy={busy} onAction={onAction} />
                </div>
            )}

            {next && !next.label && next.note && <p className="cf-wact__note">{next.note}</p>}

            {canReport && (
                <>
                    <p className="cf-wact__sep">¿Ha pasado algo?</p>

                    <button
                        type="button"
                        className="cf-dash-btn cf-dash-btn--ghost"
                        disabled={busy}
                        onClick={onIncident}
                    >
                        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                        Abrir incidencia
                    </button>

                    {/* Cierra el servicio para siempre: como un enlace rojo,
                        sin botón llamativo, y con su confirmación detrás. */}
                    {canGiveUp && (
                        <button
                            type="button"
                            className="cf-wact__danger"
                            disabled={busy}
                            onClick={onNotDone}
                        >
                            No se ha podido hacer el servicio
                        </button>
                    )}
                </>
            )}
        </section>
    );
};

/**
 * LA BARRA FIJA DEL MÓVIL.
 *
 * El mismo botón que el bloque de acciones, pegado abajo de la pantalla.
 * Solo se ve en pantallas estrechas (dashboard.css, cf-wbar); en las
 * anchas el botón está en su bloque, a la vista.
 */
export const WorkerActionBar = ({ booking, today, busy, onAction }) => {
    const next = nextAction(booking, today);

    if (!next?.label) return null;

    return (
        <div className="cf-wbar">
            <MainButton next={next} busy={busy} onAction={onAction} />
        </div>
    );
};
