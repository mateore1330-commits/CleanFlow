/**
 * CABECERA DE UNA PÁGINA DEL PANEL (maquetas 04, 05 y 06; PANEL-02).
 *
 * La misma en todas las páginas: título, una línea debajo y, a la derecha,
 * el botón de la acción principal (o una etiqueta de estado).
 *
 *   title:    el <h1> de la página (uno por página)
 *   subtitle: la línea de debajo
 *   eyebrow:  el antetítulo, en mayúsculas pequeñas (opcional)
 *   actions:  lo de la derecha: un botón, un enlace, una etiqueta…
 *   plain:    sin la banda de degradado, con el título en degradado. Para
 *             las páginas que ya abren con algo grande (el Inicio)
 *
 * Estilos: dashboard.css (cf-pagehead*).
 */

export const PageHead = ({ title, subtitle, eyebrow, actions, plain = false, titleId }) => (
    <header className={plain ? "cf-pagehead cf-pagehead--plain" : "cf-pagehead"}>
        <div className="cf-pagehead__text">
            {eyebrow && <p className="cf-pagehead__eyebrow">{eyebrow}</p>}
            <h1 className="cf-pagehead__title" id={titleId}>{title}</h1>
            {subtitle && <p className="cf-pagehead__subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="cf-pagehead__actions">{actions}</div>}
    </header>
);
