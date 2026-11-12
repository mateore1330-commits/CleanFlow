/**
 * LAS FOTOS ANTES DE SUBIRLAS (PANEL-03, DEPLOY-01).
 *
 * shrinkPhoto(file)
 *   Reduce la foto a 1.600 px por el lado largo y la pasa a JPEG, lo que
 *   suele dejarla en 200–600 kB. Vercel corta cualquier envío de más de
 *   4,5 MB, y una foto de móvil ya pesa 3–6 MB: sin esto, la mitad de las
 *   fotos fallarían en producción (decidido el 11/11/2026, DEPLOY-01 B1).
 *   De paso se suben antes con datos móviles. Si el navegador no sabe
 *   leerla (un HEIC en Chrome, por ejemplo), se envía tal cual y el
 *   servidor dice si la acepta.
 *
 * photoTooBig(file)
 *   El tope del ORIGINAL, antes de reducirlo: lo justo para no intentar
 *   abrir en el móvil un archivo enorme. El servidor sigue mandando con
 *   sus límites (PHOTO_MAX_BYTES y AVATAR_MAX_BYTES en routes.py), que
 *   ya se miden sobre la foto reducida.
 */

export const PHOTO_MAX_MB = 20;

const PHOTO_MAX_BYTES = PHOTO_MAX_MB * 1024 * 1024;

const MAX_SIDE = 1600;
const QUALITY = 0.82;

// Por debajo de esto no merece la pena tocarla.
const SMALL_ENOUGH = 400 * 1024;

/** null si vale; si no, el aviso para enseñar, con lo que pesa. */
export const photoTooBig = (file) => {
    if (!file || file.size <= PHOTO_MAX_BYTES) return null;

    const weight = (file.size / 1024 / 1024).toLocaleString("es-ES", { maximumFractionDigits: 1 });

    return `Esta foto pesa ${weight} MB y el máximo es ${PHOTO_MAX_MB} MB. Elige otra o hazla con menos calidad.`;
};

/** La foto lista para enviar: reducida si hace falta, o la misma si no se puede. */
export const shrinkPhoto = async (file, maxSide = MAX_SIDE) => {
    if (!file || !file.type?.startsWith("image/") || typeof createImageBitmap !== "function") return file;

    let bitmap;

    try {
        // from-image: gira la foto como la hizo el móvil (dato EXIF).
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        return file;
    }

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size <= SMALL_ENOUGH) {
        bitmap.close();
        return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    // Fondo blanco: un PNG con transparencia saldría negro en JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));

    // Si por lo que sea sale más grande (una captura ya pequeña), la original.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";

    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
};

/** Varias a la vez, en el mismo orden. */
export const shrinkPhotos = (files) => Promise.all(files.map((file) => shrinkPhoto(file)));
