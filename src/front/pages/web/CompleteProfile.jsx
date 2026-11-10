/**
 * EL PASO QUE FALTA TRAS ENTRAR CON GOOGLE.
 *
 * Google da nombre, apellido, correo y foto, pero no el teléfono, y en
 * CleanFlow hace falta: es por donde llama quien va a la casa si no
 * encuentra el portal.
 *
 * No se puede saltar. Una cuenta sin teléfono estallaría justo al
 * contratar, que es el peor momento para descubrir que falta un dato.
 *
 * El título dice "Ya casi está" y arriba se ve la cuenta ya creada: el
 * usuario pulsó un botón esperando entrar, y no puede sentir que le han
 * colado un registro por la puerta de atrás.
 *
 * Este paso está en medio del camino, no al final: quien venía de
 * "Contratar" tiene que acabar contratando. Por eso los dos sitios que
 * desvían hasta aquí —GoogleButton y ProtectedRoutes— traen el destino
 * en el state de la navegación, y aquí se recoge.
 *
 * Ese state no sobrevive a recargar la página. Recargando justo en esta
 * pantalla se pierde el destino y se acaba en el panel; es un caso raro y
 * se prefiere a guardar el destino en el store y tener que limpiarlo.
 *
 * El teléfono se comprueba antes de enviar: español de 9 cifras, con o
 * sin +34 (decidido el 10/11/2026, WEB-02 C1).
 *
 * Estilos: auth.css (auth-steps, auth-who) y las piezas comunes.
 */

import { useRef, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";
import { setAccountPhone } from "../../services/authService.js";
import { loginPathForRole, returnPath } from "../../authPaths.js";
import { isSpanishPhone } from "../../utils/validate.js";
import { AuthField } from "../../components/web/AuthField.jsx";
import { AuthMessage } from "../../components/web/AuthMessage.jsx";
import { Avatar } from "../../components/dashboard/Avatar.jsx";


// La «G» de Google, para que se vea con qué cuenta ha entrado. Es la
// marca tal cual, sin cambiarle los colores.
const GoogleMark = () => (
    <svg className="auth-who__google" viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

export const CompleteProfile = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    // El destino que traía quien venía de "Contratar", puesto por quien
    // lo desvió hasta aquí. Sin ninguno, returnPath ya devuelve el panel,
    // así que no hace falta comprobarlo.
    const from = returnPath(location.state?.from);

    const [phone, setPhone] = useState("");
    // El del campo (antes de enviar) y el del servidor, que va arriba.
    const [phoneError, setPhoneError] = useState("");
    const [error, setError] = useState("");
    const phoneRef = useRef(null);
    const [saving, setSaving] = useState(false);

    const user = store.user;

    // ------------------------------------------------------------------
    // QUIÉN PUEDE VER ESTA PANTALLA
    //
    // Vive fuera de /dashboard, así que ProtectedRoutes no la vigila y
    // hay que hacerlo aquí. La comprobación va al pintar y no en un
    // useEffect: así no se llega a ver ni un fotograma de lo que no toca.
    // ------------------------------------------------------------------

    // Sin sesión, a la puerta que le corresponda. Antes se veía la
    // tarjeta con el nombre en blanco y un formulario que solo sabía
    // fallar, porque guardar el teléfono pide token.
    if (!store.token) {
        return <Navigate to={loginPathForRole(store.user?.role)} replace />;
    }

    // Con la cuenta ya completa no hay nada que completar. Aquí llega
    // quien pulsa "Atrás" después de guardar, y quien escribe la URL.
    //
    // Va al mismo sitio que el botón de guardar, y no al panel: al
    // dispatch de abajo le sigue un repintado, y si los dos destinos no
    // coincidieran, el que llegase antes decidiría.
    if (!store.user?.needs_phone) {
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        setError("");

        const problem = !phone.trim()
            ? "Escribe tu teléfono."
            : !isSpanishPhone(phone)
                ? "Escribe un teléfono español de 9 cifras, como 600 123 456."
                : "";
        setPhoneError(problem);
        if (problem) {
            phoneRef.current?.focus();
            return;
        }

        setSaving(true);

        const { ok, data } = await setAccountPhone(phone, store.token);

        setSaving(false);

        if (!ok) {
            setError(data.message || "No se ha podido guardar el teléfono.");
            return;
        }

        // El usuario se repinta con la respuesta: needs_phone pasa a false
        // y la guarda de ProtectedRoutes deja de mandarlo aquí.
        dispatch({ type: "SET_USER", payload: data.user });

        navigate(from, { replace: true });
    };

    return (
        <>
            {/* El paso 1 fue elegir la cuenta de Google: la barra dice que
                ya casi está. El lector de pantalla lee el texto. */}
            <p className="auth-steps__label">Paso 2 de 2</p>
            <div className="auth-steps" aria-hidden="true">
                <i></i>
                <i></i>
            </div>

            <h1 className="auth-title">Ya casi está</h1>
            <p className="auth-subtitle">Necesitamos tu teléfono para poder ir a tu casa.</p>

            {/* Su cuenta, ya creada. Sin esto parecería que está
                empezando un registro de cero. */}
            <div className="auth-who">
                <Avatar user={user} size="md" />
                <span className="auth-who__text">
                    <b>{user?.name} {user?.last_name}</b>
                    <span>{user?.email}</span>
                </span>
                <GoogleMark />
            </div>

            {error && (
                <AuthMessage tone="danger" icon="fa-circle-exclamation" alert>
                    {error}
                </AuthMessage>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {/* El porqué, aquí mismo: pedir un teléfono sin decir para
                    qué es lo que hace que la gente escriba números falsos. */}
                <AuthField
                    id="phone"
                    label="Teléfono"
                    icon="phone"
                    type="tel"
                    ref={phoneRef}
                    placeholder="600 123 456"
                    autoComplete="tel"
                    autoFocus
                    value={phone}
                    onChange={(event) => {
                        setPhone(event.target.value);
                        setPhoneError("");
                        setError("");
                    }}
                    error={phoneError}
                    hint="Lo usa quien vaya a limpiar si no encuentra el portal o llega antes de tiempo."
                />

                <button type="submit" className="cf-btn cf-btn--block" disabled={saving}>
                    {saving ? "Guardando…" : "Guardar y continuar"}
                </button>
            </form>
        </>
    );
};
