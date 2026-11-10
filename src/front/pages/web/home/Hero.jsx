/**
 * PORTADA DE LA LANDING (maqueta 02, hero B).
 *
 * Tres capas, y el orden del JSX es el orden de apilado: la foto, el
 * degradado oscuro de marca que la tapa a la izquierda y el contenido
 * encima, en blanco. Estilos: landing.css (cf-hero*).
 *
 * Aquí va el único <h1> de la página; las secciones usan <h2>.
 *
 * El mini buscador (servicio + fecha) de la maqueta no está: aprobado,
 * pero queda por definir a fondo (Recursos/PENDIENTES.md).
 */

import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import hero1920 from "../../../assets/img/hero-salon-1920.webp";
import hero960 from "../../../assets/img/hero-salon-960.webp";


// Lo que da confianza antes de reservar, en una línea.
const TRUST = [
    { icon: "fa-user-check", text: "Personal propio" },
    { icon: "fa-shield-halved", text: "Seguro de responsabilidad civil" },
    { icon: "fa-rotate-left", text: "Sin permanencia" },
];


// Convierte una nota (4.8) en las cinco clases de icono a pintar.
const starIcons = (average) =>
    [1, 2, 3, 4, 5].map((position) => {
        if (average >= position) return "fa-solid fa-star";
        if (average >= position - 0.5) return "fa-solid fa-star-half-stroke";
        return "fa-regular fa-star";
    });


export const Hero = () => {
    // La nota real, la misma que la sección de opiniones: dos números
    // distintos para lo mismo en la misma página no se sostienen. En null
    // mientras llega, y también si todavía no hay ninguna valoración.
    const { store } = useGlobalReducer();
    const average = store.reviewsAverage;
    const total = store.reviewsTotal;

    return (
        <section id="hero" className="cf-hero">
            {/* alt vacío: es decorativa. srcSet: el móvil descarga la de
                960px (27 kB) y la pantalla grande la de 1920px (98 kB).
                fetchpriority alta: es lo primero que se ve. */}
            <img
                className="cf-hero__photo"
                src={hero1920}
                srcSet={`${hero960} 960w, ${hero1920} 1920w`}
                sizes="100vw"
                alt=""
                width="1920"
                height="1080"
                // En minúsculas: React 18 todavía no conoce fetchPriority.
                fetchpriority="high"
            />
            <div className="cf-hero__veil" aria-hidden="true"></div>

            <div className="cf-container cf-hero__inner">
                <div className="cf-hero__content">
                    <p className="cf-hero__chip">
                        <b>Madrid</b> Limpieza de hogares y oficinas
                    </p>

                    <h1 className="cf-hero__title">
                        {/* «de nada» siempre junta: una palabra sola en la última
                            línea de un titular lo descompensa. */}
                        Tu casa limpia, <em>sin preocuparte</em>{" "}
                        <span className="cf-hero__nowrap">de nada</span>
                    </h1>

                    <p className="cf-hero__lede">
                        Personal propio y verificado, productos incluidos. Reserva en dos minutos
                        y cancela gratis hasta 24 h antes.
                    </p>

                    <div className="cf-hero__actions">
                        {/* A la ruta protegida del catálogo: sin sesión,
                            ProtectedRoutes manda al login y vuelve aquí. */}
                        <Link to="/dashboard/service-catalog" className="cf-btn cf-btn--accent">
                            Reservar limpieza
                            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </Link>
                        <Link to="/#services" className="cf-btn cf-btn--ghost cf-hero__ghost">
                            Ver servicios
                        </Link>
                    </div>

                    <ul className="cf-hero__trust">
                        {TRUST.map((item) => (
                            <li key={item.text}>
                                <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ---------- LA NOTA ----------
                    Sin ninguna valoración todavía, no se pinta: una nota
                    inventada deja de ser verdad en cuanto alguien la mira. */}
                {average !== null && (
                    <div className="cf-hero__rating">
                        {/* toLocaleString: 4.5 se escribe "4,5" en español. */}
                        <b>{average.toLocaleString("es-ES", { minimumFractionDigits: 1 })}</b>
                        <div>
                            {/* aria-hidden: la nota ya se lee en el número. */}
                            <span className="cf-hero__stars" aria-hidden="true">
                                {starIcons(average).map((icon, index) => (
                                    <i key={index} className={icon}></i>
                                ))}
                            </span>
                            <small>
                                {total} {total === 1 ? "opinión" : "opiniones"} de clientes
                            </small>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
