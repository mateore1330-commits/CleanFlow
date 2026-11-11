/**
 * PLANTILLA DE LAS PÁGINAS DE TEXTO LARGO (maqueta 07, WEB-04).
 *
 * La usan el aviso legal, la privacidad y las cookies:
 *
 *   cabecera   antetítulo, título, entradilla, la fecha de revisión y
 *              el recordatorio de que es un proyecto de portfolio
 *   índice     a la izquierda, fijo al bajar, y marca el apartado que
 *              se está leyendo; en el móvil, un desplegable arriba
 *   resumen    lo esencial en tres frases, antes del texto
 *   apartados  cada uno con su título y su ancla (#id)
 *   al final   enlaces a las otras dos páginas
 *
 *   page:     "legal" | "privacy" | "cookies" (para no enlazarse a sí misma)
 *   title, lede, updated: textos de la cabecera
 *   summary:  [frases]  ·  sections: [{ id, title, content }]
 *
 * Estilos: legal.css (cf-legal*).
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OWNER } from "../../data/company";
import "../../legal.css";

export const LEGAL_PAGES = [
    { page: "legal", to: "/legal", label: "Aviso legal" },
    { page: "privacy", to: "/privacy", label: "Privacidad" },
    { page: "cookies", to: "/cookies", label: "Cookies" },
];

// A partir de aquí, un título ya «se está leyendo»: justo debajo de la
// cabecera fija (72px) y con un poco de aire.
const READING_LINE = 140;

/** El apartado que se está leyendo: el último cuyo título ya ha pasado. */
const useReading = (ids) => {
    const [current, setCurrent] = useState(ids[0]);

    useEffect(() => {
        const update = () => {
            let reading = ids[0];

            for (const id of ids) {
                const title = document.getElementById(id);
                if (title && title.getBoundingClientRect().top < READING_LINE) reading = id;
            }

            setCurrent(reading);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, [ids]);

    return current;
};

/**
 * Una tabla que en el móvil se lee como tarjetas: cada celda lleva su
 * cabecera en data-label, y el CSS la pinta delante.
 *   head: ["Datos", "Para qué"]  ·  rows: [[celda, celda], ...]
 */
export const LegalTable = ({ head, rows }) => (
    <table className="cf-legal-table">
        <thead>
            <tr>{head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr>
        </thead>
        <tbody>
            {rows.map((row, r) => (
                <tr key={r}>
                    {row.map((cell, c) => <td key={c} data-label={c === 0 ? undefined : head[c]}>{cell}</td>)}
                </tr>
            ))}
        </tbody>
    </table>
);

/** «su portfolio», enlazado: por donde se le escribe al responsable. */
export const OwnerContact = () => (
    <a href={OWNER.contactUrl} target="_blank" rel="noreferrer">
        su portfolio<span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
);

export const LegalPage = ({ page, title, lede, updated, summary, sections }) => {
    const [ids] = useState(() => sections.map((section) => section.id));
    const reading = useReading(ids);

    const index = (
        <ol>
            {sections.map((section) => (
                <li key={section.id}>
                    <a
                        href={`#${section.id}`}
                        className={section.id === reading ? "is-active" : undefined}
                        aria-current={section.id === reading ? "location" : undefined}
                    >
                        {section.title}
                    </a>
                </li>
            ))}
        </ol>
    );

    return (
        <main className="cf-legal">
            <header className="cf-legal__hero">
                <div className="cf-container">
                    <p className="cf-legal__eyebrow">Legal</p>
                    <h1 className="cf-legal__title">{title}</h1>
                    <p className="cf-legal__lede">{lede}</p>
                    <p className="cf-legal__meta">
                        <span>
                            <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                            Revisada el {updated}
                        </span>
                        <span>
                            <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
                            Proyecto de portfolio: empresa y servicios ficticios
                        </span>
                    </p>
                </div>
            </header>

            <div className="cf-container cf-legal__grid">
                <nav className="cf-legal__toc" aria-label="En esta página">
                    <p className="cf-legal__toc-title">En esta página</p>
                    {index}
                </nav>

                <article className="cf-legal__body">
                    {/* El mismo índice en el móvil, plegado para no empujar
                        el texto hacia abajo. */}
                    <details className="cf-legal__toc-m">
                        <summary>
                            En esta página
                            <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
                        </summary>
                        {index}
                    </details>

                    <section className="cf-legal__summary" aria-labelledby="legal-summary">
                        <h2 id="legal-summary">
                            <i className="fa-solid fa-list-check" aria-hidden="true"></i>
                            En resumen
                        </h2>
                        <ul>
                            {summary.map((line, i) => <li key={i}>{line}</li>)}
                        </ul>
                    </section>

                    {sections.map((section) => (
                        <section key={section.id} className="cf-legal__section" aria-labelledby={section.id}>
                            <h2 id={section.id}>{section.title}</h2>
                            {section.content}
                        </section>
                    ))}

                    <nav className="cf-legal__related" aria-label="Otras páginas legales">
                        {LEGAL_PAGES.filter((other) => other.page !== page).map((other) => (
                            <Link key={other.page} to={other.to}>
                                <span>
                                    <small>También</small>
                                    <b>{other.label}</b>
                                </span>
                                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                            </Link>
                        ))}
                    </nav>
                </article>
            </div>
        </main>
    );
};
