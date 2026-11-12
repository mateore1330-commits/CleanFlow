/**
 * UN AVISO DE LAS PANTALLAS DE ACCESO (maqueta 03, WEB-02).
 *
 * La caja común (cf-alert) con su icono delante. Los tonos son los de
 * estado del manual: danger (error), warning (sesión caducada), success
 * (cuenta creada) e info (pistas).
 *
 *   alert: para errores. role="alert" hace que el lector de pantalla lo
 *          anuncie en cuanto aparece; el resto van con role="status",
 *          que espera a que termine de leer lo que estaba leyendo.
 *
 * Estilos: index.css (cf-alert) y auth.css (auth-message).
 */

const TONES = { danger: "", warning: " cf-alert--warning", success: " cf-alert--success", info: " cf-alert--info" };

export const AuthMessage = ({ id, tone = "danger", icon, alert = false, children }) => (
    <div id={id} className={`cf-alert${TONES[tone]} auth-message`} role={alert ? "alert" : "status"}>
        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
        <span>{children}</span>
    </div>
);
