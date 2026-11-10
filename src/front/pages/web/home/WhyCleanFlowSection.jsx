/**
 * POR QUÉ CLEANFLOW (maqueta 02, WEB-01).
 *
 * Las ventajas concretas en formato "bento": una pieza grande con foto y
 * cuatro pequeñas, una de ellas oscura para que la cuadrícula respire.
 * Sin cifras inventadas.
 */

import photo from "../../../assets/img/services/limpieza-profunda.webp";


const REASONS = [
    { icon: "fa-spray-can-sparkles", title: "Productos incluidos", text: "Llevamos todo lo necesario. Tú no compras nada." },
    { icon: "fa-shield-halved", title: "Servicio asegurado", text: "Seguro de responsabilidad civil en cada limpieza.", dark: true },
    { icon: "fa-file-circle-check", title: "Sin permanencia", text: "Un servicio suelto o cada semana: tú decides." },
    { icon: "fa-calendar-check", title: "Cancelación flexible", text: "Cambia o cancela gratis hasta 24 h antes." },
];


export const WhyCleanFlowSection = () => (
    <section id="why-cleanflow" className="cf-home-section cf-home-why">
        <div className="cf-container">
            <header className="cf-home-head">
                <div>
                    <p className="cf-eyebrow">Por qué CleanFlow</p>
                    <h2 className="cf-home-title">Gente de confianza en tu casa</h2>
                </div>
                <p className="cf-home-lede cf-home-head__aside">
                    Abrir la puerta de casa a alguien no es poca cosa. Por eso cuidamos cada detalle.
                </p>
            </header>

            <ul className="cf-home-why__bento">
                <li className="cf-home-why__tile cf-home-why__tile--photo">
                    <img src={photo} alt="" loading="lazy" width="600" height="400" />
                    <div className="cf-home-why__cap">
                        <h3>Personal propio, no autónomos de paso</h3>
                        <p>Todo nuestro equipo está contratado y verificado por CleanFlow. Siempre sabrás quién va a ir.</p>
                    </div>
                </li>

                {REASONS.map((reason) => (
                    <li
                        key={reason.title}
                        className={reason.dark ? "cf-home-why__tile cf-home-why__tile--dark" : "cf-home-why__tile"}
                    >
                        <i className={`fa-solid ${reason.icon}`} aria-hidden="true"></i>
                        <h3>{reason.title}</h3>
                        <p>{reason.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    </section>
);
