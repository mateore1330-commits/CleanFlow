/**
 * Precio en euros para la web pública: "16 €" si es redondo y "16,50 €"
 * si no. Una sola función para la tarjeta de servicio y su ficha, así el
 * mismo precio nunca se escribe de dos maneras.
 */
export const formatPrice = (price) => {
    const value = Number(price);
    if (!Number.isFinite(value)) return "—";

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(value);
};
