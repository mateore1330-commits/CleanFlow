/**
 * SE TE QUEDÓ A MEDIAS (maqueta 05, PANEL-03).
 *
 * Lo que hay que arreglar antes de seguir: una foto que falta, una tarea
 * sin cerrar o un día sin cerrar. Cada fila lleva justo a ese sitio del
 * detalle. Sin nada pendiente, el bloque no aparece.
 *
 * Estilos: dashboard.css, sección 16 (cf-wpending).
 */

import { Link } from "react-router-dom";
import { serviceName } from "./workerHomeData";

const ICONS = { photo: "fa-camera", task: "fa-list-check", day: "fa-calendar-xmark" };

export const WorkerUnfinished = ({ items }) => items.length > 0 && (
    <section className="cf-wpending" aria-labelledby="unfinished-title">
        <p className="cf-dash-eyebrow">Antes de seguir</p>
        <h2 id="unfinished-title">Se te quedó a medias</h2>

        <ul>
            {items.map((item) => (
                <li key={item.key}>
                    <Link to={item.to}>
                        <i className={`fa-solid ${ICONS[item.kind]}`} aria-hidden="true"></i>
                        <span>
                            {item.text}
                            <small>{serviceName(item.booking)}</small>
                        </span>
                        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);
