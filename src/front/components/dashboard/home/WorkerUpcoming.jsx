/**
 * LO QUE VIENE (maqueta 05, PANEL-03).
 *
 * Los próximos siete días, uno por fila: el día, el servicio con su zona
 * y la hora. Los días sin nada dicen «Día libre»: así se ve la semana
 * entera, no solo lo que hay.
 *
 * Estilos: dashboard.css, sección 16 (cf-wweek).
 */

import { addCalendarDays } from "../../../utils/madridDate";
import { timeOf } from "../bookings/bookingFormat";
import { serviceName } from "./workerHomeData";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** "Jue 12": el día de la semana corto y el número. */
const shortDay = (isoDate) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return `${WEEKDAYS[new Date(year, month - 1, day).getDay()]} ${day}`;
};

export const WorkerUpcoming = ({ today, future }) => (
    <section className="cf-worker-home__card" aria-labelledby="upcoming-title">
        <div className="cf-worker-home__head">
            <div>
                <p className="cf-dash-eyebrow">Para organizarte</p>
                <h2 id="upcoming-title">Lo que viene</h2>
            </div>
        </div>

        <ul className="cf-wweek">
            {Array.from({ length: 7 }, (_, index) => {
                const date = addCalendarDays(today, index + 1);
                const rows = future.filter(({ day }) => day.starts_at.slice(0, 10) === date);

                if (rows.length === 0) {
                    return (
                        <li key={date}>
                            <b>{shortDay(date)}</b>
                            <span className="cf-wweek__free">Día libre</span>
                        </li>
                    );
                }

                // Con dos servicios el mismo día, el día se dice una vez.
                return rows.map(({ key, booking, day }, position) => (
                    <li key={key}>
                        <b>{position === 0 ? shortDay(date) : ""}</b>
                        <span>{serviceName(booking)} · {booking.address?.city || "Zona no disponible"}</span>
                        <small>{timeOf(day.starts_at)} – {timeOf(day.ends_at)}</small>
                    </li>
                ));
            })}
        </ul>
    </section>
);
