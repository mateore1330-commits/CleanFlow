/**
 * EL CATÁLOGO DE ANTES, AHORA DENTRO DE RESERVAR (PANEL-02).
 *
 * /dashboard/service-catalog era una página propia con los servicios. Desde
 * la maqueta 04 se elige el servicio arriba de la reserva, así que esta
 * dirección solo lleva allí, con lo que traiga detrás (?servicio=…).
 *
 * Se queda para que no se rompan los enlaces de siempre: favoritos, el
 * correo de alguien o una pestaña abierta antes del cambio.
 */

import { Navigate, useLocation } from "react-router-dom";

export const CatalogRedirect = () => {
    const { search } = useLocation();

    // replace: «Atrás» no vuelve aquí para que le manden otra vez a Reservar.
    return <Navigate to={`/dashboard/book${search}`} replace />;
};
