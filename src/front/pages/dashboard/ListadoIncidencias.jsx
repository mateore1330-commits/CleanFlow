/**
 * INCIDENCIAS · la pantalla del encargado (maqueta 06, PANEL-04).
 *
 * Todo lo que ha salido mal, lo cuente el trabajador (#18) o el cliente
 * al reclamar (#83). Se filtran por estado, por motivo y por quién las
 * abrió, y se cierran con una nota.
 *
 * Es el último eslabón del flujo: hasta ahora se registraban problemas
 * que nadie podía resolver. Al cerrar la reclamación de un cliente, su
 * reserva sale de "en revisión" sola.
 *
 * Está en el menú (Operativa) y también se llega desde la marca
 * "N incidencias" de una reserva, con ?booking=<id>: entonces enseña solo
 * las suyas, y la reserva sale como un filtro más de la barra, con su ✕.
 *
 * Arriba, las dos vistas en tarjetas (Abiertas y Resueltas); debajo, la
 * barra con los dos desplegables y las tarjetas de cada incidencia.
 *
 * Estilos: dashboard.css, sección 11 (cf-incidents y cf-incard) y las
 * piezas comunes de la sección 20.
 */

import "../../dashboard.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { getIncidents, resolveIncident } from "../../services/incidentService";
import { INCIDENTS_CHANGED } from "../../components/dashboard/incidents/IncidentCount";
import { IncidentCard } from "../../components/dashboard/incidents/IncidentCard";
import { BookingZoom } from "../../components/dashboard/bookings/BookingZoom";
import { ResolveForm } from "../../components/dashboard/incidents/ResolveForm";
import { PageHead } from "../../components/dashboard/PageHead";
import { ListViews } from "../../components/dashboard/list/ListViews";
import { ListBar, ListDrop } from "../../components/dashboard/list/ListBar";

// Las dos pestañas, con lo que dice cada una cuando se queda vacía.
const TABS = [
    { value: "false", label: "Abiertas", empty: "No hay ninguna incidencia sin resolver." },
    { value: "true", label: "Resueltas", empty: "Todavía no has cerrado ninguna." },
];

// Los dos desplegables preguntan cosas distintas.

// El motivo: de qué lado vino el problema. Mismas palabras que ve el
// trabajador al abrirla, para no tener dos vocabularios.
const TYPES = [
    { value: "client", label: "Por algo del cliente" },
    { value: "company", label: "Por algo nuestro" },
];

// Quién la escribió, que es otra pregunta: el cliente solo abre
// incidencias por algo nuestro, pero el trabajador abre de los dos
// motivos. Se filtra por aquí para ver quién espera respuesta.
const SOURCES = [
    { value: "worker", label: "El trabajador" },
    { value: "client", label: "El cliente" },
];

const SKELETON_ROWS = 3;

export const ListadoIncidencias = () => {
    const { store, dispatch } = useGlobalReducer();

    // Se entra aquí desde la marca de una reserva en Reservas, con
    // ?booking=<id>. Entonces la pantalla enseña solo las suyas, abiertas
    // y resueltas: al llegar desde una reserva se quiere ver todo lo que
    // le ha pasado, no la mitad.
    const [params, setParams] = useSearchParams();
    const booking = params.get("booking") || "";

    const [incidents, setIncidents] = useState([]);
    const [resolved, setResolved] = useState("false");
    const [type, setType] = useState("");
    const [source, setSource] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [zoomed, setZoomed] = useState(null);

    // Los contadores se piden aparte y sin los filtros de la barra:
    // tienen que decir cuántas hay, no cuántas quedan tras recortar. La
    // reserva sí entra, porque ahí la pantalla entera habla de una sola.
    const [counts, setCounts] = useState({ false: 0, true: 0 });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const result = await getIncidents({ resolved, type, source, booking }, store.token);

        // Sesión caducada: se cierra aquí y ProtectedRoutes hace el resto.
        if (result.status === 401) {
            setLoading(false);
            dispatch({ type: "LOGOUT" });
            return;
        }

        if (result.ok) setIncidents(result.data.incidents);
        else setError(result.data.message);

        setLoading(false);
    }, [resolved, type, source, booking, store.token, dispatch]);

    useEffect(() => { load(); }, [load]);

    // Los dos números del encabezado, en paralelo.
    const loadCounts = useCallback(async () => {
        const [open, closed] = await Promise.all([
            getIncidents({ resolved: "false", booking }, store.token, true),
            getIncidents({ resolved: "true", booking }, store.token, true),
        ]);

        setCounts({
            false: open.ok ? open.data.count : 0,
            true: closed.ok ? closed.data.count : 0,
        });
    }, [booking, store.token]);

    useEffect(() => { loadCounts(); }, [loadCounts]);


    // ---------- CERRAR UNA INCIDENCIA ----------

    // Cuál se está resolviendo (null = el diálogo cerrado) y si hay una
    // llamada en marcha.
    const [resolving, setResolving] = useState(null);
    const [saving, setSaving] = useState(false);

    /**
     * Guarda la nota y cierra la incidencia.
     *
     * Al resolver la reclamación de un cliente, su reserva sale de "en
     * revisión" sola: Booking.confirmation mira las que siguen abiertas,
     * así que aquí no hay que tocar la reserva.
     */
    const handleResolve = async (incident, resolution) => {
        setSaving(true);
        setError("");

        const result = await resolveIncident(incident.incident_id, resolution, store.token);

        setSaving(false);

        if (result.status === 401) {
            dispatch({ type: "LOGOUT" });
            return;
        }

        if (!result.ok) {
            setError(result.data.message);
            return;
        }

        // Se cierra el diálogo, se recarga la lista y se avisa al menú
        // para que el número baje sin esperar a su próximo repaso.
        setResolving(null);
        await load();
        await loadCounts();
        window.dispatchEvent(new Event(INCIDENTS_CHANGED));
    };

    // ---------- LOS DESPLEGABLES ----------

    // Cuál está abierto, o null. Se cierran al pulsar fuera y con Escape.
    const [open, setOpen] = useState(null);
    const bar = useRef(null);

    useEffect(() => {
        if (!open) return;

        const outside = (event) => {
            if (!bar.current?.contains(event.target)) setOpen(null);
        };
        const escape = (event) => {
            if (event.key === "Escape") setOpen(null);
        };

        document.addEventListener("mousedown", outside);
        document.addEventListener("keydown", escape);

        return () => {
            document.removeEventListener("mousedown", outside);
            document.removeEventListener("keydown", escape);
        };
    }, [open]);

    const toggle = (which) => () => setOpen(open === which ? null : which);

    /** Elige una opción (o la quita si ya estaba) y cierra el panel. */
    const pick = (setter, current) => (value) => {
        setter(current === value ? "" : value);
        setOpen(null);
    };

    const dropBooking = () => {
        params.delete("booking");
        setParams(params, { replace: true });
    };

    const filtering = Boolean(type || source);

    const views = [
        {
            value: "false", label: "Abiertas", count: counts.false, icon: "fa-triangle-exclamation",
            hint: counts.false > 0 ? "por resolver" : "ninguna pendiente",
            tone: counts.false > 0 ? "hot" : undefined,
        },
        { value: "true", label: "Resueltas", count: counts.true, hint: "con su nota", icon: "fa-circle-check" },
    ];

    return (
        <div className="cf-incidents">

            <PageHead
                title="Incidencias"
                subtitle="Lo que ha ido mal en un servicio. Resuélvelas con una nota; si la abrió el cliente, la verá."
            />

            {error && <p className="cf-dash-alert" role="alert">{error}</p>}

            <ListViews label="Vistas de incidencias" views={views} active={resolved} onChange={setResolved} />

            {/* ---------- FILTROS ----------
                Sin buscador: los dos desplegables y, si se llega desde una
                reserva, la reserva como un filtro más, con su ✕. */}
            <div className="cf-lpanel cf-incidents__bar">
                <ListBar
                    barRef={bar}
                    onClear={filtering || booking ? () => { setType(""); setSource(""); dropBooking(); } : null}
                >
                    <span className="cf-lbar__label">Filtrar por</span>

                    {booking && (
                        <ListDrop label="Reserva" value={`n.º ${booking}`} onClear={dropBooking} />
                    )}

                    <ListDrop
                        label="Motivo"
                        value={TYPES.find((option) => option.value === type)?.label.replace("Por algo ", "")}
                        open={open === "type"}
                        onToggle={toggle("type")}
                        onClear={() => setType("")}
                    >
                        <p className="cf-ldrop__head">Motivo</p>
                        {TYPES.map((option) => (
                            <button key={option.value} type="button" className="cf-ldrop__choice"
                                aria-pressed={type === option.value} onClick={() => pick(setType, type)(option.value)}>
                                {option.label}
                            </button>
                        ))}
                    </ListDrop>

                    <ListDrop
                        label="Quién la abrió"
                        value={SOURCES.find((option) => option.value === source)?.label.toLowerCase()}
                        open={open === "source"}
                        onToggle={toggle("source")}
                        onClear={() => setSource("")}
                    >
                        <p className="cf-ldrop__head">Quién la abrió</p>
                        {SOURCES.map((option) => (
                            <button key={option.value} type="button" className="cf-ldrop__choice"
                                aria-pressed={source === option.value} onClick={() => pick(setSource, source)(option.value)}>
                                {option.label}
                            </button>
                        ))}
                    </ListDrop>
                </ListBar>
            </div>

            {/* ---------- LISTA ---------- */}

            {loading ? (
                <ul className="cf-incidents__list">
                    {Array.from({ length: SKELETON_ROWS }, (_, row) => (
                        <li key={row} aria-hidden="true">
                            <div className="cf-incard">
                                <div className="cf-dash-skel cf-incard__skel-top"></div>
                                <div className="cf-dash-skel cf-incard__skel-ref"></div>
                                <div className="cf-dash-skel cf-incard__skel-text"></div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : incidents.length === 0 ? (
                <div className="cf-dash-state">
                    <span className="cf-dash-state__icon">
                        <i className="fa-solid fa-check" aria-hidden="true"></i>
                    </span>
                    <p className="cf-dash-state__title">
                        {filtering ? "Ninguna coincide" : "Nada por aquí"}
                    </p>
                    <p className="cf-dash-state__text">
                        {filtering
                            ? "Prueba con otro motivo o con otra persona."
                            : TABS.find((option) => option.value === resolved).empty}
                    </p>
                </div>
            ) : (
                <ul className="cf-incidents__list">
                    {incidents.map((incident) => (
                        <IncidentCard
                            key={incident.incident_id}
                            incident={incident}
                            busy={saving}
                            onResolve={setResolving}
                            onZoom={setZoomed}
                        />
                    ))}
                </ul>
            )}

            <BookingZoom photo={zoomed} onClose={() => setZoomed(null)} />

            <ResolveForm
                incident={resolving}
                saving={saving}
                onSubmit={handleResolve}
                onClose={() => setResolving(null)}
            />

        </div>
    );
};
