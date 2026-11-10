/**
 * AJUSTES DE LA CUENTA: EL MARCO (#13, rediseño en PANEL-02).
 *
 * La cabecera común (PageHead) y, debajo, un menú vertical a la izquierda
 * con los apartados y el que toque a la derecha, según la URL (maqueta
 * 04). Cada apartado tiene la suya, así se puede enlazar desde cualquier
 * sitio (por ejemplo, "Gestionar mis direcciones" desde la reserva).
 *
 *   /dashboard/profile            Datos personales
 *   /dashboard/profile/security   Seguridad
 *   /dashboard/profile/addresses  Direcciones (solo cliente)
 *
 * Es la misma página para los tres roles: el trabajador y el encargado
 * la ven igual, sin Direcciones.
 *
 * Estilos: dashboard.css, sección 5 (cf-account__*).
 */

import { NavLink, Outlet } from "react-router-dom"
import useGlobalReducer from "../../../hooks/useGlobalReducer"
import { PageHead } from "../../../components/dashboard/PageHead"
import "../../../dashboard.css"

export const AccountLayout = () => {
    const { store } = useGlobalReducer()

    // Solo el cliente tiene direcciones: el encargado y el trabajador no
    // contratan servicios. La ruta también está protegida por RoleRoute.
    const isClient = store.user?.role === "client"

    return (
        <section className="cf-account">
            <PageHead
                title="Ajustes"
                subtitle={isClient
                    ? "Tus datos, cómo entras y tus direcciones."
                    : "Tus datos y cómo entras en tu cuenta."}
            />

            <div className="cf-account__layout">
                {/* NavLink marca el apartado actual con aria-current="page",
                    y de ahí lo resalta el CSS. `end` en el primero: sin él
                    saldría activo también en los otros dos. */}
                <nav className="cf-account__nav" aria-label="Apartados de la cuenta">
                    <ul>
                        <li>
                            <NavLink to="/dashboard/profile" end>
                                <i className="fa-solid fa-user" aria-hidden="true" />
                                Datos personales
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/profile/security">
                                <i className="fa-solid fa-lock" aria-hidden="true" />
                                Seguridad
                            </NavLink>
                        </li>
                        {isClient && (
                            <li>
                                <NavLink to="/dashboard/profile/addresses">
                                    <i className="fa-solid fa-location-dot" aria-hidden="true" />
                                    Direcciones
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Aquí React Router pinta el apartado según la URL. */}
                <div className="cf-account__content">
                    <Outlet />
                </div>
            </div>
        </section>
    )
}
