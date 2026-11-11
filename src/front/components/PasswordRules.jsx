/**
 * LA LISTA DE REQUISITOS DE LA CONTRASEÑA (maqueta 03, FIX-04).
 *
 * Los cinco requisitos, que se marcan con ✓ y en verde según se cumplen.
 * Se ve siempre, también con el campo vacío: así se sabe qué se pide
 * antes de inventarse una. Sin la barra de fuerza de la maqueta
 * (decidido el 11/11/2026, A1): contaba lo mismo que la lista.
 *
 * El campo la apunta con aria-describedby (por eso el `id`): el lector
 * de pantalla la lee al llegar, con «cumplido» o «falta» en cada línea.
 * No se anuncia en cada tecla, que no dejaría escribir tranquilo.
 *
 *   id:     para el aria-describedby del campo
 *   value:  lo escrito
 *
 * La regla vive en utils/passwordRule.js · Estilos: index.css (cf-pwrules).
 */

import { PASSWORD_RULES } from "../utils/passwordRule";

export const PasswordRules = ({ id, value }) => (
    <ul className="cf-pwrules" id={id}>
        {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value);

            return (
                <li key={rule.key} className={ok ? "cf-pwrules__item cf-pwrules__item--ok" : "cf-pwrules__item"}>
                    <i className={ok ? "fa-solid fa-check" : "fa-regular fa-circle"} aria-hidden="true"></i>
                    {rule.label}
                    <span className="sr-only">{ok ? ", cumplido." : ", falta."}</span>
                </li>
            );
        })}
    </ul>
);
