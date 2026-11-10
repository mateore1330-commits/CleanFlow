/**
 * QUÉ OPINAN NUESTROS CLIENTES (#41).
 *
 * Las últimas opiniones de CleanFlow y la media que forman. Nunca de
 * Google ni de ninguna fuente externa: son las mismas notas que dejan
 * los clientes al terminar un servicio (#20).
 *
 * Lo que sale de cada uno: su nombre de pila con la inicial del
 * apellido, su foto de perfil si la tiene, el servicio y cuándo fue.
 * Las fotos que sube al valorar no salen nunca: son el interior de su
 * casa y las hizo para nosotros, no para publicarlas.
 *
 * Estilos: web.css, bloque cf-reviews.
 */

import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { Stars } from "../../../components/dashboard/bookings/Stars";
import { Avatar } from "../../../components/dashboard/Avatar";

/**
 * "hace 2 semanas".
 *
 * El backend manda el número y la unidad ya redondeados y nunca la
 * fecha, para que el día exacto en que hubo alguien en casa de un
 * cliente no salga del servidor. Aquí solo se escribe, y lo escribe el
 * propio navegador, que ya sabe hacerlo en cualquier idioma.
 */
const RELATIVE = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const ageText = (age) => {
    if (!age) return "";

    // Lo único que Intl no sabe hacer es un tope: con un año escribiría
    // "hace 1 año", y a partir de ahí queremos dejar de contar.
    if (age.unit === "year") return "hace más de un año";

    return RELATIVE.format(-age.value, age.unit);
};

/**
 * Su foto de perfil, o sus iniciales (Avatar, la pieza común de toda la app).
 *
 * La cara la eligió él y por eso puede salir; si no tiene, van sus
 * iniciales. Nunca una foto de archivo: poner al lado de su nombre una
 * cara que no es la suya sería mentir. Si la foto ya no carga, Avatar
 * vuelve a las iniciales.
 */
const Face = ({ review }) => (
    <Avatar
        name={review.client_name}
        src={review.client_avatar_url}
        alt={`Foto de ${review.client_name}`}
        size="sm"
        className="cf-review-card__face"
    />
);

export const ReviewsSection = () => {
    // Del store, que lo pide ReviewsLoader una sola vez al arrancar: el
    // hero de esta misma pantalla enseña la misma media, y sin esto
    // serían dos viajes para el mismo dato.
    const { store } = useGlobalReducer();

    const average = store.reviewsAverage;
    const total = store.reviewsTotal;
    const reviews = store.reviews;

    // Sin opiniones la sección no aparece: mejor que no exista a que
    // salga vacía o con un "0 sobre 5" que no significa nada.
    if (reviews.length === 0) {
        return null;
    }

    return (
        <section id="reviews" className="cf-home-section cf-home-reviews">
            <div className="cf-container">
                <header className="cf-home-head">
                    <div>
                        <p className="cf-eyebrow">Opiniones</p>
                        <h2 className="cf-home-title">Lo que dicen quienes ya confían en nosotros</h2>
                    </div>

                    {/* La media, que es lo que de verdad convence: un
                        visitante lee un número antes que ningún comentario. */}
                    {average !== null && (
                        <div className="cf-home-reviews__score">
                            {/* La coma es lo que se escribe en español. */}
                            <b>{String(average).replace(".", ",")}</b>
                            <span>
                                <Stars value={average} size={18} />
                                <small>
                                    Media de {total} {total === 1 ? "valoración" : "valoraciones"}
                                </small>
                            </span>
                        </div>
                    )}
                </header>

                <ul className="cf-home-reviews__grid">
                    {reviews.map((review) => (
                        <li className="cf-review-card" key={review.review_id}>
                            <Stars value={review.rating} size={15} />
                            <blockquote className="cf-review-card__comment">
                                «{review.comment}»
                            </blockquote>
                            <div className="cf-review-card__who">
                                <Face review={review} />
                                <span>
                                    <span className="cf-review-card__name">{review.client_name}</span>
                                    <small>{ageText(review.age)}</small>
                                </span>
                                {review.service_name && (
                                    <span className="cf-review-card__service">{review.service_name}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};