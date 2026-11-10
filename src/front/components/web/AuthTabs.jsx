/**
 * PESTAÑAS «ENTRAR · CREAR CUENTA» (maqueta 03, WEB-02).
 *
 * Son dos enlaces, no pestañas de verdad: cada una es su propia página
 * (/login-clients y /register), así que «Atrás» y la URL funcionan como
 * se espera. Se llevan el destino guardado, para que tras entrar o
 * registrarse se vuelva a donde iba el usuario (WEB-15).
 *
 * Estilos: auth.css (auth-tabs).
 */

import { Link, useLocation } from "react-router-dom";
import { LOGIN_CLIENTS } from "../../authPaths";

const TABS = [
    { label: "Entrar", to: LOGIN_CLIENTS },
    { label: "Crear cuenta", to: "/register" },
];

export const AuthTabs = () => {
    const location = useLocation();

    return (
        <nav className="auth-tabs" aria-label="Entrar o crear cuenta">
            {TABS.map((tab) => {
                const current = location.pathname === tab.to;
                return (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        state={location.state}
                        className={current ? "is-current" : undefined}
                        aria-current={current ? "page" : undefined}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
};


/** La línea bajo el botón de Google: Google no pasa por la casilla de
 *  privacidad del registro (WEB-02, B1). Abre en otra pestaña para no
 *  perder lo que ya se haya escrito. */
export const GooglePrivacy = () => (
    <p className="auth-legal">
        Al continuar con Google aceptas la{" "}
        <Link to="/privacy" target="_blank" rel="noreferrer">política de privacidad</Link>.
    </p>
);
