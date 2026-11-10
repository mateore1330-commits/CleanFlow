/**
 * TU JORNADA (maqueta 05, PANEL-03).
 *
 * Los servicios de hoy en una línea vertical: la hora, un punto (hecho, el
 * de ahora o pendiente) y el servicio con su calle. Arriba a la derecha,
 * las horas previstas del día.
 *
 * Estilos: dashboard.css, sección 16 (cf-wjourney).
 */

import { serviceName, hoursText } from "./workerHomeData";
import { timeOf } from "../bookings/bookingFormat";

export const WorkerJourney = ({ journey, current, hours }) => journey.length > 0 && (
    <section className="cf-worker-home__card" aria-labelledby="journey-title">
        <div className="cf-worker-home__head">
            <div>
                <p className="cf-dash-eyebrow">Hoy</p>
                <h2 id="journey-title">Tu jornada</h2>
            </div>
            <span className="cf-worker-home__aside-n">{hoursText(hours)}</span>
        </div>

        <ol className="cf-wjourney">
            {journey.map((row) => {
                const finished = row.day.finished_at || row.booking.status === "completed";
                const now = row.key === current?.key;
                const state = finished ? "Terminado" : now ? "Ahora" : "Pendiente";

                return (
                    <li
                        key={row.key}
                        className={finished ? "cf-wjourney--done" : now ? "cf-wjourney--now" : undefined}
                        aria-current={now ? "step" : undefined}
                    >
                        <time>{timeOf(row.day.starts_at)}</time>
                        <span className="cf-wjourney__dot" aria-hidden="true"></span>
                        <div>
                            <b>{serviceName(row.booking)}</b>
                            <span>
                                {row.booking.address?.street
                                    ? `${row.booking.address.street} ${row.booking.address.number} · `
                                    : ""}
                                {state}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ol>
    </section>
);
