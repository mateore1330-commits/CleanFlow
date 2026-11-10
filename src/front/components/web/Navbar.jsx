/**
 * NAVBAR DE LA WEB (maqueta 02, WEB-01).
 *
 * Una sola fila: la marca, la navegación por secciones, un único
 * «Acceder» con las dos áreas y el botón de reservar. En móvil, todo se
 * pliega detrás de la hamburguesa.
 *
 * Estilos: clases `cf-nav*` y `cf-access*` en web.css.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";
import { Wordmark } from "../Wordmark";
import { useActiveSection } from "../../hooks/useActiveSection";


// Las dos puertas de acceso, dentro del menú «Acceder». Antes eran dos
// botones en una barra aparte (maqueta 02: una sola entrada, menos ruido).
const ACCESS_LINKS = [
    { label: "Área clientes", hint: "Tus reservas y tus datos", to: "/login-clients", icon: "fa-user" },
    { label: "Área empleados", hint: "Servicios, turnos y ausencias", to: "/login-workers", icon: "fa-briefcase" },
]


// Navegación principal.
//
//   to       -> adónde navega al pulsarlo.
//   section  -> qué sección de la landing lo enciende (resaltado).
//
// ¿Lleva a una SECCIÓN de la landing? Va con almohadilla ("/#about-us") y
// ese id tiene que existir en una <section> de Home.jsx. ¿A una PÁGINA
// propia? Sin almohadilla y con section: null (se resalta por la URL).
// "Inicio" navega a "/" sin ancla, pero se enciende con la portada.
const NAV_LINKS = [
    { label: "Inicio",          to: "/",          section: "hero" },
    { label: "Servicios",       to: "/#services", section: "services" },
    { label: "Sobre CleanFlow", to: "/#about-us", section: "about-us" },
    { label: "Contacto",        to: "/#contact",  section: "contact" },
]


// El botón de acción va aparte: no es un item de navegación. Apunta a
// Reservar, que es ruta protegida; sin sesión, ProtectedRoutes manda al
// login y después vuelve aquí (WEB-15).
const CTA = { label: "Reservar", to: "/dashboard/book" }


// Los ids a vigilar salen de los propios enlaces.
const SECTION_IDS = NAV_LINKS.map((link) => link.section).filter(Boolean);


export const Navbar = () => {

    const { pathname, hash } = useLocation();
    const activeSection = useActiveSection(SECTION_IDS);

    // El menú de móvil y el desplegable de «Acceder».
    const [menuOpen, setMenuOpen] = useState(false);
    const [accessOpen, setAccessOpen] = useState(false);
    // Para el borde de abajo al bajar por la página (como en la maqueta).
    const [scrolled, setScrolled] = useState(false);

    const accessRef = useRef(null);
    const accessButtonRef = useRef(null);


    // Al navegar se cierra todo: así también al elegir un enlace de dentro.
    useEffect(() => {
        setMenuOpen(false);
        setAccessOpen(false);
    }, [pathname, hash]);


    // Escape cierra lo que esté abierto. Si era «Acceder», el foco vuelve a
    // su botón: quien usa teclado no se queda perdido en la página.
    useEffect(() => {
        if (!menuOpen && !accessOpen) return;

        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            if (accessOpen) {
                setAccessOpen(false);
                accessButtonRef.current?.focus();
            } else {
                setMenuOpen(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [menuOpen, accessOpen]);


    // Un clic fuera de «Acceder» lo cierra.
    useEffect(() => {
        if (!accessOpen) return;

        const onPointerDown = (e) => {
            if (!accessRef.current?.contains(e.target)) setAccessOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [accessOpen]);


    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);


    // Se calcula a mano porque <NavLink> ignora el "#": marcaría a la vez
    // los cuatro, que apuntan todos a "/".
    const isActive = (link) => {
        if (link.section) return pathname === "/" && activeSection === link.section;
        return pathname === link.to;
    };


    return (
        <header className={scrolled ? "cf-header is-scrolled" : "cf-header"}>
            <nav className="cf-container cf-navbar" aria-label="Navegación principal">

                <Link to="/" className="cf-brand" aria-label="CleanFlow, ir al inicio">
                    <Logo size={32} />
                    <Wordmark className="cf-brand__name" />
                </Link>

                {/* Botón de menú, solo visible en móvil. */}
                <button
                    type="button"
                    className="cf-nav-toggle"
                    aria-controls="main-menu"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} aria-hidden="true"></i>
                </button>

                <div id="main-menu" className={menuOpen ? "cf-nav is-open" : "cf-nav"}>
                    <ul className="cf-nav__links">
                        {NAV_LINKS.map((link) => (
                            <li key={link.to}>
                                {/* La clase para el CSS y aria-current para
                                    quien usa lector de pantalla. */}
                                <Link
                                    to={link.to}
                                    className={isActive(link) ? "cf-nav__link is-active" : "cf-nav__link"}
                                    aria-current={isActive(link) ? "page" : undefined}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="cf-nav__right">
                        {/* ---------- ACCEDER ----------
                            Un botón que abre una lista de dos enlaces. Con
                            teclado: Intro o espacio lo abren, Tab recorre
                            los enlaces y Escape lo cierra. */}
                        {/* onBlur: si el foco sale del menú (Tab tras el último
                            enlace), se cierra solo. relatedTarget es adónde va. */}
                        <div
                            className="cf-access"
                            ref={accessRef}
                            onBlur={(e) => {
                                if (!accessRef.current?.contains(e.relatedTarget)) setAccessOpen(false);
                            }}
                        >
                            <button
                                type="button"
                                ref={accessButtonRef}
                                className="cf-access__button"
                                aria-expanded={accessOpen}
                                aria-controls="access-menu"
                                onClick={() => setAccessOpen((open) => !open)}
                            >
                                <i className="fa-solid fa-circle-user" aria-hidden="true"></i>
                                Acceder
                                <i className="fa-solid fa-chevron-down cf-access__chevron" aria-hidden="true"></i>
                            </button>

                            <ul id="access-menu" className={accessOpen ? "cf-access__menu is-open" : "cf-access__menu"}>
                                {ACCESS_LINKS.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="cf-access__link">
                                            <i className={`fa-solid ${link.icon}`} aria-hidden="true"></i>
                                            <span>
                                                <b>{link.label}</b>
                                                <span>{link.hint}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link to={CTA.to} className="cf-btn cf-btn--sm cf-nav__cta">
                            {CTA.label}
                        </Link>
                    </div>
                </div>

            </nav>
        </header>
    )
}
