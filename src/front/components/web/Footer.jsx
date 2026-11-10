/**
 * PIE DE LA WEB (maqueta 02, WEB-01).
 *
 * Banda oscura a todo lo ancho con cuatro columnas (marca, servicios,
 * CleanFlow y acceso) y debajo la línea legal.
 *
 * Los servicios salen del store, la misma fuente que la sección de
 * servicios: así enseñan siempre lo mismo. Los datos de contacto ya no
 * se repiten aquí: están en la sección de contacto, justo encima.
 *
 * Estilos: clases `cf-footer*` en web.css.
 */

import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { Logo } from "../Logo";
import { Wordmark } from "../Wordmark";
import { COMPANY, SOCIAL_NETWORKS } from "../../data/company";


// "Opiniones" solo si hay: la sección se esconde cuando no hay ninguna,
// y un enlace a algo que no está es un enlace roto.
const companyLinks = (hasReviews) => [
    { label: "Sobre CleanFlow", to: "/#about-us" },
    { label: "Cómo funciona", to: "/#how" },
    hasReviews && { label: "Opiniones", to: "/#reviews" },
    { label: "Trabaja con nosotros", to: "/work-with-us" },
    { label: "Contacto", to: "/#contact" },
].filter(Boolean)

const ACCESS_LINKS = [
    { label: "Área clientes", to: "/login-clients" },
    { label: "Área empleados", to: "/login-workers" },
    { label: "Crear cuenta", to: "/register" },
]

const LEGAL_LINKS = [
    { label: "Aviso legal", to: "/legal" },
    { label: "Privacidad", to: "/privacy" },
    { label: "Cookies", to: "/cookies" },
]


export const Footer = () => {
    const { store } = useGlobalReducer();
    const services = store.services;
    const activeNetworks = SOCIAL_NETWORKS.filter((network) => network.url);

    return (
        <footer className="cf-footer">
            <div className="cf-container">
                <div className="cf-footer__grid">

                    {/* ---------- MARCA ---------- */}
                    <div className="cf-footer__brand-col">
                        <Link to="/" className="cf-footer__brand" aria-label="CleanFlow, volver al inicio">
                            <Logo size={32} />
                            <Wordmark className="cf-footer__word" dark />
                        </Link>
                        <p className="cf-footer__pitch">{COMPANY.tagline}</p>

                        {activeNetworks.length > 0 && (
                            <ul className="cf-footer__social">
                                {activeNetworks.map((network) => (
                                    <li key={network.name}>
                                        {/* <a> y no <Link>: son webs externas.
                                            rel="noreferrer": la página destino no
                                            puede tocar la nuestra. */}
                                        <a href={network.url} target="_blank" rel="noreferrer" aria-label={network.name}>
                                            <i className={network.icon} aria-hidden="true"></i>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ---------- SERVICIOS ---------- */}
                    <nav aria-label="Servicios">
                        <h2 className="cf-footer__title">Servicios</h2>
                        {services.length === 0 ? (
                            <p className="cf-footer__empty">Aún no hay servicios disponibles</p>
                        ) : (
                            <ul className="cf-footer__list">
                                {services.map((service) => (
                                    <li key={service.slug}>
                                        <Link to={`/services/${service.slug}`}>{service.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </nav>

                    {/* ---------- CLEANFLOW ---------- */}
                    <nav aria-label="CleanFlow">
                        <h2 className="cf-footer__title">CleanFlow</h2>
                        <ul className="cf-footer__list">
                            {companyLinks(store.reviews.length > 0).map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* ---------- ACCESO ---------- */}
                    <nav aria-label="Acceso">
                        <h2 className="cf-footer__title">Acceso</h2>
                        <ul className="cf-footer__list">
                            {ACCESS_LINKS.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* ---------- LÍNEA LEGAL ---------- */}
                <div className="cf-footer__bottom">
                    {/* getFullYear: el año se actualiza solo. */}
                    <p>© {new Date().getFullYear()} {COMPANY.name}</p>
                    <ul className="cf-footer__legal">
                        {LEGAL_LINKS.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    )
}
