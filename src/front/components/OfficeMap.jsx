/**
 * EL PLANO DE LA OFICINA (Contacto, maqueta 02 y 07, WEB-04).
 *
 * Un plano DIBUJADO, no el mapa de Google, y un botón que lo abre en
 * Google Maps en otra pestaña. El mapa de Google incrustado ponía sus
 * cookies (no técnicas) nada más cargar la página, sin que nadie lo
 * pulsara, y con ellas la ley pide un aviso de cookies. Así, Google solo
 * entra si lo pides tú (decidido el 11/11/2026, B1). Y el Inicio carga
 * más ligero.
 *
 * El dibujo es decorativo: la dirección ya está escrita justo encima.
 *
 * Estilos: landing.css (cf-office-map).
 */
export const OfficeMap = ({ address }) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return (
        <div className="cf-office-map">
            <svg className="cf-office-map__plan" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                <rect className="cf-office-map__ground" width="400" height="200" />
                <path className="cf-office-map__river" d="M-10 168 C 70 150, 120 190, 200 172 S 330 140, 410 162 L410 210 L-10 210Z" />
                <g className="cf-office-map__blocks">
                    <rect x="14" y="14" width="70" height="44" rx="6" />
                    <rect x="100" y="14" width="86" height="44" rx="6" />
                    <rect x="202" y="14" width="60" height="44" rx="6" />
                    <rect x="278" y="14" width="108" height="44" rx="6" />
                    <rect x="14" y="74" width="70" height="52" rx="6" />
                    <rect x="100" y="74" width="86" height="52" rx="6" />
                    <rect x="278" y="74" width="50" height="52" rx="6" />
                    <rect x="344" y="74" width="42" height="52" rx="6" />
                </g>
                <rect className="cf-office-map__park" x="202" y="74" width="60" height="52" rx="6" />
                <g className="cf-office-map__trees">
                    <circle cx="218" cy="92" r="7" />
                    <circle cx="236" cy="104" r="8" />
                    <circle cx="250" cy="88" r="6" />
                    <circle cx="222" cy="114" r="5" />
                </g>
                <path className="cf-office-map__avenue" d="M-10 140 L 410 40" />
                <path className="cf-office-map__avenue-line" d="M-10 140 L 410 40" />
            </svg>

            <i className="fa-solid fa-location-dot cf-office-map__pin" aria-hidden="true"></i>

            <a className="cf-btn cf-btn--ghost cf-btn--sm cf-office-map__go" href={mapsUrl} target="_blank" rel="noreferrer">
                Abrir en Google Maps
                <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
        </div>
    );
};
