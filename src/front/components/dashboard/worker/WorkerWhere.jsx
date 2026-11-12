/**
 * INFORMACIÓN DEL CLIENTE (maqueta 05, PANEL-03).
 *
 * Dónde es, cómo entrar, quién es y lo que ha pedido, cada dato con su
 * icono. Al lado de la dirección, abrirla en Google Maps; al lado del
 * cliente, llamarle (el teléfono solo llega el día del servicio).
 *
 * Estilos: dashboard.css, sección 10 (cf-winfo).
 */

const streetOf = (address) =>
    [`${address.street}, ${address.number}`, address.floor].filter(Boolean).join(" · ");

/** El enlace de Google Maps con la dirección, para ir sin escribirla. */
const mapsOf = (address) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${address.street} ${address.number}, ${address.postal_code} ${address.city}`
    )}`;

/** Una fila: icono y etiqueta, el dato debajo y, si hay, su botón. */
const Row = ({ icon, label, children, action }) => (
    <div className="cf-winfo__row">
        <dt>
            <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
            {label}
        </dt>
        <dd>{children}</dd>
        {action && <dd className="cf-winfo__act">{action}</dd>}
    </div>
);

export const WorkerWhere = ({ booking }) => {
    const { address } = booking;

    return (
        <section className="cf-wblock">
            <h2 className="cf-wblock__title">Información del cliente</h2>

            <dl className="cf-winfo">
                <Row
                    icon="fa-location-dot"
                    label="Dirección"
                    action={
                        <a
                            className="cf-winfo__btn"
                            href={mapsOf(address)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Abrir la dirección en Google Maps"
                        >
                            <i className="fa-solid fa-diamond-turn-right" aria-hidden="true"></i>
                        </a>
                    }
                >
                    {streetOf(address)}
                    <br />
                    {address.postal_code} {address.city}
                </Row>

                {/* Cómo entrar: el portero, la llave del vecino, el timbre que
                    no suena. Muchas veces es el dato más útil de la pantalla. */}
                {address.access_notes && (
                    <Row icon="fa-key" label="Cómo entrar">{address.access_notes}</Row>
                )}

                <Row
                    icon="fa-user"
                    label="Cliente"
                    action={booking.client_phone && (
                        <a
                            className="cf-winfo__btn"
                            href={`tel:${booking.client_phone}`}
                            aria-label={`Llamar al cliente, ${booking.client_phone}`}
                        >
                            <i className="fa-solid fa-phone" aria-hidden="true"></i>
                        </a>
                    )}
                >
                    {booking.client_name || "Cliente"}
                    {/* Sin teléfono todavía: se dice cuándo llega, para que
                        nadie lo busque antes de tiempo. */}
                    {!booking.client_phone && (
                        <span className="cf-winfo__locked">
                            <i className="fa-solid fa-lock" aria-hidden="true"></i>
                            El teléfono, el día del servicio
                        </span>
                    )}
                </Row>

                {booking.client_notes && (
                    <Row icon="fa-comment" label="Nota del cliente">«{booking.client_notes}»</Row>
                )}
            </dl>
        </section>
    );
};
