/**
 * ELEGIR QUIÉN VIENE (#14).
 *
 * Tarjetas con "Cualquiera" delante y, detrás, los trabajadores a los que
 * se puede reservar. Son radios de verdad, así que funcionan con teclado y
 * con lector de pantalla.
 *
 *   workers   los de GET /api/availability/workers
 *   value     "any" o el id elegido, siempre como texto
 *
 * `rating` y `reviews_count`: su nota media y cuántas opiniones tiene
 * (desde PANEL-02 los manda también GET /api/availability/workers).
 *
 * Estilos: dashboard.css (cf-booking__*).
 */

import { Avatar } from "../Avatar"

// Sin trabajador elegido: lo asigna la disponibilidad. Es lo que espera la
// API, y también el valor por defecto.
export const ANY_WORKER = "any"

/** "4,9": la nota con coma, como se escribe en español. */
const ratingText = (rating) => Number(rating).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** La API manda el nombre ya recortado ("Ana G."); Avatar lo quiere en dos. */
const workerUser = (worker) => {
    const [name, ...rest] = worker.name.split(" ")

    return { name, last_name: rest.join(" "), avatar_url: worker.avatar_url }
}

export const WorkerPicker = ({ workers, value, onChange }) => (
    <div className="cf-booking__workers">
        <label className="cf-booking__worker">
            <input
                type="radio"
                name="booking-worker"
                value={ANY_WORKER}
                checked={value === ANY_WORKER}
                onChange={() => onChange(ANY_WORKER)}
            />
            <span className="cf-booking__worker-card">
                <span className="cf-booking__avatar">
                    <i className="fa-solid fa-users" aria-hidden="true" />
                </span>
                <span>
                    <span className="cf-booking__worker-name">Cualquiera</span>
                    <span className="cf-booking__worker-note">Más huecos libres</span>
                </span>
            </span>
        </label>

        {workers.map((worker) => (
            <label className="cf-booking__worker" key={worker.worker_id}>
                <input
                    type="radio"
                    name="booking-worker"
                    value={worker.worker_id}
                    checked={value === String(worker.worker_id)}
                    onChange={() => onChange(String(worker.worker_id))}
                />
                <span className="cf-booking__worker-card">
                    <Avatar user={workerUser(worker)} size="md" />
                    <span>
                        <span className="cf-booking__worker-name">{worker.name}</span>
                        <span className="cf-booking__worker-note">
                            {worker.rating != null ? (
                                <>
                                    <i className="fa-solid fa-star cf-booking__star" aria-hidden="true" />
                                    {ratingText(worker.rating)}
                                    <span className="sr-only"> de 5</span>
                                    {` · ${worker.reviews_count} ${worker.reviews_count === 1 ? "opinión" : "opiniones"}`}
                                </>
                            ) : "Sin valoraciones todavía"}
                        </span>
                    </span>
                </span>
            </label>
        ))}
    </div>
)
