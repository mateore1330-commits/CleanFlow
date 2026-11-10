/**
 * VOLVER A CONTRATAR (Inicio del cliente, maqueta 04, PANEL-02).
 *
 * Los servicios que ya ha pedido, con la foto, cuándo fue la última vez y
 * «Repetir», que abre la reserva con ese servicio ya elegido.
 *
 * Estilos: dashboard.css (cf-client-rebook*).
 */

import { Link } from "react-router-dom";
import { getServiceImage, servicePlaceholder } from "../../../data/serviceImages";
import { formatPrice } from "../../../utils/price";

// "el 19 de octubre": la última vez que fue.
const lastTimeText = (date) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" })
        .format(new Date(`${date.slice(0, 10)}T12:00:00`));

export const RebookServices = ({ bookings, services }) => {
    // Un servicio por tarjeta, con la última vez que se contrató.
    const contracted = bookings
        .filter((booking) => booking.status !== "cancelled" && booking.service?.slug)
        .reduce((summary, booking) => {
            const slug = booking.service.slug;
            const date = booking.days?.[0]?.starts_at || "";

            if (!summary[slug] || date > summary[slug].last) {
                summary[slug] = { service: booking.service, last: date };
            }
            return summary;
        }, {});

    const repeated = Object.values(contracted).sort((a, b) => b.last.localeCompare(a.last));

    if (repeated.length === 0) return null;

    return (
        <section className="cf-client-rebook" aria-labelledby="client-rebook-title">
            <div className="cf-client-rebook__head">
                <div>
                    <p className="cf-client-rebook__eyebrow">Tus favoritos</p>
                    <h2 className="cf-client-rebook__title" id="client-rebook-title">Volver a contratar</h2>
                </div>

                <Link to="/dashboard/book" className="cf-client-rebook__catalog">
                    Ver catálogo
                    <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </Link>
            </div>

            <div className="cf-client-rebook__grid">
                {repeated.map(({ service, last }) => {
                    // Del catálogo, el precio de hoy (puede haber cambiado).
                    const current = services.find((item) => item.slug === service.slug);

                    return (
                        <article className="cf-client-rebook__card" key={service.slug}>
                            <img
                                src={getServiceImage(current || service)}
                                alt=""
                                loading="lazy"
                                width="480"
                                height="270"
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = servicePlaceholder;
                                }}
                            />

                            <div className="cf-client-rebook__body">
                                <h3>{service.name}</h3>
                                {/* Si la última todavía no ha llegado, es la próxima. */}
                                {last && (
                                    <p className="cf-client-rebook__last">
                                        {Date.parse(last) > Date.now() ? "Próxima" : "La última"}, el {lastTimeText(last)}
                                    </p>
                                )}

                                <div className="cf-client-rebook__foot">
                                    {current?.base_hourly_rate && (
                                        <b>{formatPrice(current.base_hourly_rate)}/h</b>
                                    )}
                                    <Link
                                        to={`/dashboard/book?servicio=${service.slug}`}
                                        className="cf-dash-btn cf-dash-btn--sm"
                                        aria-label={`Repetir ${service.name}`}
                                    >
                                        Repetir
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
