/**
 * CONTACTO Y DÓNDE ESTAMOS (maqueta 02, WEB-01).
 *
 * «Contacto» y «Dónde estamos» son ahora una sola sección: a la izquierda
 * el formulario, a la derecha los datos (data/company.js) y el mapa real.
 *
 * El formulario guarda el mensaje en la base de datos (POST
 * /api/contact-messages) y el encargado lo lee en su panel: no se envía
 * por correo.
 */

import { useState } from "react";
import { sendContactMessage } from "../../../services/contactService";
import { COMPANY } from "../../../data/company";
import { OfficeMap } from "../../../components/OfficeMap";

const INITIAL_FORM_DATA = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactSection = () => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const emailIsValid = EMAIL_PATTERN.test(formData.email);

    const requiredFieldsAreComplete =
        formData.name.trim() &&
        formData.email.trim() &&
        formData.subject.trim() &&
        formData.message.trim();

    const formIsValid = requiredFieldsAreComplete && emailIsValid;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        if (!formIsValid) {
            setError("Completa los campos obligatorios y revisa el correo electrónico.");
            return;
        }

        setLoading(true);

        try {
            const { ok, data } = await sendContactMessage(formData);

            if (!ok) {
                setError(
                    data?.message || "No se pudo enviar el mensaje. Inténtalo de nuevo."
                );
                return;
            }

            setFormData(INITIAL_FORM_DATA);
            setSuccess("Hemos recibido tu mensaje. Te responderemos lo antes posible.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="cf-home-section cf-home-contact">
            <div className="cf-container">
                <header className="cf-home-head">
                    <div>
                        <p className="cf-eyebrow">Contacto</p>
                        <h2 className="cf-home-title">Hablemos</h2>
                        <p className="cf-home-lede">
                            ¿Un presupuesto para tu oficina o una duda concreta? Te respondemos rápido.
                        </p>
                    </div>
                </header>

                <div className="cf-home-contact__grid">
                    <form className="cf-card cf-home-contact__form" onSubmit={handleSubmit} noValidate>
                        {error && <p className="cf-alert" role="alert">{error}</p>}
                        {success && <p className="cf-alert cf-alert--success" role="status">{success}</p>}

                        <div className="cf-home-contact__fields">
                            <div className="cf-field">
                                <label htmlFor="contact-name">Nombre</label>
                                <input id="contact-name" className="cf-input" type="text" name="name"
                                    value={formData.name} onChange={handleChange} autoComplete="name"
                                    placeholder="Tu nombre" required />
                            </div>

                            <div className="cf-field">
                                <label htmlFor="contact-email">Correo electrónico</label>
                                <input id="contact-email" className="cf-input" type="email" name="email"
                                    value={formData.email} onChange={handleChange} autoComplete="email"
                                    placeholder="tu@correo.com" required />
                            </div>

                            <div className="cf-field">
                                <label htmlFor="contact-phone">Teléfono <span>(opcional)</span></label>
                                <input id="contact-phone" className="cf-input" type="tel" name="phone"
                                    value={formData.phone} onChange={handleChange} autoComplete="tel"
                                    placeholder="600 000 000" />
                            </div>

                            <div className="cf-field">
                                <label htmlFor="contact-subject">Asunto</label>
                                <input id="contact-subject" className="cf-input" type="text" name="subject"
                                    value={formData.subject} onChange={handleChange}
                                    placeholder="Presupuesto para oficina" required />
                            </div>

                            <div className="cf-field cf-field--full">
                                <label htmlFor="contact-message">Mensaje</label>
                                <textarea id="contact-message" className="cf-input" name="message"
                                    value={formData.message} onChange={handleChange} rows="5"
                                    placeholder="Cuéntanos qué necesitas" required />
                            </div>
                        </div>

                        {/* Trampa para bots: invisible para las personas, y si
                            llega rellena, el servidor descarta el mensaje. */}
                        <div className="sr-only" aria-hidden="true">
                            <label htmlFor="contact-website">Sitio web</label>
                            <input id="contact-website" type="text" name="website" value={formData.website}
                                onChange={handleChange} tabIndex="-1" autoComplete="off" />
                        </div>

                        <div className="cf-home-contact__foot">
                            <small>Usaremos tus datos solo para responderte.</small>
                            <button className="cf-btn" type="submit" disabled={!formIsValid || loading}>
                                {loading ? "Enviando…" : "Enviar mensaje"}
                            </button>
                        </div>
                    </form>

                    <div className="cf-card cf-home-contact__info">
                        <ul className="cf-home-contact__rows">
                            <li>
                                <i className="fa-solid fa-phone" aria-hidden="true"></i>
                                <span>
                                    <b>Teléfono</b>
                                    <a href={`tel:${COMPANY.phoneLink}`}>{COMPANY.phone}</a>
                                </span>
                            </li>
                            <li>
                                <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                                <span>
                                    <b>Correo</b>
                                    <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                                </span>
                            </li>
                            <li>
                                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                                <span>
                                    <b>Horario</b>
                                    {COMPANY.schedule.map((line) => <span key={line}>{line}</span>)}
                                </span>
                            </li>
                            <li>
                                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                                <span>
                                    <b>Oficina</b>
                                    <span>{COMPANY.street} · {COMPANY.city}</span>
                                </span>
                            </li>
                        </ul>

                        <OfficeMap address={`${COMPANY.street}, ${COMPANY.city}`} />
                    </div>
                </div>
            </div>
        </section>
    );
};
