/**
 * MENÚ LATERAL DEL PANEL (maquetas 04, 05 y 06; PANEL-01).
 *
 * Pegado al borde y a toda la altura: la marca arriba, las secciones del
 * rol en medio y abajo quién ha entrado, Ajustes, Salir y «Plegar menú».
 *
 * Lo que NO debe cambiar al tocar el diseño: el array LINKS y el filtro
 * por rol, que hacen que cada usuario vea solo sus secciones.
 *
 * Escritorio y tablet: fijo, y se pliega a una barra de iconos con la
 * fila de abajo o con la tecla [. Móvil (menos de 768px): un cajón que
 * abre la hamburguesa de la barra de arriba (DashboardTopbar.jsx).
 *
 * Estilos: dashboard.css, bloques "MENÚ LATERAL" y "MENÚ EN MÓVIL".
 */

import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { Avatar } from "./Avatar"
import { Logo } from "../Logo"
import { Wordmark } from "../Wordmark"
import { AffectedCount } from "./absences/AffectedCount"
import { IncidentCount } from "./incidents/IncidentCount"
// Estilos del menú (cf-side__*).
import "../../dashboard.css"
import { loginPathForRole } from "../../authPaths";


// ----------------------------------------------------------------------
// LINKS (LA GUÍA A SEGUIR)
// ----------------------------------------------------------------------
// Único sitio que dice qué secciones hay y quién las ve: el equivalente al
// @role_required de routes.py. Para añadir una sección, añade aquí una línea;
// un enlace suelto en el JSX se saltaría el filtro y lo vería todo el mundo.
//
//   roles: ["manager"] / ["worker"] / ["client"]  -> solo ese rol
//   roles: ["client", "worker", "manager"]         -> común a todos
//   icon: "fa-users"     -> icono de Font Awesome, al lado del nombre
//   group: "Equipo"      -> título bajo el que se agrupa; sin él, va suelto
//   count: "affected"    -> el contador que lleva al lado (COUNTERS, abajo)
//   end: true (Inicio)   -> sin él, saldría activo en todo /dashboard
//
// Cliente y trabajador tienen menú plano, sin grupos: son dos o tres
// secciones. El encargado sí agrupa, porque son diez (maqueta 06).
// Ajustes y Salir no están aquí: van en el pie, con el usuario.
//
// El menú sale en el orden de esta lista, así que los enlaces de un mismo
// grupo van seguidos.

const LINKS = [
    // --- Comunes a todos los roles ---
    { to: "/dashboard", label: "Inicio", icon: "fa-house", roles: ["client", "worker", "manager"], end: true },

    // --- Solo CLIENT ---
    // «Reservar limpieza»: el catálogo y la reserva en una sola pantalla.
    { to: "/dashboard/book", label: "Reservar limpieza", icon: "fa-calendar-plus", roles: ["client"] },
    { to: "/dashboard/contracted-services", label: "Servicios contratados", icon: "fa-calendar-check", roles: ["client"] },

    // --- Solo WORKER ---
    { to: "/dashboard/tasks", label: "Mis servicios", icon: "fa-clipboard-check", roles: ["worker"] },

    // --- Solo MANAGER ---
    // Reservas cuenta las afectadas por una ausencia; Incidencias, las que
    // siguen abiertas. Cada una con su número: lo que hay que mirar se ve
    // en el menú antes de entrar.
    { to: "/dashboard/bookings", label: "Reservas", icon: "fa-calendar-check", group: "Operativa", roles: ["manager"], count: "affected" },
    { to: "/dashboard/incidents", label: "Incidencias", icon: "fa-triangle-exclamation", group: "Operativa", roles: ["manager"], count: "incidents" },
    { to: "/dashboard/messages", label: "Mensajes", icon: "fa-envelope", group: "Operativa", roles: ["manager"] },
    // Clientes va en Operativa y no en Equipo: "Equipo" es la gente de
    // dentro, y estos son los de fuera.
    { to: "/dashboard/clients", label: "Clientes", icon: "fa-address-book", group: "Operativa", roles: ["manager"] },
    { to: "/dashboard/workers", label: "Trabajadores", icon: "fa-users", group: "Equipo", roles: ["manager"] },
    { to: "/dashboard/shifts", label: "Turnos", icon: "fa-clock", group: "Equipo", roles: ["manager"] },
    { to: "/dashboard/applications", label: "Candidaturas", icon: "fa-envelope-open-text", group: "Equipo", roles: ["manager"] },
    { to: "/dashboard/services-catalog", label: "Servicios", icon: "fa-broom", group: "Catálogo", roles: ["manager"] },
    { to: "/dashboard/tasks-catalog", label: "Tareas", icon: "fa-list-check", group: "Catálogo", roles: ["manager"] },
]

// Los contadores del menú. Cada uno pide su número y lo mantiene al día él
// solo (cada 30 s, al volver a la pestaña y cuando otra pantalla avisa).
const COUNTERS = {
    affected: AffectedCount,
    incidents: IncidentCount,
}

// Mismo corte que el bloque "MENÚ EN MÓVIL" de dashboard.css.
const MOBILE_QUERY = "(max-width: 767.98px)"

// En qué panel estás, bajo el nombre.
const PANEL_LABEL = {
    client: "Panel del cliente",
    worker: "Panel del trabajador",
    manager: "Panel del encargado",
}

// ----------------------------------------------------------------------
// PREFERENCIAS DEL NAVEGADOR
// ----------------------------------------------------------------------
// Cómo se dejó el menú (plegado). Es una preferencia de este aparato y
// no del usuario: no tiene sentido llevarla al servidor. localStorage
// puede fallar (ventana privada, permisos) y no vale la pena romper el
// menú por eso: ante la duda, valores de partida.

const COLLAPSED_KEY = "cleanflow:sidebar-collapsed"

// Por debajo de 1024px el menú desplegado se come la página: si nunca se
// ha elegido nada en este navegador, arranca plegado.
const TABLET_QUERY = "(max-width: 1023.98px)"

const readCollapsed = () => {
    try {
        const saved = window.localStorage.getItem(COLLAPSED_KEY)

        // Sin nada guardado manda el tamaño de la pantalla; si el usuario ya
        // eligió, se respeta su elección.
        if (saved === null) return window.matchMedia(TABLET_QUERY).matches

        return saved === "true"
    } catch {
        return false
    }
}

// ¿Está escribiendo? Entonces la tecla [ es una letra, no un atajo.
const isTyping = (target) =>
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))


export const Sidebar = ({ open, onClose, toggleRef }) => {

    // ----------------------------------------------------------------------
    // SESIÓN Y SECCIONES
    // ----------------------------------------------------------------------

    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const role = store.user?.role

    // Solo los enlaces del rol actual. Sin rol (sesión sin cargar o datos
    // corruptos) no sale nada: ante la duda, no enseñar de más.
    const visibleLinks = LINKS.filter(link => link.roles.includes(role))

    // Nombre completo. Con filter: si a una sesión guardada antes de la #13
    // le falta el apellido, sale solo el nombre.
    const fullName = [store.user?.name, store.user?.last_name].filter(Boolean).join(" ")

    // ----------------------------------------------------------------------
    // PLEGAR EL MENÚ (ESCRITORIO Y TABLET)
    // ----------------------------------------------------------------------
    // Plegado se queda en una barra de iconos: se sigue viendo dónde estás y
    // se llega a cualquier sección en un clic. En móvil no actúa: allí el
    // menú es un cajón que se abre y se cierra entero.

    // La función va sin paréntesis: así localStorage se lee una vez, al
    // montar, y no en cada render.
    const [collapsed, setCollapsed] = useState(readCollapsed)

    useEffect(() => {
        try {
            window.localStorage.setItem(COLLAPSED_KEY, String(collapsed))
        } catch {
            // Sin guardado: el menú funciona igual, solo que no se recuerda.
        }
    }, [collapsed])

    // En móvil el menú es un cajón entero, así que plegarlo a iconos no
    // tiene sentido. Va en un estado para que al girar el teléfono el menú
    // se vuelva a pintar con el valor nuevo.
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(MOBILE_QUERY).matches
    )

    // Si la pantalla crece a tablet con el cajón abierto, se cierra: allí
    // el menú ya se ve fijo.
    useEffect(() => {
        const mobile = window.matchMedia(MOBILE_QUERY)

        const handleChange = (event) => {
            setIsMobile(event.matches)
            if (!event.matches) onClose()
        }

        mobile.addEventListener("change", handleChange)
        return () => mobile.removeEventListener("change", handleChange)
    }, [onClose])

    // La tecla [ pliega y despliega, como en la maqueta. Nunca mientras se
    // escribe en un campo, ni con Ctrl, Cmd o Alt (son de otros atajos).
    useEffect(() => {
        if (isMobile) return

        const handleKeyDown = (event) => {
            if (event.key !== "[" || event.ctrlKey || event.metaKey || event.altKey) return
            if (isTyping(event.target)) return
            event.preventDefault()
            setCollapsed(value => !value)
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isMobile])

    // ----------------------------------------------------------------------
    // CAJÓN DEL MÓVIL
    // ----------------------------------------------------------------------
    // `open` llega de DashboardLayout: lo abre la hamburguesa de la barra de
    // arriba y lo cierra cualquier cosa de aquí (la ✕, una sección, el fondo).

    const closeRef = useRef(null)
    const wasOpen = useRef(open)

    // El foco sigue al cajón: al abrir va a la ✕ y al cerrar vuelve a la
    // hamburguesa. Solo cuando el cajón cambia de verdad: al cargar la
    // página no se mueve, para no robárselo (tampoco cuando React, en
    // desarrollo, monta los efectos dos veces).
    useEffect(() => {
        if (wasOpen.current === open) return
        wasOpen.current = open

        if (open) {
            closeRef.current?.focus()
        } else if (window.matchMedia(MOBILE_QUERY).matches) {
            toggleRef?.current?.focus()
        }
    }, [open, toggleRef])

    // Con el cajón abierto: Escape lo cierra y la página de detrás no hace
    // scroll. El return deshace las dos cosas al cerrar.
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleKeyDown)
        document.body.style.overflow = "hidden"

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = ""
        }
    }, [open, onClose])

    // ----------------------------------------------------------------------
    // CIERRE DE SESIÓN
    // ----------------------------------------------------------------------
    // El ORDEN importa: primero navegar, luego LOGOUT. Al revés, ProtectedRoutes
    // vería el token borrado y su <Navigate> guardaría la ruta privada, así que
    // el próximo login volvería allí en vez de a /dashboard. Y el rol, que
    // decide la puerta, también se lee antes: después el store está vacío.
    // state: null (sin ruta de origen) y replace ("atrás" no vuelve aquí).
    //
    // intentional: aquí el usuario se va porque quiere, así que el login no
    // debe recibirlo con el aviso de sesión caducada.
    const handleLogout = () => {
        navigate(loginPathForRole(store.user?.role), { replace: true, state: null })
        dispatch({ type: "LOGOUT", payload: { intentional: true } })
    }

    // ----------------------------------------------------------------------
    // PANTALLA
    // ----------------------------------------------------------------------
    // Tres cosas que no se pueden perder al tocar esto:
    //   1. Recorrer `visibleLinks`, nunca LINKS.
    //   2. Usar <NavLink> (no <a>): navega sin recargar y pone aria-current
    //      en la página actual, que es de lo que tira el CSS.
    //   3. Mantener la lógica de cerrar sesión.

    // Título del grupo, solo cuando cambia respecto al enlace anterior.
    // Plegado se queda en una raya fina (CSS).
    const groupTitle = (link, index) => {
        const previous = visibleLinks[index - 1]

        if (!link.group || link.group === previous?.group) return null

        return <p className="cf-side__eyebrow"><span>{link.group}</span></p>
    }

    // El modo icono solo fuera del móvil: dentro del cajón, los avisos
    // emergentes no pintan nada. `collapsed` se guarda igual, así que quien
    // pliegue el menú en el ordenador se lo encuentra plegado al volver.
    const rail = collapsed && !isMobile

    // Los avisos de la barra de iconos van fijos en la pantalla (para que no
    // los corte el scroll de la lista): aquí se les dice a qué altura salir,
    // la del icono por el que se pasa o al que llega el tabulador.
    const placeTip = (event) => {
        if (!rail) return
        const item = event.target.closest?.(".cf-side__link, .cf-side__collapse, .cf-side__brand, .cf-side__user")
        if (!item) return
        const box = item.getBoundingClientRect()
        item.style.setProperty("--tip-y", `${box.top + box.height / 2}px`)
    }

    const clasesDelMenu = [
        "cf-side",
        rail ? "cf-side--rail" : "",
        open ? "cf-side--open" : "",
    ].filter(Boolean).join(" ")

    return (
        <>
            {/* Solo en móvil: el fondo oscuro. Pulsarlo cierra el cajón. */}
            <div className="cf-side-backdrop" hidden={!open} onClick={onClose} />

            <aside
                id="dashboard-sidebar"
                className={clasesDelMenu}
                aria-label="Menú del panel"
                onPointerOver={placeTip}
                onFocus={placeTip}
            >
                {/* Marca: el isotipo y el logotipo de la web. */}
                <Link to="/dashboard" className="cf-side__brand" onClick={onClose} aria-label="CleanFlow, inicio del panel">
                    <span className="cf-side__logo">
                        <Logo size={30} />
                    </span>
                    <Wordmark className="cf-side__name" dark />
                    <span className="cf-side__tip">Inicio</span>
                </Link>

                {/* Solo en móvil: cerrar el cajón. */}
                <button
                    ref={closeRef}
                    type="button"
                    className="cf-side-close"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>

                <nav className="cf-side__nav" aria-label="Secciones">
                    {/* onClick={onClose}: en móvil, elegir una sección cierra el cajón. */}
                    {visibleLinks.map((link, index) => {
                        const Count = COUNTERS[link.count]

                        return (
                            <div key={link.to}>
                                {groupTitle(link, index)}

                                <NavLink to={link.to} end={link.end} className="cf-side__link" onClick={onClose}>
                                    <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
                                    <span className="cf-side__label">{link.label}</span>
                                    {Count && <Count token={store.token} pathname={pathname} />}
                                    {/* Plegado, el nombre sale al pasar por encima o con el tabulador. */}
                                    <span className="cf-side__tip" aria-hidden="true">{link.label}</span>
                                </NavLink>
                            </div>
                        )
                    })}
                </nav>

                {/* EL PIE: quién ha entrado y en qué panel, sus ajustes, salir y
                    plegar. El avatar y el nombre cambian solos al guardar en
                    Ajustes, porque esas pantallas despachan SET_USER. */}
                <div className="cf-side__foot">
                    <div className="cf-side__user">
                        <Avatar user={store.user} size="sm" tone="accent" />

                        {/* Cada línea se recorta: el bloque mide igual con
                            cualquier nombre. */}
                        <div className="cf-side__who">
                            <span className="cf-side__username">{fullName}</span>
                            <span className="cf-side__panel">{PANEL_LABEL[role]}</span>
                        </div>

                        <span className="cf-side__tip" aria-hidden="true">{fullName}</span>
                    </div>

                    <NavLink to="/dashboard/profile" className="cf-side__link" onClick={onClose}>
                        <i className="fa-solid fa-gear" aria-hidden="true" />
                        <span className="cf-side__label">Ajustes</span>
                        <span className="cf-side__tip" aria-hidden="true">Ajustes</span>
                    </NavLink>

                    {/* <button> y no <a href="#">: cerrar sesión es una acción, no una navegación. */}
                    <button
                        type="button"
                        className="cf-side__link cf-side__link--exit"
                        onClick={handleLogout}
                    >
                        <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                        <span className="cf-side__label">Salir</span>
                        <span className="cf-side__tip" aria-hidden="true">Cerrar sesión</span>
                    </button>

                    {/* Plegar y desplegar, siempre a la vista. aria-expanded dice
                        si el menú está abierto; plegado, el aviso dice qué hace
                        y su atajo. En móvil no sale (el cajón se cierra entero). */}
                    <button
                        type="button"
                        className="cf-side__collapse"
                        onClick={() => setCollapsed(value => !value)}
                        aria-controls="dashboard-sidebar"
                        aria-expanded={!collapsed}
                        aria-keyshortcuts="["
                        aria-label={collapsed ? "Desplegar menú" : "Plegar menú"}
                    >
                        <i className="fa-solid fa-angles-left" aria-hidden="true" />
                        <span className="cf-side__label">Plegar menú</span>
                        <kbd className="cf-side__kbd" aria-hidden="true">[</kbd>
                        <span className="cf-side__tip" aria-hidden="true">Desplegar menú <kbd>[</kbd></span>
                    </button>
                </div>
            </aside>
        </>
    )
};
