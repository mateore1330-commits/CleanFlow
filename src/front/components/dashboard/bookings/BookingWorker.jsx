/**
 * QUIÉN LO HIZO.
 *
 * El trabajador asignado, con su foto si la ha subido. Si no, sus
 * iniciales en el mismo círculo terracota que usa el resto del panel.
 *
 * El cliente ve el nombre y la inicial del apellido, nunca más: el
 * backend ya manda "Ana G." y no el nombre completo.
 *
 * Estilos: dashboard.css (cf-bookworker).
 */

import { Avatar } from "../Avatar";

export const BookingWorker = ({ booking }) => (
    <section className="cf-bookblock">
        <h2 className="cf-bookblock__title">Información del trabajador</h2>

        <div className="cf-bookworker">
            <Avatar name={booking.worker_name} src={booking.worker_avatar_url} size="md" tone="accent" />

            <div>
                <p className="cf-bookworker__name">
                    {booking.worker_name || "Sin asignar"}
                </p>
                <p className="cf-bookworker__role">Personal de limpieza</p>
            </div>
        </div>
    </section>
);
