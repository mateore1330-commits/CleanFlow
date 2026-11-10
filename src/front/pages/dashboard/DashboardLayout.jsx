/**
 * MARCO DE LA ZONA PRIVADA (maquetas 04, 05 y 06; PANEL-01).
 *
 * Envuelve todas las páginas de /dashboard: el menú lateral a la izquierda
 * y, a la derecha, la barra de arriba y la página que toca según la URL.
 * Cada capa de routes.jsx responde a una sola pregunta:
 *   ProtectedRoutes -> ¿hay sesión?
 *   DashboardLayout -> ¿qué marco pinto?   (este archivo)
 *   RoleRoute       -> ¿tiene permiso?
 *
 * El cajón del móvil se abre desde la barra (la hamburguesa) y se cierra
 * desde el menú (la ✕, una sección o el fondo): por eso su estado vive
 * aquí, que es quien tiene a los dos.
 *
 * Estilos: dashboard.css (cf-dash-layout, cf-dash-main).
 */

import { useCallback, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar"
import { DashboardTopbar } from "../../components/dashboard/DashboardTopbar"

export const DashboardLayout = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    // useCallback: la misma función en cada render. El menú la usa en sus
    // efectos, y una nueva en cada render los haría montarse otra vez.
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const openMenu = useCallback(() => setMenuOpen(true), []);

    // La hamburguesa: al cerrar el cajón, el foco vuelve a ella.
    const toggleRef = useRef(null);

    return (
        <div className="cf-dash-layout">

            <Sidebar open={menuOpen} onClose={closeMenu} toggleRef={toggleRef} />

            <div className="cf-dash-column">
                <DashboardTopbar menuOpen={menuOpen} onOpenMenu={openMenu} toggleRef={toggleRef} />

                <main className="cf-dash-main">
                    {/* Aquí React Router pinta la página hija según la URL. */}
                    <Outlet />
                </main>
            </div>

        </div>
    );
};
