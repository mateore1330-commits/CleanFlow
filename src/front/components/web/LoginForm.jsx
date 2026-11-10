/**
 * FORMULARIO DE INICIO DE SESIÓN (maqueta 03, WEB-02).
 *
 * Lo usan las dos puertas (/login-clients y /login-workers), que
 * autentican igual: el mismo POST /api/login, que no mira el rol. Solo
 * cambian los textos y lo que se ofrece, y por eso llegan por props:
 *
 *   title / subtitle: la cabecera
 *   submitLabel:      el texto del botón
 *   foot(state):      el pie, al que se le pasa el state de la navegación
 *                     para que el enlace conserve el destino (WEB-15)
 *   google:           si se ofrece entrar con Google, con las pestañas y
 *                     la línea de confianza. Solo la puerta del cliente:
 *                     el equipo entra con la cuenta que le dio la empresa
 *
 * El marco (las dos mitades, el panel de marca y «Volver al inicio») lo
 * pone AuthLayout. Estilos: auth.css y las piezas comunes de index.css.
 */

import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/authService.js";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";
import { returnPath } from "../../authPaths.js";
import { isEmail } from "../../utils/validate.js";
import { GoogleButton } from "./GoogleButton.jsx";
import { AuthField } from "./AuthField.jsx";
import { AuthTabs, GooglePrivacy } from "./AuthTabs.jsx";
import { AuthMessage } from "./AuthMessage.jsx";


// Lo que se comprueba antes de enviar. Devuelve un error por campo.
const check = (email, password) => {
    const errors = {};
    if (!email.trim()) errors.email = "Escribe tu correo.";
    else if (!isEmail(email)) errors.email = "Revisa el correo: tiene que ser como nombre@correo.com.";
    if (!password) errors.password = "Escribe tu contraseña.";
    return errors;
};


export const LoginForm = ({ title, subtitle, submitLabel, foot, google = false }) => {

    const { dispatch } = useGlobalReducer()
    const navigate = useNavigate();
    const location = useLocation();

    // Datos que ProtectedRoutes deja en el `state` de la navegación al
    // echar aquí al usuario. No viajan en la URL, así que no se pueden
    // falsificar con un enlace preparado.
    //
    // `from`: la ruta que intentaba abrir, con sus parámetros. returnPath
    // se encarga de que no se pierda nada y de poner /dashboard si llegó
    // al login por su cuenta y no hay destino guardado.
    const from = returnPath(location.state?.from);

    // Inputs controlados: el estado manda, no el DOM.
    // Viniendo del registro, el correo llega ya escrito (WEB-15).
    const [email, setEmail] = useState(location.state?.email || "");
    const [password, setPassword] = useState("");

    // Errores de cada campo (antes de enviar) y el del servidor
    // (credenciales incorrectas, etc.), que va arriba.
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    // Avisos que llegan en el state de la navegación: sesión caducada, o
    // cuenta creada cuando la sesión no se pudo abrir sola. Se guardan en
    // estado propio para retirarlos en cuanto el usuario reintenta.
    const [expired, setExpired] = useState(Boolean(location.state?.expired));
    const [registered, setRegistered] = useState(Boolean(location.state?.registered));

    // Si el botón de Google no llega a salir, no se le manda a usarlo.
    const [googleReady, setGoogleReady] = useState(true);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleSubmit = async (e) => {
        // Evita que el navegador recargue la página al enviar.
        e.preventDefault();
        if (sending) return;

        setError("");
        setExpired(false);
        setRegistered(false);

        // Lo que falta se dice junto al campo, y el cursor va al primero.
        const errors = check(email, password);
        setFieldErrors(errors);
        if (errors.email) return emailRef.current?.focus();
        if (errors.password) return passwordRef.current?.focus();

        // authService devuelve { ok, data }: nunca lanza.
        setSending(true);
        const { ok, data } = await login(email, password)
        setSending(false);

        if (!ok) {
            setError(data.message || "No hemos podido entrar. Inténtalo de nuevo.")
            return
        }

        // Un solo dispatch con token y usuario. El reducer los guarda
        // también en localStorage, para que store y disco no se separen.
        dispatch({
            type: "LOGIN",
            payload: {
                token: data.token,
                user: data.user
            }
        })

        // Vuelta a donde iba el usuario, o a /dashboard si venía directo.
        // replace: «atrás» no trae de vuelta el login con la sesión abierta.
        navigate(from, { replace: true })
    }

    // Al escribir se retira el error de ese campo y el de arriba.
    const edit = (field, setter) => (e) => {
        setter(e.target.value);
        setError("");
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    return (
        <>
            {google && <AuthTabs />}

            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>

            {/* Arriba del formulario a propósito: abajo, la gente escribe
                el correo y la contraseña y solo entonces ve el atajo. */}
            {google && (
                <GoogleButton onError={setError} shape="pill" onUnavailable={() => setGoogleReady(false)}>
                    <GooglePrivacy />
                    <p className="auth-or">o con tu correo</p>
                </GoogleButton>
            )}

            {expired && (
                <AuthMessage tone="warning" icon="fa-clock-rotate-left">
                    Tu sesión ha caducado. Vuelve a entrar para continuar.
                </AuthMessage>
            )}

            {registered && (
                <AuthMessage tone="success" icon="fa-circle-check">
                    Tu cuenta se ha creado. Entra con tu correo y tu contraseña para continuar.
                </AuthMessage>
            )}

            {error && (
                <>
                    <AuthMessage id="login-error" tone="danger" icon="fa-circle-exclamation" alert>
                        {error}
                    </AuthMessage>

                    {/* La pista va en CUALQUIER fallo, no solo cuando la
                        cuenta es de Google. Quien se registró con Google
                        no tiene contraseña y aquí se quedaría probando
                        una que no existe; con esto sale solo.

                        Y al ser siempre la misma, no dice si el correo
                        está registrado: quien fuera probando correos para
                        averiguarlo vería exactamente lo mismo. */}
                    {google && googleReady && (
                        <AuthMessage tone="info" icon="fa-circle-info">
                            <b>¿Te registraste con Google?</b> Entra con el botón
                            «Continuar con Google».
                        </AuthMessage>
                    )}
                </>
            )}

            {/* noValidate: los avisos son los nuestros, junto al campo y en
                español claro, no las burbujas del navegador. */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <AuthField
                    id="email"
                    label="Correo electrónico"
                    icon="envelope"
                    type="email"
                    ref={emailRef}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    value={email}
                    onChange={edit("email", setEmail)}
                    error={fieldErrors.email}
                    invalid={Boolean(error)}
                    describedBy="login-error"
                />

                <AuthField
                    id="password"
                    label="Contraseña"
                    icon="lock"
                    type="password"
                    ref={passwordRef}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={edit("password", setPassword)}
                    error={fieldErrors.password}
                    invalid={Boolean(error)}
                    describedBy="login-error"
                />

                {/* type="submit": también funciona pulsando Intro. */}
                <button type="submit" className="cf-btn cf-btn--block" disabled={sending}>
                    {sending ? "Entrando…" : submitLabel}
                </button>
            </form>

            {/* El pie lo pone cada puerta: no es lo mismo lo que se le
                ofrece a un cliente que a alguien del equipo. */}
            <p className="auth-foot">{foot(location.state)}</p>

            {google && (
                <ul className="auth-trust">
                    <li><i className="fa-solid fa-lock" aria-hidden="true"></i>Conexión segura</li>
                    <li><i className="fa-solid fa-shield-halved" aria-hidden="true"></i>No compartimos tus datos</li>
                </ul>
            )}
        </>
    );
};
