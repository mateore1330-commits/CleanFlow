/**
 * CÓMO FUNCIONA (maqueta 02, WEB-01). Sección nueva.
 *
 * Explica el proceso en tres pasos y quita miedos antes de reservar.
 * Es una lista ordenada: el orden importa, y así lo anuncia un lector de
 * pantalla ("lista, 3 elementos").
 */

const STEPS = [
    {
        icon: "fa-list-check",
        title: "Elige el servicio",
        text: "Escoge el tipo de limpieza y cuántas horas necesitas. Ves el precio final antes de confirmar.",
    },
    {
        icon: "fa-calendar-days",
        title: "Escoge día y hora",
        text: "Solo te enseñamos huecos en los que hay personal disponible. Sin llamadas ni esperas.",
    },
    {
        icon: "fa-house-circle-check",
        title: "Nosotros limpiamos",
        text: "Llegamos con todo el material. Sigues el servicio desde tu área de cliente y lo valoras al terminar.",
    },
];


export const HowItWorksSection = () => (
    <section id="how" className="cf-home-section cf-home-how">
        <div className="cf-container">
            <header className="cf-home-head cf-home-head--center">
                <div>
                    <p className="cf-eyebrow">Cómo funciona</p>
                    <h2 className="cf-home-title">Reservar es cosa de dos minutos</h2>
                </div>
            </header>

            <ol className="cf-home-how__steps">
                {STEPS.map((step, index) => (
                    <li className="cf-home-how__step" key={step.title}>
                        <span className="cf-home-how__n" aria-hidden="true">{index + 1}</span>
                        <i className={`fa-solid ${step.icon} cf-home-how__icon`} aria-hidden="true"></i>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);
