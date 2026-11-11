/**
 * UN CAMPO DE LAS PANTALLAS DE ACCESO (maqueta 03, WEB-02).
 *
 * Etiqueta, icono dentro del campo, pista y error, siempre igual en
 * acceso, registro y «Ya casi está». Con type="password" lleva además el
 * ojo para ver lo que se escribe.
 *
 *   id, label:  el campo y su etiqueta (la etiqueta apunta al id)
 *   aside:      texto gris al lado de la etiqueta («para avisarte…»)
 *   icon:       icono de Font Awesome sin el «fa-» («envelope», «lock»…)
 *   hint:       ayuda debajo, mientras no haya error
 *   error:      el error de ESTE campo; sustituye a la pista
 *   invalid:    marcarlo en rojo sin mensaje propio (el aviso va arriba)
 *   describedBy: id de ese aviso de arriba, para que el lector lo lea
 *   children:   lo que va debajo de la pista o del error, como la lista
 *               de requisitos de la contraseña (FIX-04)
 *   childrenId: su id, para que el lector lo lea también al llegar
 *   ...input:   el resto va tal cual al <input> (value, onChange…)
 *
 * El error se anuncia con aria-invalid y aria-describedby: quien usa
 * lector de pantalla oye el mensaje al llegar al campo.
 *
 * Estilos: index.css (cf-field, cf-input) y auth.css (auth-box, auth-eye).
 */

import { forwardRef, useState } from "react";


// forwardRef: el formulario lleva el cursor al primer campo con error, y
// en React 18 un componente no recibe `ref` si no se le pide así.
export const AuthField = forwardRef(function AuthField({
    id, label, aside, icon, hint, error, invalid, describedBy, children, childrenId, type = "text", ...input
}, ref) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";

    const noteId = error ? `${id}-error` : hint ? `${id}-hint` : null;
    const described = [noteId, childrenId, invalid && describedBy].filter(Boolean).join(" ") || undefined;

    return (
        <div className="cf-field auth-field">
            <label htmlFor={id}>
                {label}
                {aside && <span>{aside}</span>}
            </label>

            <div className={icon ? "auth-box auth-box--icon" : "auth-box"}>
                {icon && <i className={`fa-solid fa-${icon}`} aria-hidden="true"></i>}

                <input
                    ref={ref}
                    id={id}
                    // El tipo cambia solo: «password» oculta, «text» enseña.
                    type={isPassword && visible ? "text" : type}
                    className="cf-input"
                    aria-invalid={Boolean(error || invalid) || undefined}
                    aria-describedby={described}
                    {...input}
                />

                {isPassword && (
                    // type="button": dentro de un <form>, sin él enviaría.
                    <button
                        type="button"
                        className="auth-eye"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={visible}
                    >
                        <i className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true"></i>
                    </button>
                )}
            </div>

            {error ? (
                <p id={`${id}-error`} className="cf-field__error">
                    <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="cf-field__hint">{hint}</p>
            ) : null}

            {children}
        </div>
    );
});
