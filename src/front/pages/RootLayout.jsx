/**
 * MARCO RAÍZ DE TODAS LAS RUTAS (WEB-03).
 *
 * No pinta nada propio: solo la barra de carga, encima de cualquier
 * página, y la página que toque. Así la barra funciona igual en la web,
 * en el acceso y en el panel.
 */

import { Outlet } from "react-router-dom";
import { NavigationProgress } from "../components/PageLoading";

export const RootLayout = () => (
    <>
        <NavigationProgress />
        <Outlet />
    </>
);
