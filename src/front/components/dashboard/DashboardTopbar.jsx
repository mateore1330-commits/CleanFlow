/**
 * BARRA DE ARRIBA DEL PANEL (maquetas 04, 05 y 06; PANEL-01).
 *
 * Fija al bajar por la página. En escritorio y tablet lleva la miga de pan
 * («Panel · Reservas») y, a la derecha, el botón de Ajustes. En móvil, la
 * miga de pan no cabe: en su sitio van la hamburguesa (a la izquierda) y la
 * marca.
 *
 * El nombre de cada página sale de routes.jsx (handle.crumb), así que
 * también lo tienen las páginas que no están en el menú: el detalle de una
 * reserva, Editar trabajador, Ajustes…
 *
 * La hamburguesa abre el cajón del menú (Sidebar.jsx). El estado vive en
 * DashboardLayout, que es quien tiene a los dos.
 *
 * Estilos: dashboard.css (cf-topbar*).
 */

import { Fragment } from "react";
import { Link, useMatches } from "react-router-dom";
import { Logo } from "../Logo";
import { Wordmark } from "../Wordmark";


// Los nombres de la página actual, de fuera a dentro. Cada ruta puede
// traer uno ("Reservas"), una lista o un { label, to } que se pinta como
// enlace (para volver a la lista desde un detalle).
const useCrumbs = () =>
    useMatches()
        .flatMap((match) => [].concat(match.handle?.crumb ?? []))
        .map((crumb) => (typeof crumb === "string" ? { label: crumb } : crumb));


export const DashboardTopbar = ({ menuOpen, onOpenMenu, toggleRef }) => {
    const crumbs = useCrumbs();

    return (
        <header className="cf-topbar">
            {/* Solo en móvil. aria-controls dice QUÉ abre; aria-expanded, si está abierto. */}
            <button
                ref={toggleRef}
                type="button"
                className="cf-topbar__btn cf-topbar__burger"
                onClick={onOpenMenu}
                aria-controls="dashboard-sidebar"
                aria-expanded={menuOpen}
                aria-label="Abrir menú"
            >
                <i className="fa-solid fa-bars" aria-hidden="true" />
            </button>

            <Link to="/dashboard" className="cf-topbar__brand" aria-label="CleanFlow, inicio del panel">
                <Logo size={26} />
                <Wordmark />
            </Link>

            {/* La miga de pan: dónde estás. La última es la página actual. */}
            <nav className="cf-topbar__crumbs" aria-label="Estás en">
                <ol>
                    <li>
                        <Link to="/dashboard">Panel</Link>
                    </li>
                    {crumbs.map((crumb, index) => {
                        const last = index === crumbs.length - 1;
                        return (
                            <Fragment key={`${crumb.label}-${index}`}>
                                <li aria-hidden="true" className="cf-topbar__sep">·</li>
                                <li>
                                    {last ? (
                                        <b aria-current="page">{crumb.label}</b>
                                    ) : crumb.to ? (
                                        <Link to={crumb.to}>{crumb.label}</Link>
                                    ) : (
                                        crumb.label
                                    )}
                                </li>
                            </Fragment>
                        );
                    })}
                </ol>
            </nav>

            <div className="cf-topbar__right">
                <Link to="/dashboard/profile" className="cf-topbar__btn" aria-label="Ajustes de la cuenta" title="Ajustes">
                    <i className="fa-solid fa-user" aria-hidden="true" />
                </Link>
            </div>
        </header>
    );
};
