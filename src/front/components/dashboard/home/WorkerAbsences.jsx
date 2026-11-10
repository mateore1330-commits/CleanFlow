/**
 * TUS AUSENCIAS (maqueta 05, PANEL-03).
 *
 * Las próximas que ha registrado el encargado y el formulario para pedir
 * una. La petición le llega a él, que decide si la registra; ver en qué
 * estado está queda para más adelante (PENDIENTES.md).
 *
 * Estilos: dashboard.css, sección 16 (cf-wabs).
 */

import { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { apiRequest } from "../../../services/apiClient";
import { formatDay } from "../../../services/absenceService";

const reasons = { vacaciones: "Vacaciones", baja: "Baja", otro: "Otra ausencia" };
const icons = { vacaciones: "fa-umbrella-beach", baja: "fa-kit-medical", otro: "fa-calendar-minus" };

export const WorkerAbsences = ({ today }) => {
    const { store, dispatch } = useGlobalReducer();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [notice, setNotice] = useState("");
    const sending = useRef(false);
    const [form, setForm] = useState({ starts_on: today, ends_on: "", reason: "vacaciones", notes: "" });

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        apiRequest("/api/workers/me/absences", { token: store.token }).then((result) => {
            if (!active) return;
            if (result.status === 401) dispatch({ type: "LOGOUT" });
            else if (result.ok) setRows(result.data.absences);
            else setError(result.data.message);
            setLoading(false);
        });
        return () => { active = false; };
    }, [store.token, dispatch, retry, today]);

    const submit = async (event) => {
        event.preventDefault();
        if (sending.current) return;
        sending.current = true;
        setSaving(true);
        setFormError("");
        const result = await apiRequest("/api/workers/me/absence-requests", {
            token: store.token, method: "POST", body: { ...form, ends_on: form.ends_on || null },
        });
        sending.current = false;
        setSaving(false);
        if (result.status === 401) dispatch({ type: "LOGOUT" });
        else if (!result.ok) setFormError(result.data.message);
        else {
            setOpen(false);
            setNotice(result.data.message);
            setForm({ starts_on: today, ends_on: "", reason: "vacaciones", notes: "" });
        }
    };

    const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    return (
        <section className="cf-worker-home__card" aria-labelledby="absences-title">
            <div className="cf-worker-home__head">
                <div>
                    <p className="cf-dash-eyebrow">Vacaciones y bajas</p>
                    <h2 id="absences-title">Tus ausencias</h2>
                </div>
            </div>

            {loading ? <p className="cf-worker-home__muted" role="status">Cargando ausencias…</p> : error ? <div role="alert">
                <p className="cf-worker-home__muted">{error}</p>
                <button className="cf-dash-btn cf-dash-btn--ghost" onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
            </div> : rows.length === 0 ? <p className="cf-worker-home__muted">No tienes próximas ausencias registradas.</p>
                : <ul className="cf-wabs">{rows.map((row) => <li key={row.absence_id}>
                    <i className={`fa-solid ${icons[row.reason] || icons.otro}`} aria-hidden="true"></i>
                    <span>
                        <b>{reasons[row.reason] || "Ausencia"}</b>
                        <small>{formatDay(row.starts_on)} – {formatDay(row.ends_on)}</small>
                    </span>
                </li>)}</ul>}

            {notice && <p className="cf-wabs__notice" role="status">{notice}</p>}

            <button type="button" className="cf-dash-btn cf-dash-btn--ghost cf-wabs__toggle" aria-expanded={open}
                aria-controls="absence-request" disabled={saving} onClick={() => { setOpen(!open); setNotice(""); }}>
                {!open && <i className="fa-solid fa-plus" aria-hidden="true"></i>}
                {open ? "Cancelar solicitud" : "Pedir una ausencia"}
            </button>

            {open && <form id="absence-request" className="cf-wabs__form" onSubmit={submit}>
                <p className="cf-worker-home__muted">Le llega a tu encargado, que decide si la registra.</p>
                <div className="cf-wabs__two">
                    <label className="cf-dash-field">
                        <span className="cf-dash-field__label">Desde</span>
                        <input className="cf-dash-input" type="date" name="starts_on" value={form.starts_on} onChange={change} required disabled={saving} />
                    </label>
                    <label className="cf-dash-field">
                        <span className="cf-dash-field__label">Hasta <span className="cf-wabs__opt">(opcional)</span></span>
                        <input className="cf-dash-input" type="date" name="ends_on" min={form.starts_on} value={form.ends_on} onChange={change} disabled={saving} />
                    </label>
                </div>
                <label className="cf-dash-field">
                    <span className="cf-dash-field__label">Motivo</span>
                    <select className="cf-dash-input" name="reason" value={form.reason} onChange={change} disabled={saving}>
                        {Object.entries(reasons).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
                <label className="cf-dash-field">
                    <span className="cf-dash-field__label">Comentario <span className="cf-wabs__opt">(opcional)</span></span>
                    <textarea className="cf-dash-input" name="notes" maxLength={2000} value={form.notes} onChange={change} disabled={saving}
                        placeholder="Algo que deba saber tu encargado" />
                </label>
                {formError && <p className="cf-dash-alert" role="alert">{formError}</p>}
                <button className="cf-dash-btn" disabled={saving}>{saving ? "Enviando…" : "Enviar al encargado"}</button>
            </form>}
        </section>
    );
};
