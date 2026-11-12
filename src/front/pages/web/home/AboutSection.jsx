/**
 * SOBRE CLEANFLOW (maqueta 02, WEB-01).
 *
 * La foto del equipo, la historia, los cuatro valores y dos salidas:
 * hablar con nosotros o trabajar con nosotros.
 *
 * Sin cifras inventadas ("5+ años", "500+ clientes"...): si no se pueden
 * demostrar, restan confianza en vez de sumarla.
 *
 * ⚠️ La foto lleva los uniformes de la marca antigua (oliva): hay que
 * hacer otra con los nuevos.
 */

import { Link } from "react-router-dom";
import team1536 from "../../../assets/img/equipo-cleanflow-1536.webp";
import team768 from "../../../assets/img/equipo-cleanflow-768.webp";


const VALUES = [
    { icon: "fa-shield-halved", title: "Confianza", text: "Profesionales verificados." },
    { icon: "fa-award", title: "Calidad", text: "Productos y técnicas de primera." },
    { icon: "fa-handshake", title: "Compromiso", text: "Cumplimos lo que prometemos." },
    { icon: "fa-heart", title: "Cercanía", text: "Trato amable y personal." },
];


export const AboutSection = () => (
    <section id="about-us" className="cf-home-section cf-home-about">
        <div className="cf-container cf-home-about__grid">
            <div className="cf-home-about__photo">
                <img
                    src={team1536}
                    srcSet={`${team768} 768w, ${team1536} 1536w`}
                    sizes="(max-width: 860px) 100vw, 50vw"
                    alt="El equipo de CleanFlow"
                    width="1536"
                    height="1024"
                    loading="lazy"
                />
                <p className="cf-home-about__badge">
                    <i className="fa-solid fa-people-group" aria-hidden="true"></i>
                    Un equipo propio, formado y con contrato.
                </p>
            </div>

            <div className="cf-home-about__text">
                <p className="cf-eyebrow">Sobre CleanFlow</p>
                <h2 className="cf-home-title">Limpiamos como si fuera nuestra casa</h2>
                <p>
                    CleanFlow nació en Madrid con una idea sencilla: que contratar una limpieza sea
                    tan fácil como pedir comida a domicilio, pero con la confianza de saber quién
                    entra en tu casa.
                </p>
                <p>
                    Por eso todo nuestro equipo es propio. Lo seleccionamos, lo formamos y lo
                    cuidamos, porque un equipo contento es el que mejor trabaja.
                </p>

                <ul className="cf-home-about__values">
                    {VALUES.map((value) => (
                        <li key={value.title}>
                            <i className={`fa-solid ${value.icon}`} aria-hidden="true"></i>
                            <span>
                                <b>{value.title}</b>
                                <span>{value.text}</span>
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="cf-home-about__actions">
                    <Link to="/#contact" className="cf-btn">Habla con nosotros</Link>
                    <Link to="/work-with-us" className="cf-btn cf-btn--ghost">Trabaja con nosotros</Link>
                </div>
            </div>
        </div>
    </section>
);
