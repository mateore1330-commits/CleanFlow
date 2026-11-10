/**
 * Pantalla de registro de clientes (maqueta 03, WEB-02).
 *
 * Solo el formulario: el marco lo pone AuthLayout. Tras el alta abre la
 * sesión sola y devuelve al usuario a donde iba, con sus parámetros:
 * quien venía de contratar un servicio llega con ese servicio ya
 * elegido. Sin destino guardado, /dashboard.
 *
 * Antes de enviar se comprueba lo básico y se dice junto al campo. La
 * contraseña sigue con la regla de hoy (mínimo 6); la nueva y su lista de
 * requisitos son FIX-04 (decidido el 10/11/2026, A1).
 *
 * Estilos: auth.css y las piezas comunes de index.css.
 */

import { useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login, register } from "../../services/authService";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";
import { LOGIN_CLIENTS, returnPath } from "../../authPaths.js";
import { isEmail, isSpanishPhone } from "../../utils/validate.js";
import { GoogleButton } from "../../components/web/GoogleButton.jsx";
import { AuthField } from "../../components/web/AuthField.jsx";
import { AuthTabs, GooglePrivacy } from "../../components/web/AuthTabs.jsx";
import { AuthMessage } from "../../components/web/AuthMessage.jsx";


// El mismo mínimo que pide el servidor en /register.
const PASSWORD_MIN_LENGTH = 6;

// El orden es el del formulario: el cursor va al primero que falle.
const FIELDS = ["name", "last_name", "email", "phone", "password", "privacy"];

const check = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = "Escribe tu nombre.";
    if (!data.last_name.trim()) errors.last_name = "Escribe tus apellidos.";
    if (!data.email.trim()) errors.email = "Escribe tu correo.";
    else if (!isEmail(data.email)) errors.email = "Revisa el correo: tiene que ser como nombre@correo.com.";
    if (!data.phone.trim()) errors.phone = "Escribe tu teléfono.";
    else if (!isSpanishPhone(data.phone)) errors.phone = "Escribe un teléfono español de 9 cifras, como 600 123 456.";
    if (data.password.length < PASSWORD_MIN_LENGTH) errors.password = `La contraseña necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    if (!data.privacy) errors.privacy = "Para crear la cuenta tienes que aceptar la política de privacidad.";
    return errors;
};


export const Register = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    // Lo que dejó ProtectedRoutes al mandar al login: el destino, con sus
    // parámetros. Entrando al registro por su cuenta no hay, y returnPath
    // devuelve /dashboard.
    const location = useLocation();
    const from = returnPath(location.state?.from);

    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        privacy: false,
    });

    // Errores de cada campo y el del servidor que no es de ninguno.
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");

    // El correo ya tiene cuenta, pero creada con Google. No es que esté
    // "pillado": es que la cuenta ya es suya.
    const [useGoogle, setUseGoogle] = useState("");

    // Evita el doble envío y cambia el texto del botón mientras se guarda.
    const [loading, setLoading] = useState(false);

    // Sin botón de Google, el aviso de «entra con Google» no dice
    // «el botón de arriba», que no estaría.
    const [googleReady, setGoogleReady] = useState(true);

    // Un ref por campo, para llevar el cursor al primero con error.
    const refs = useRef({});
    const bind = (name) => (el) => { refs.current[name] = el; };

    // Un solo manejador para todos los campos: cada input lleva su `name`.
    const handleChange = (event) => {
        const { name, type, checked, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError("");
        setUseGoogle("");

        const errors = check(formData);
        setFieldErrors(errors);
        const first = FIELDS.find((field) => errors[field]);
        if (first) {
            refs.current[first]?.focus();
            return;
        }

        setLoading(true);

        // register() y login() nunca lanzan: devuelven { ok, data, status }.
        // La casilla no viaja: el servidor no la guarda (decidido, B1).
        const { name, last_name, email, phone, password } = formData;
        const created = await register({ name, last_name, email, phone, password });

        if (!created.ok) {
            setLoading(false);

            if (created.data.use_google) {
                setUseGoogle(created.data.message);
                return;
            }

            // El correo repetido es de un campo: se dice debajo de él.
            if (created.status === 409) {
                setFieldErrors({ email: created.data.message || "Ya hay una cuenta con este correo." });
                refs.current.email?.focus();
                return;
            }

            // Los campos no se borran: así se puede corregir y reintentar.
            setError(created.data.message || "No se pudo completar el registro");
            return;
        }

        // Cuenta creada: se abre la sesión con los mismos datos, en vez de
        // mandarle a escribirlos otra vez.
        const session = await login(formData.email, formData.password);

        if (!session.ok) {
            // La cuenta existe, pero la sesión no se pudo abrir: al login,
            // con el destino, el correo ya escrito y el aviso de que solo le
            // falta entrar. La contraseña no viaja: la vuelve a escribir.
            navigate(LOGIN_CLIENTS, {
                replace: true,
                state: { from: location.state?.from, registered: true, email: formData.email },
            });
            return;
        }

        dispatch({
            type: "LOGIN",
            payload: {
                token: session.data.token,
                user: session.data.user,
            },
        });

        // replace: "atrás" no vuelve al formulario con la sesión ya abierta.
        navigate(from, { replace: true });
    };

    return (
        <>
            <AuthTabs />

            <h1 className="auth-title">Crea tu cuenta</h1>
            <p className="auth-subtitle">Para reservar y seguir tus limpiezas.</p>

            {/* Arriba del formulario: quien vaya a usarlo se ahorra
                rellenar cinco campos. Entrar y registrarse con Google son
                lo mismo: si el correo no existe, se crea la cuenta. */}
            <GoogleButton onError={setError} text="signup_with" shape="pill" onUnavailable={() => setGoogleReady(false)}>
                <GooglePrivacy />
                <p className="auth-or">o con tu correo</p>
            </GoogleButton>

            {useGoogle && (
                <AuthMessage tone="info" icon="fa-circle-info">
                    <b>Ya tienes una cuenta con este correo.</b> La creaste con
                    Google, así que entra con {googleReady ? "el botón de arriba" : "Google"}.
                    Es la misma cuenta, con tus reservas.
                </AuthMessage>
            )}

            {error && (
                <AuthMessage tone="danger" icon="fa-circle-exclamation" alert>
                    {error}
                </AuthMessage>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-two">
                    <AuthField
                        id="name"
                        name="name"
                        label="Nombre"
                        ref={bind("name")}
                        placeholder="Tu nombre"
                        autoComplete="given-name"
                        value={formData.name}
                        onChange={handleChange}
                        error={fieldErrors.name}
                    />

                    <AuthField
                        id="last_name"
                        name="last_name"
                        label="Apellidos"
                        ref={bind("last_name")}
                        placeholder="Tus apellidos"
                        autoComplete="family-name"
                        value={formData.last_name}
                        onChange={handleChange}
                        error={fieldErrors.last_name}
                    />
                </div>

                <AuthField
                    id="email"
                    name="email"
                    label="Correo electrónico"
                    icon="envelope"
                    type="email"
                    ref={bind("email")}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={fieldErrors.email}
                />

                <AuthField
                    id="phone"
                    name="phone"
                    label="Teléfono"
                    aside="para avisarte el día del servicio"
                    icon="phone"
                    type="tel"
                    ref={bind("phone")}
                    placeholder="600 123 456"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={fieldErrors.phone}
                />

                <AuthField
                    id="password"
                    name="password"
                    label="Contraseña"
                    icon="lock"
                    type="password"
                    ref={bind("password")}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={fieldErrors.password}
                    hint={`Al menos ${PASSWORD_MIN_LENGTH} caracteres.`}
                />

                {/* Obligatoria (RGPD). Abre en otra pestaña para no perder
                    lo escrito. La página llega con WEB-04. */}
                <div className="auth-check">
                    <label>
                        <input
                            type="checkbox"
                            name="privacy"
                            ref={bind("privacy")}
                            checked={formData.privacy}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.privacy) || undefined}
                            aria-describedby={fieldErrors.privacy ? "privacy-error" : undefined}
                        />
                        <span>
                            He leído y acepto la{" "}
                            <Link to="/privacy" target="_blank" rel="noreferrer">política de privacidad</Link>.
                        </span>
                    </label>

                    {fieldErrors.privacy && (
                        <p id="privacy-error" className="cf-field__error">
                            <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                            {fieldErrors.privacy}
                        </p>
                    )}
                </div>

                <button type="submit" className="cf-btn cf-btn--block" disabled={loading}>
                    {loading ? "Creando cuenta…" : "Crear cuenta"}
                </button>
            </form>

            {/* El mismo destino de vuelta, por si prefiere entrar con una
                cuenta que ya tiene. */}
            <p className="auth-foot">
                ¿Ya tienes cuenta? <Link to={LOGIN_CLIENTS} state={location.state}>Entra</Link>
            </p>
        </>
    );
};
