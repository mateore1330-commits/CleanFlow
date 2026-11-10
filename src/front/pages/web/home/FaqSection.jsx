/**
 * PREGUNTAS FRECUENTES (maqueta 02, WEB-01). Sección nueva.
 *
 * <details> y <summary>: se abren y se cierran sin JavaScript, con
 * teclado (Intro o espacio) y el lector de pantalla anuncia si están
 * abiertas o cerradas. La primera sale abierta, para que se vea que se
 * pueden abrir.
 *
 * Las respuestas solo prometen lo que la app hace: cancelar o cambiar la
 * fecha gratis hasta 24 h antes (CHANGE_HOURS en el servidor).
 */

import { Link } from "react-router-dom";


const QUESTIONS = [
    {
        q: "¿Tengo que estar en casa durante la limpieza?",
        a: "No es necesario. Muchos clientes nos dejan las llaves o un código de acceso. Lo indicas en las notas al hacer la reserva.",
    },
    {
        q: "¿Qué productos utilizáis?",
        a: "Productos profesionales y todo el material necesario. Si prefieres que usemos los tuyos, avísanos en la reserva.",
    },
    {
        q: "¿Puedo cambiar o cancelar una reserva?",
        a: "Sí, gratis hasta 24 horas antes desde tu área de cliente. Después de ese plazo, escríbenos.",
    },
    {
        q: "¿En qué zonas trabajáis?",
        a: "En Madrid capital y alrededores. Si tienes dudas sobre tu zona, escríbenos.",
    },
    {
        q: "¿Cuánto cuesta?",
        a: "Pagas por horas, y cada servicio tiene su precio por hora y un mínimo de horas. Ves el precio exacto antes de confirmar la reserva.",
    },
];


export const FaqSection = () => (
    <section id="faq" className="cf-home-section cf-home-faq">
        <div className="cf-container cf-home-faq__grid">
            <div>
                <p className="cf-eyebrow">Preguntas frecuentes</p>
                <h2 className="cf-home-title">Lo que más nos preguntan</h2>

                <div className="cf-home-faq__help">
                    <b>¿No encuentras tu respuesta?</b>
                    <p>Escríbenos y te contestamos en menos de 24 h laborables.</p>
                    <Link to="/#contact" className="cf-btn cf-btn--ghost cf-btn--sm">Ir al formulario</Link>
                </div>
            </div>

            <div className="cf-home-faq__list">
                {QUESTIONS.map((item, index) => (
                    <details key={item.q} open={index === 0}>
                        <summary>{item.q}</summary>
                        <p>{item.a}</p>
                    </details>
                ))}
            </div>
        </div>
    </section>
);
