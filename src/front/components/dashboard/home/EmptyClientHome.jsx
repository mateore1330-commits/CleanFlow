/**
 * EL INICIO DE UN CLIENTE SIN RESERVAS (maqueta 04, PANEL-02).
 *
 * Todavía no hay próxima limpieza ni favoritos: en su lugar, la invitación
 * a reservar y los servicios para elegir el primero.
 *
 * Estilos: dashboard.css (cf-client-home*, cf-client-rebook*).
 */

import { Link } from "react-router-dom";
import { PageHead } from "../PageHead";
import { NextBooking } from "./NextBooking";
import { getServiceImage, servicePlaceholder } from "../../../data/serviceImages";
import { formatPrice } from "../../../utils/price";

export const EmptyClientHome = ({ firstName, today, services }) => (
    <div className="cf-client-home">
        <PageHead
            plain
            title={`Hola, ${firstName}`}
            subtitle={today}
        />

        {/* La tarjeta de la próxima limpieza, en su versión vacía. */}
        <NextBooking />

        {services.length > 0 && (
            <section className="cf-client-rebook" aria-labelledby="client-start-title">
                <div className="cf-client-rebook__head">
                    <div>
                        <p className="cf-client-rebook__eyebrow">Servicios</p>
                        <h2 className="cf-client-rebook__title" id="client-start-title">¿Por dónde quieres empezar?</h2>
                    </div>
                </div>

                <div className="cf-client-rebook__grid">
                    {services.map((service) => (
                        <article className="cf-client-rebook__card" key={service.slug}>
                            <img
                                src={getServiceImage(service)}
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
                                <p className="cf-client-rebook__last">{service.description}</p>

                                <div className="cf-client-rebook__foot">
                                    <b>{formatPrice(service.base_hourly_rate)}/h</b>
                                    <Link
                                        to={`/dashboard/book?servicio=${service.slug}`}
                                        className="cf-dash-btn cf-dash-btn--sm"
                                        aria-label={`Reservar ${service.name}`}
                                    >
                                        Reservar
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        )}
    </div>
);
