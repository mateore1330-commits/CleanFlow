/**
 * LA REGLA DE CONTRASEÑA, EN EL NAVEGADOR (FIX-04).
 *
 * La copia de la del servidor (password_problem, en api/routes.py), para
 * marcar la lista mientras se escribe y avisar antes de enviar. La que
 * manda es la del servidor: si algún día cambia, se cambian las dos.
 *
 * Especial es todo lo que no es letra, número ni espacio. La ñ y las
 * vocales con tilde son letras: «Ñ» cuenta como mayúscula (por eso \p{…}
 * y la bandera u, y no [A-Z]).
 */

export const PASSWORD_MIN_LENGTH = 8;

// En el orden de la lista. `label` es la línea de la lista; `missing`,
// cómo se nombra en la frase del error.
export const PASSWORD_RULES = [
    {
        key: "length",
        label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
        missing: `al menos ${PASSWORD_MIN_LENGTH} caracteres`,
        test: (value) => [...value].length >= PASSWORD_MIN_LENGTH,
    },
    { key: "upper", label: "Una mayúscula", missing: "una mayúscula", test: (value) => /\p{Lu}/u.test(value) },
    { key: "lower", label: "Una minúscula", missing: "una minúscula", test: (value) => /\p{Ll}/u.test(value) },
    { key: "number", label: "Un número", missing: "un número", test: (value) => /\p{Nd}/u.test(value) },
    {
        key: "special",
        label: "Un carácter especial (!, @, #, ?…)",
        missing: "un carácter especial",
        test: (value) => /[^\p{L}\p{N}\s]/u.test(value),
    },
];

/**
 * Qué le falta, con la misma frase que el servidor, o "" si cumple.
 *
 *   passwordProblem("limpia24")
 *   -> "La contraseña necesita una mayúscula y un carácter especial."
 */
export const passwordProblem = (value, label = "La contraseña") => {
    if (!value) return `${label} es obligatoria.`;

    const missing = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.missing);

    if (missing.length === 0) return "";

    const listed = missing.length === 1
        ? missing[0]
        : `${missing.slice(0, -1).join(", ")} y ${missing[missing.length - 1]}`;

    return `${label} necesita ${listed}.`;
};
