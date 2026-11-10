/**
 * FRANJA DE MARCAS (maqueta 02, WEB-01).
 *
 * Ya no es una sección con carrusel: una línea discreta bajo la portada,
 * con los logos en gris. Al pasar el ratón cada uno recupera sus colores:
 * son otras empresas, así que no llevan los de CleanFlow.
 *
 * Es un <div> y no una <section>: no tiene título propio, y así no cuenta
 * para la alternancia de fondos de las secciones.
 */

import ecoLimpioLogo from "../../../assets/img/ecolimpio.svg";
import higieneProLogo from "../../../assets/img/higienepro.svg";
import verdeCasaLogo from "../../../assets/img/verdecasa.svg";
import brilloPlusLogo from "../../../assets/img/brilloplus.svg";
import purezaLogo from "../../../assets/img/pureza.svg";


const PARTNERS = [
    { name: "EcoLimpio", logo: ecoLimpioLogo },
    { name: "HigienePro", logo: higieneProLogo },
    { name: "VerdeCasa", logo: verdeCasaLogo },
    { name: "Brillo+", logo: brilloPlusLogo },
    { name: "Pureza", logo: purezaLogo },
];


export const PartnersSection = () => (
    <div className="cf-partners">
        <div className="cf-container cf-partners__inner">
            <p className="cf-partners__text">
                Trabajamos con productos de marcas que cuidan tu casa y el planeta
            </p>

            <ul className="cf-partners__row">
                {PARTNERS.map((partner) => (
                    <li key={partner.name}>
                        <img
                            src={partner.logo}
                            alt={partner.name}
                            loading="lazy"
                            height="46"
                        />
                    </li>
                ))}
            </ul>
        </div>
    </div>
);
