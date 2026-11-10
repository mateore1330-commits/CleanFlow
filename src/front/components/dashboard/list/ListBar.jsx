/**
 * LA BARRA DE UNA LISTA (maqueta 06, PANEL-04).
 *
 * Una sola franja: el buscador a la izquierda y, a la derecha, los
 * desplegables de filtro y «Limpiar». El filtro puesto se dice en su
 * propio botón («Estado: Pendientes») con una ✕ al lado para quitarlo;
 * así no hace falta otra fila de pastillas debajo.
 *
 *   <ListBar search={…} onClear={…}>  los desplegables  </ListBar>
 *   <ListDrop label value open onToggle onClear icon> el panel </ListDrop>
 *
 * Estilos: dashboard.css, sección 20 (cf-lbar, cf-ldrop).
 */

/** La barra entera. onClear solo si hay algo que limpiar. */
export const ListBar = ({ search, children, onClear, barRef }) => (
    <div className="cf-lbar" ref={barRef}>
        {search && (
            <label className="cf-lbar__search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <span className="sr-only">{search.label}</span>
                <input
                    type="search"
                    placeholder={search.placeholder}
                    value={search.value}
                    onChange={(event) => search.onChange(event.target.value)}
                />
            </label>
        )}

        {(children || onClear) && (
            <div className="cf-lbar__filters">
                {children}

                {onClear && (
                    <button type="button" className="cf-lbar__clear" onClick={onClear}>
                        Limpiar
                    </button>
                )}
            </div>
        )}
    </div>
);

/**
 * Un desplegable de filtro. Sin nada elegido, el botón con su nombre y la
 * flecha; con algo elegido, «Nombre: lo elegido» en color y su ✕.
 *
 * Son dos botones uno al lado del otro y no uno dentro de otro: un botón
 * no puede llevar otro dentro.
 *
 * Sin panel (sin children), lo elegido es una etiqueta fija con su ✕: un
 * filtro que viene de fuera, como la reserva de la que se llega.
 */
export const ListDrop = ({ label, value, open, onToggle, onClear, icon, children }) => (
    <div className="cf-ldrop">
        {value ? (
            <span className="cf-ldrop__set">
                {children ? (
                    <button type="button" className="cf-ldrop__btn cf-ldrop__btn--set" aria-expanded={open} onClick={onToggle}>
                        {icon && <i className={`fa-regular ${icon}`} aria-hidden="true"></i>}
                        {label}: {value}
                    </button>
                ) : (
                    <span className="cf-ldrop__btn cf-ldrop__btn--set">{label}: {value}</span>
                )}
                <button type="button" className="cf-ldrop__x" onClick={onClear} aria-label={`Quitar el filtro de ${label.toLowerCase()}`}>
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </span>
        ) : (
            <button type="button" className="cf-ldrop__btn" aria-expanded={open} onClick={onToggle}>
                {icon && <i className={`fa-regular ${icon}`} aria-hidden="true"></i>}
                {label}
                <i className="fa-solid fa-chevron-down cf-ldrop__chev" aria-hidden="true"></i>
            </button>
        )}

        {children && (
            <div className="cf-ldrop__pop" hidden={!open}>
                {children}
            </div>
        )}
    </div>
);
