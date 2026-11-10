/**
 * SERVICIOS DE LA LANDING (maqueta 02, WEB-01).
 *
 * Cuadrícula de tarjetas en vez de carrusel: se ven todos de un vistazo.
 * Lee el catálogo del store; la petición la hace ServicesLoader al
 * arrancar, así que aquí no hay fetch.
 */

import useGlobalReducer from "../../../hooks/useGlobalReducer.jsx";
import { ServiceCard } from "../../../components/web/ServiceCard.jsx";


export const ServicesSection = () => {
    const { store } = useGlobalReducer();
    const { services = [], servicesLoading, servicesError } = store;

    return (
        <section id="services" className="cf-home-section cf-home-services">
            <div className="cf-container">
                <header className="cf-home-head">
                    <div>
                        <p className="cf-eyebrow">Servicios</p>
                        <h2 className="cf-home-title">Elige cuánto quieres que brille</h2>
                        <p className="cf-home-lede">
                            Pagas por horas y eliges cuántas. Productos y material incluidos
                            en todos los servicios.
                        </p>
                    </div>
                </header>

                {servicesLoading && services.length === 0 && (
                    <p className="cf-home-message" role="status">Cargando servicios…</p>
                )}

                {servicesError && services.length === 0 && (
                    <p className="cf-alert">No hemos podido cargar los servicios en este momento.</p>
                )}

                {!servicesLoading && !servicesError && services.length === 0 && (
                    <p className="cf-home-message">Próximamente tendremos nuevos servicios disponibles.</p>
                )}

                {services.length > 0 && (
                    <>
                        {servicesError && (
                            <p className="cf-alert cf-alert--warning cf-home-services__stale">
                                No hemos podido actualizar los servicios. Te enseñamos los últimos que teníamos.
                            </p>
                        )}

                        <div className="cf-home-services__grid">
                            {services.map((service) => (
                                <ServiceCard key={service.slug} service={service} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
