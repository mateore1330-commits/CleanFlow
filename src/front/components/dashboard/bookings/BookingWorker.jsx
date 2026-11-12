/**
 * QUIÉN VA O QUIÉN FUE (maqueta 04, PANEL-02).
 *
 * El trabajador asignado, con su foto si la ha subido (si no, sus
 * iniciales) y su nota media, si ya tiene valoraciones.
 *
 * El título cambia con el estado: «Quién viene» antes del servicio,
 * «Quién vino» cuando ya pasó y «Quién iba a venir» si se canceló.
 *
 * El cliente ve el nombre y la inicial del apellido, nunca más: el
 * backend ya manda "Ana G." y no el nombre completo.
 *
 * Estilos: dashboard.css (cf-bookworker).
 */

import { Avatar } from "../Avatar";

const DONE = ["completed", "not_done"];

// "4,8": la nota con coma, como se escribe en español.
const ratingText = (rating) =>
    Number(rating).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const BookingWorker = ({ booking }) => (
    <section className="cf-bookblock">
        <h2 className="cf-bookblock__title">
            {DONE.includes(booking.status)
                ? "Quién vino"
                : booking.status === "cancelled" ? "Quién iba a venir" : "Quién viene"}
        </h2>

        <div className="cf-bookworker">
            <Avatar name={booking.worker_name} src={booking.worker_avatar_url} size="md" tone="accent" />

            <div>
                <p className="cf-bookworker__name">
                    {booking.worker_name || "Sin asignar"}
                </p>
                <p className="cf-bookworker__role">
                    Personal de limpieza
                    {booking.worker_rating != null && (
                        <span className="cf-bookworker__rating">
                            {" · "}
                            <i className="fa-solid fa-star" aria-hidden="true"></i>
                            {ratingText(booking.worker_rating)}
                            <span className="sr-only"> de 5</span>
                        </span>
                    )}
                </p>
            </div>
        </div>
    </section>
);
