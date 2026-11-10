/**
 * Marco de las pantallas de autenticación: registro, login y el paso que
 * falta tras entrar con Google (maqueta 03, WEB-02).
 *
 * Dos mitades: el panel de marca a la izquierda (AuthBrand) y el
 * formulario a la derecha, con «Volver al inicio» y el enlace a la otra
 * área arriba. Sin Navbar ni Footer públicos, a propósito: aquí se viene
 * a entrar. Encima, el aviso de proyecto ficticio, como en toda la web.
 *
 * Con la sesión ya abierta, los caminos de vuelta CIERRAN LA SESIÓN. Solo
 * se llega aquí con sesión desde /completar-perfil, y si se pudiera salir
 * sin cerrarla el usuario se quedaría con la cuenta a medias —entró con
 * Google y le falta el teléfono— dando vueltas por la web sin saberlo.
 */

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { DemoNotice } from "../../components/web/DemoNotice"
import { AuthBrand } from "../../components/web/AuthBrand"
import { LOGIN_CLIENTS, LOGIN_WORKERS } from "../../authPaths"
import "../../auth.css"


// Qué panel lleva cada pantalla y a qué otra puerta se ofrece ir arriba.
// El registro no lleva enlace arriba: ya tiene la pestaña «Entrar» y el
// «¿Ya tienes cuenta?» de abajo (decidido el 10/11/2026).
const SCREENS = {
    [LOGIN_CLIENTS]: { brand: "clients", other: { text: "¿Eres del equipo?", label: "Área empleados", to: LOGIN_WORKERS } },
    [LOGIN_WORKERS]: { brand: "workers", other: { text: "¿Eres cliente?", label: "Área clientes", to: LOGIN_CLIENTS } },
    "/register": { brand: "register" },
    "/completar-perfil": { brand: "profile" },
}


export const AuthLayout = () => {
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const location = useLocation()

    const screen = SCREENS[location.pathname] || SCREENS[LOGIN_CLIENTS]

    // Con token, la cuenta está a medio hacer: irse es dejarla.
    const inProgress = Boolean(store.token)

    const leave = (event) => {
        if (!inProgress) return

        event.preventDefault()

        // intentional: se va porque quiere, no porque el token caducara.
        // Sin esto, la próxima visita al login le diría que su sesión
        // había expirado, que no es lo que ha pasado.
        dispatch({ type: "LOGOUT", payload: { intentional: true } })

        navigate("/", { replace: true })
    }

    return (
        <div className="auth-page">
            <DemoNotice />

            <div className="auth-screen">
                <AuthBrand variant={screen.brand} onLeave={leave} />

                <main className="auth-side">
                    <div className="auth-side__top">
                        <Link to="/" className="auth-back" onClick={leave}>
                            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                            {inProgress ? "Salir" : "Volver al inicio"}
                        </Link>

                        {screen.other && (
                            <p className="auth-other">
                                {screen.other.text}{" "}
                                <Link to={screen.other.to}>
                                    {screen.other.label}
                                </Link>
                            </p>
                        )}
                    </div>

                    <div className="auth-wrap">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
