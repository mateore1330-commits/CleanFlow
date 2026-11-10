/**
 * BANDA FINAL (maqueta 02, WEB-01). Nueva.
 *
 * Un último empujón antes del pie, para quien ha leído toda la página y
 * ya está convencido. Es un <aside>: complementa la página, no es una
 * sección con su propio tema.
 */

import { Link } from "react-router-dom";


export const FinalCta = () => (
    <aside className="cf-home-cta" aria-label="Reservar una limpieza">
        <div className="cf-container">
            <div className="cf-home-cta__box">
                <div>
                    <h2>¿Lista tu casa para brillar este fin de semana?</h2>
                    <p>Reserva en dos minutos y cancela gratis hasta 24 h antes.</p>
                </div>
                <Link to="/dashboard/service-catalog" className="cf-btn cf-btn--accent">
                    Reservar limpieza
                    <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </Link>
            </div>
        </div>
    </aside>
);
