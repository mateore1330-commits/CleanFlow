/**
 * EL LÍMITE DE LAS FOTOS DEL TRABAJADOR (PANEL-03).
 *
 * El servidor rechaza las de más de 5 MB (PHOTO_MAX_BYTES en routes.py),
 * pero solo después de subirlas: con datos móviles, eso es esperar para
 * nada. Aquí se mira antes, con el tamaño que ya da el navegador.
 *
 * Decidido el 10/11/2026 (PANEL-03, A1). El servidor sigue mandando: esto
 * solo ahorra el viaje.
 */

export const PHOTO_MAX_MB = 5;

const PHOTO_MAX_BYTES = PHOTO_MAX_MB * 1024 * 1024;

/** null si vale; si no, el aviso para enseñar, con lo que pesa. */
export const photoTooBig = (file) => {
    if (!file || file.size <= PHOTO_MAX_BYTES) return null;

    const weight = (file.size / 1024 / 1024).toLocaleString("es-ES", { maximumFractionDigits: 1 });

    return `Esta foto pesa ${weight} MB y el máximo es ${PHOTO_MAX_MB} MB. Hazla con menos calidad o elige otra.`;
};
