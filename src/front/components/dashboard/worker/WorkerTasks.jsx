/**
 * LAS TAREAS DEL SERVICIO.
 *
 * Cada una con sus dos fotos y su botón de cerrar. Una tarea no se puede
 * marcar sin el antes y el después: son la prueba de cómo quedó, y de
 * ellas vive la confirmación del cliente y la respuesta a una queja.
 *
 * Una tarea cerrada se puede desmarcar mientras el servicio esté en
 * curso; sus fotos se conservan.
 *
 * Todas a la vista, una debajo de otra: el trabajador tiene que cerrarlas
 * todas, y una escondida es una tarea que se olvida. Decidido el
 * 10/11/2026 (PANEL-03, B1), frente al «+ 2 tareas más» de la maqueta.
 *
 * Solo pinta y avisa: quien sube, borra y marca es la página.
 *
 * Estilos: dashboard.css, sección 10 (cf-wtask).
 */

import { useState } from "react";
import { WorkerShot } from "./WorkerShot";
import { PHOTO_MAX_MB } from "../../../utils/photo";

/** La foto de ese tipo, si ya está subida. */
const photoOf = (task, kind) =>
    task.photos?.find((photo) => photo.kind === kind) || null;

/** Agrupa por nombre: [{ name, total }]. Tres habitaciones son una fila. */
const groupTasks = (tasks) => {
    const groups = new Map();

    tasks.forEach((task) => {
        groups.set(task.task_name, (groups.get(task.task_name) || 0) + 1);
    });

    return [...groups].map(([name, total]) => ({ name, total }));
};

export const WorkerTasks = ({ booking, busyTaskId, uploading, onPick, onDeletePhoto, onToggle }) => {
    const { tasks } = booking;

    // La foto que no se subió por pesar demasiado: { taskId, text }. El
    // aviso va debajo de esa tarea, no arriba del todo, que en el móvil
    // queda fuera de la pantalla.
    const [rejected, setRejected] = useState(null);

    if (tasks.length === 0) {
        return (
            <section className="cf-wblock">
                <h2 className="cf-wblock__title">Tareas</h2>
                <p className="cf-wdetail__sub">Este servicio se contrató solo por horas.</p>
            </section>
        );
    }

    // Las fotos solo se tocan con el servicio en marcha, igual que exige
    // el backend: ni antes de llegar ni después de finalizar.
    const running = booking.status === "in_progress";
    const done = tasks.filter((task) => task.status === "completed").length;

    // Sin empezar, cancelado o no realizado: las tareas se agrupan y no
    // se enseñan los huecos de foto. En el primer caso porque todavía no
    // tocan; en los otros dos porque ese trabajo ya no se va a hacer.
    if (!running && booking.status !== "completed") {
        return (
            <section className="cf-wblock" id="worker-tasks" tabIndex={-1}>
                <h2 className="cf-wblock__title">Qué hay que hacer</h2>

                {tasks.map((task) => <span key={task.booking_task_id}
                    id={`task-${task.booking_task_id}`} tabIndex={-1} />)}
                <ul className="cf-wtodo">
                    {groupTasks(tasks).map((group) => (
                        <li key={group.name}>
                            <i className="fa-regular fa-circle" aria-hidden="true"></i>
                            {group.name}
                            {group.total > 1 && <b>×{group.total}</b>}
                        </li>
                    ))}
                </ul>
            </section>
        );
    }

    return (
        <section className="cf-wblock">
            <div className="cf-wblock__head">
                <h2 className="cf-wblock__title">Tareas · {done} de {tasks.length}</h2>
                {running && <p className="cf-wblock__aside">Fotos de hasta {PHOTO_MAX_MB} MB</p>}
            </div>

            <span className="cf-wblock__track" aria-hidden="true">
                <span className="cf-wblock__fill" style={{ width: `${(done / tasks.length) * 100}%` }}></span>
            </span>

            <div className="cf-wtasks">
                {tasks.map((task) => {
                    const before = photoOf(task, "before");
                    const after = photoOf(task, "after");
                    const complete = task.status === "completed";
                    const busy = busyTaskId === task.booking_task_id;
                    const ready = Boolean(before && after);
                    const fillMissing = complete && (running || booking.status === "completed");
                    const reject = (text) => setRejected(text ? { taskId: task.booking_task_id, text } : null);

                    // Lo que le falta, debajo del nombre: el motivo de que el
                    // botón siga apagado, sin tener que adivinarlo.
                    const missing = before || after
                        ? `Falta la foto del ${before ? "después" : "antes"}`
                        : "Hacen falta las dos fotos";

                    return (
                        <article
                            key={task.booking_task_id}
                            id={`task-${task.booking_task_id}`}
                            tabIndex={-1}
                            className={`cf-wtask${complete ? " cf-wtask--done" : ""}`}
                        >
                            <div className="cf-wtask__main">
                                <p className="cf-wtask__name">
                                    <span className="cf-wtask__check" aria-hidden="true">
                                        {complete && <i className="fa-solid fa-check"></i>}
                                    </span>
                                    {task.task_name}
                                </p>

                                {complete ? (
                                    <p className="cf-wtask__state cf-wtask__state--done">
                                        <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                                        Hecha
                                    </p>
                                ) : running && !ready && (
                                    <p className="cf-wtask__state">
                                        <i className="fa-solid fa-camera" aria-hidden="true"></i>
                                        {missing}
                                    </p>
                                )}

                                {fillMissing && !ready && (
                                    <p className="cf-wtask__hint">
                                        Añade las fotos pendientes. La tarea y el servicio conservan su estado.
                                    </p>
                                )}
                            </div>

                            {/* Una foto ya guardada de una tarea cerrada no se sustituye. */}
                            <div className="cf-wtask__shots">
                                <WorkerShot
                                    kind="before"
                                    photo={before}
                                    uploading={uploading === `${task.booking_task_id}-before`}
                                    canEdit={(running && !complete) || (fillMissing && !before)}
                                    onPick={(kind, file) => onPick(task, kind, file)}
                                    onDelete={onDeletePhoto}
                                    onReject={reject}
                                />
                                <WorkerShot
                                    kind="after"
                                    photo={after}
                                    uploading={uploading === `${task.booking_task_id}-after`}
                                    canEdit={(running && !complete) || (fillMissing && !after)}
                                    onPick={(kind, file) => onPick(task, kind, file)}
                                    onDelete={onDeletePhoto}
                                    onReject={reject}
                                />
                            </div>

                            {rejected?.taskId === task.booking_task_id && (
                                <p className="cf-wtask__warn" role="alert">
                                    <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                                    {rejected.text}
                                </p>
                            )}

                            {running && (
                                <div className="cf-wtask__foot">
                                    {complete ? (
                                        <button
                                            type="button"
                                            className="cf-wtask__undo"
                                            disabled={busy}
                                            onClick={() => onToggle(task, false)}
                                        >
                                            Desmarcar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="cf-dash-btn cf-dash-btn--sm"
                                            disabled={!ready || busy}
                                            onClick={() => onToggle(task, true)}
                                        >
                                            <i className="fa-solid fa-check" aria-hidden="true"></i>
                                            Marcar como hecha
                                        </button>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
