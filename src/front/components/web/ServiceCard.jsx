/**
 * Tarjeta de un servicio de CleanFlow (maqueta 02, WEB-01).
 *
 * La usan la portada y el bloque "Otros servicios" de la ficha.
 *
 * Dos salidas: el título lleva a la ficha, para quien todavía duda, y
 * «Reservar» va directo a contratarlo, que es a lo que viene el cliente.
 * Precio por hora y horas mínimas, de la base de datos.
 *
 * Prioriza la imagen configurada en el backend; si no hay, una local de
 * demostración según el servicio.
 */

import { Link } from "react-router-dom";
import { getServiceImage, servicePlaceholder } from "../../data/serviceImages";
import { formatPrice } from "../../utils/price";


export const ServiceCard = ({ service }) => {
    const imageSrc = getServiceImage(service);
    const minHours = Number(service.min_hours) || 1;

    return (
        <article className="cf-service-card">
            <div className="cf-service-card__media">
                {/* alt vacío: el nombre del servicio va justo debajo. */}
                <img
                    className="cf-service-card__image"
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                    width="600"
                    height="400"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = servicePlaceholder;
                    }}
                />
            </div>

            <div className="cf-service-card__body">
                <h3 className="cf-service-card__title">
                    <Link to={`/services/${service.slug}`}>{service.name}</Link>
                </h3>

                <p className="cf-service-card__description">{service.description}</p>

                <p className="cf-service-card__meta">
                    <i className="fa-regular fa-clock" aria-hidden="true"></i>
                    desde {minHours} {minHours === 1 ? "hora" : "horas"}
                </p>

                <div className="cf-service-card__footer">
                    <p className="cf-service-card__price">
                        Desde <strong>{formatPrice(service.base_hourly_rate)}</strong>/h
                    </p>

                    <Link
                        to={`/dashboard/book?servicio=${service.slug}`}
                        className="cf-service-card__book"
                        aria-label={`Reservar ${service.name}`}
                    >
                        Reservar
                        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </Link>
                </div>
            </div>
        </article>
    );
};
