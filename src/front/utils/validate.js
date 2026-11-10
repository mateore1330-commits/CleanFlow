/**
 * COMPROBACIONES DE FORMULARIO EN EL NAVEGADOR (WEB-02).
 *
 * Solo para avisar antes de enviar, junto al campo. No sustituyen a las
 * del servidor: quien quiera saltárselas, puede.
 */

// Algo@algo.algo, sin espacios. Lo justo para pillar el despiste típico
// (falta la @ o el dominio); la comprobación de verdad la hace el servidor.
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Teléfono español: 9 cifras que empiezan por 6, 7, 8 o 9, con o sin
// +34 / 0034 delante. Se aceptan espacios, puntos y guiones entre medias
// (600 123 456, 600-12-34-56), que es como la gente lo escribe.
// Decidido el 10/11/2026 (WEB-02, C1). Que lo compruebe también el
// servidor está en PENDIENTES.md.
export const isSpanishPhone = (value) => {
    const digits = value.replace(/[\s.-]/g, "").replace(/^(\+34|0034)/, "");
    return /^[6789]\d{8}$/.test(digits);
};
