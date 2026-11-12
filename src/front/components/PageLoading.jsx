/**
 * AVISOS DE CARGA DE PÁGINA (WEB-03, maqueta aprobada C1).
 *
 * Cada página se descarga la primera vez que se visita (routes.jsx). Mientras
 * llega, se ve una de estas tres cosas:
 *
 *   NavigationProgress: al pasar de una página a otra. La de antes se queda
 *                       y arriba corre una barra fina con el degradado de
 *                       marca. Espera un momento antes de salir: si la página
 *                       llega enseguida, no se ve nada.
 *   PageSplash:         al abrir directamente una página que aún no está (pegar
 *                       la dirección o recargar). No hay página de antes, así
 *                       que se ve el logo «respirando».
 *   RouteError:         si una página no se puede descargar (sin conexión, o
 *                       una versión nueva publicada mientras navegabas).
 *
 * Estilos: index.css (PIEZAS COMUNES, cf-loading*).
 */

import { useEffect, useState } from "react";
import { Link, isRouteErrorResponse, useNavigation, useRouteError } from "react-router-dom";
import { Logo } from "./Logo";


// Lo que tarda en aparecer la barra. Por debajo de esto, una navegación se
// siente instantánea y la barra solo sería un destello.
const BAR_DELAY_MS = 150;


export const NavigationProgress = () => {
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!loading) {
            setVisible(false);
            return;
        }
        const timer = setTimeout(() => setVisible(true), BAR_DELAY_MS);
        return () => clearTimeout(timer);
    }, [loading]);

    if (!visible) return null;

    // role="progressbar" sin valor: «está cargando, no se sabe cuánto falta».
    return <div className="cf-loading-bar" role="progressbar" aria-label="Cargando la página"></div>;
};


export const PageSplash = () => (
    <div className="cf-loading-splash" role="status">
        <Logo size={64} />
        <p>Cargando…</p>
    </div>
);


// Lo que lanza el navegador cuando no puede descargar un trozo de la app.
// Cada navegador lo dice a su manera; estas son las de Chrome, Firefox y Safari.
const isLoadError = (error) =>
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed|error loading dynamically|Failed to fetch/i.test(error.message);


export const RouteError = () => {
    const error = useRouteError();

    // Una dirección que no existe, como hasta ahora.
    if (isRouteErrorResponse(error) && error.status === 404) {
        return <h1>Not found!</h1>;
    }

    const failedLoad = isLoadError(error);

    // Para quien programa: el error de verdad, en la consola.
    if (!failedLoad) console.error(error);

    return (
        <main className="cf-loading-error">
            <div className="cf-loading-error__box" role="alert">
                <i className="fa-solid fa-wifi" aria-hidden="true"></i>
                <h1>{failedLoad ? "No hemos podido cargar esta página" : "Algo ha ido mal"}</h1>
                <p>
                    {failedLoad
                        ? "Puede que se haya cortado la conexión o que hayamos publicado una versión nueva. Vuelve a intentarlo."
                        : "Ha fallado algo al abrir esta página. Vuelve a intentarlo y, si sigue pasando, vuelve al inicio."}
                </p>
                {/* Los dos del mismo tamaño, la acción principal arriba.
                    Recargar trae también la versión nueva, si la hay. */}
                <div className="cf-loading-error__actions">
                    <button type="button" className="cf-btn cf-btn--block" onClick={() => window.location.reload()}>
                        Volver a intentar
                    </button>
                    <Link to="/" reloadDocument className="cf-btn cf-btn--ghost cf-btn--block">
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </main>
    );
};
