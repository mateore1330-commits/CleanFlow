/**
 * PANEL DE MARCA DE LAS PANTALLAS DE ACCESO (maqueta 03, WEB-02).
 *
 * La mitad izquierda: degradado oscuro sobre una foto, el título de la
 * pantalla y lo que ganas entrando. Cambia según la pantalla (BRANDS).
 *
 * En la de clientes va además la opinión mejor valorada de verdad, de
 * las que ya carga ReviewsLoader. Sin ninguna, no se pinta.
 *
 * En móvil se queda en una franja con la marca y el título: las
 * ventajas, la opinión y el © se esconden (auth.css).
 */

import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { Logo } from "../Logo";
import { Wordmark } from "../Wordmark";
import { Avatar } from "../dashboard/Avatar";
import { Stars } from "../dashboard/bookings/Stars";
import { COMPANY } from "../../data/company";
import salon from "../../assets/img/hero-salon-960.webp";
import team from "../../assets/img/equipo-cleanflow-768.webp";


// Las ventajas son de la app de verdad: nada que no se pueda hacer.
export const BRANDS = {
    clients: {
        photo: salon,
        eyebrow: "Área de clientes",
        title: "Tus limpiezas,",
        em: "en un solo sitio",
        icons: true,
        list: [
            { icon: "fa-calendar-check", text: "Reserva, cambia la fecha o cancela gratis hasta 24 h antes" },
            { icon: "fa-location-dot", text: "Guarda tus direcciones para reservar más rápido" },
            { icon: "fa-star", text: "Valora cada limpieza cuando termine" },
        ],
        quote: true,
    },
    workers: {
        photo: team,
        team: true,
        eyebrow: "Área de empleados",
        title: "Tu jornada,",
        em: "organizada",
        icons: true,
        list: [
            { icon: "fa-route", text: "Consulta tus servicios del día con dirección y tareas" },
            { icon: "fa-list-check", text: "Marca cada tarea al terminarla" },
            { icon: "fa-umbrella-beach", text: "Pide vacaciones y ausencias desde el móvil" },
        ],
    },
    register: {
        photo: salon,
        eyebrow: "Crear cuenta",
        title: "Tu primera limpieza,",
        em: "en dos minutos",
        list: [
            { icon: "fa-check", text: "Gratis y sin permanencia" },
            { icon: "fa-check", text: "Ves el precio exacto antes de confirmar" },
            { icon: "fa-check", text: "Personal propio, verificado y asegurado" },
        ],
    },
    profile: {
        photo: salon,
        eyebrow: "Último paso",
        title: "Solo nos falta",
        em: "un dato",
        icons: true,
        list: [
            { icon: "fa-phone", text: "Te llamamos solo si hay algún cambio en tu servicio" },
            { icon: "fa-user-shield", text: "Nunca lo usamos para publicidad" },
        ],
    },
};


// La mejor nota; a igualdad, la más reciente (la API las manda así).
const bestReview = (reviews) =>
    reviews.reduce((best, review) => (!best || review.rating > best.rating ? review : best), null);


export const AuthBrand = ({ variant, onLeave }) => {
    const { store } = useGlobalReducer();
    const brand = BRANDS[variant];
    const review = brand.quote ? bestReview(store.reviews) : null;

    return (
        <aside className={brand.team ? "auth-brand auth-brand--team" : "auth-brand"}>
            {/* La foto va en <img> y no de fondo en el CSS: así Vite le
                pone la ruta buena y no se descarga en móvil sin hacer falta. */}
            <img className="auth-brand__photo" src={brand.photo} alt="" width="960" height="540" />

            <Link to="/" className="auth-brand__logo" aria-label="CleanFlow, volver al inicio" onClick={onLeave}>
                <Logo size={30} />
                <Wordmark dark />
            </Link>

            <div className="auth-brand__body">
                {/* <p> y no <h2>: el título de la página es el <h1> del
                    formulario; este es el cartel. Primero el título y
                    debajo la etiqueta de la pantalla (decidido el
                    10/11/2026, opción A). */}
                <p className="auth-brand__title">
                    {brand.title} <em>{brand.em}</em>
                </p>
                <p className="auth-brand__eyebrow">{brand.eyebrow}</p>

                <ul className={brand.icons ? "auth-brand__list" : "auth-brand__list auth-brand__list--checks"}>
                    {brand.list.map((item) => (
                        <li key={item.text}>
                            <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
                            {item.text}
                        </li>
                    ))}
                </ul>

                {review && (
                    <figure className="auth-brand__quote">
                        <Stars value={review.rating} size={14} />
                        <blockquote>«{review.comment}»</blockquote>
                        <figcaption>
                            <Avatar name={review.client_name} src={review.client_avatar_url} size="sm" />
                            {review.client_name}
                            {review.service_name && ` · ${review.service_name}`}
                        </figcaption>
                    </figure>
                )}
            </div>

            <p className="auth-brand__foot">
                © {new Date().getFullYear()} {COMPANY.name} · Madrid
            </p>
        </aside>
    );
};
