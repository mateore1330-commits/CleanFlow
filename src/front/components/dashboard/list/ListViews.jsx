/**
 * LAS VISTAS DE UNA LISTA, EN TARJETAS (maqueta 06, PANEL-04).
 *
 * «Todas 128 · Afectadas 3 · Con incidencia 2»: cada vista es una tarjeta
 * que se pulsa, con su número y lo que hay que hacer. La elegida, en
 * oscuro. Las que piden algo van en ámbar (warn) o en rojo (hot), con una
 * flecha: lo urgente se ve antes de leer nada.
 *
 * Sustituyen a las pestañas subrayadas en las listas del encargado.
 * aria-pressed y no role="tab": son filtros de una misma lista.
 *
 *   views: [{ value, label, count, hint, icon, tone? }]
 *   active: el value elegido · onChange(value)
 *
 * Estilos: dashboard.css, sección 20 (cf-views, cf-view).
 */

export const ListViews = ({ label, views, active, onChange }) => (
    <div className="cf-views" role="group" aria-label={label}>
        {views.map((view) => (
            <button
                key={view.value}
                type="button"
                className={`cf-view${view.tone ? ` cf-view--${view.tone}` : ""}`}
                aria-pressed={active === view.value}
                onClick={() => onChange(view.value)}
            >
                <span className="cf-view__icon" aria-hidden="true">
                    <i className={`fa-solid ${view.icon}`}></i>
                </span>

                <span className="cf-view__text">
                    <small>{view.label}</small>
                    <b>{view.count}</b>
                    <span>{view.hint}</span>
                </span>

                {view.tone && <i className="fa-solid fa-arrow-right cf-view__go" aria-hidden="true"></i>}
            </button>
        ))}
    </div>
);
