/**
 * «DESPERTANDO LA DEMO…» (DEPLOY-01).
 *
 * La base de datos (Neon, plan gratuito) se duerme tras 5 minutos sin
 * visitas, y la primera petición después tarda unos segundos. Este aviso
 * sale solo si una petición pasa de 2,5 segundos (services/backend.js) y
 * se va en cuanto termina: con la base despierta, nadie lo ve.
 *
 * Decidido el 11/11/2026 (DATOS-01): un aviso honesto y no una barra del
 * 0 al 100 %, que no sabría de verdad cuánto falta.
 *
 * Estilos: index.css (cf-wake).
 */

import { useEffect, useState } from "react";
import { onSlowRequests } from "../services/backend";

export const WakeNotice = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => onSlowRequests(setVisible), []);

    // El contenedor está siempre: así el lector de pantalla anuncia el
    // texto cuando aparece (aria-live), sin repetirlo al cambiar de página.
    return (
        <div className="cf-wake" role="status" aria-live="polite">
            {visible && (
                <p className="cf-wake__box">
                    <span className="cf-wake__spinner" aria-hidden="true"></span>
                    Despertando la demo… puede tardar unos segundos
                </p>
            )}
        </div>
    );
};
