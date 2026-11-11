/**
 * POLÍTICA DE PRIVACIDAD (WEB-04): qué datos se guardan al probar la
 * demo, para qué y cómo pedir que se borren.
 *
 * ⚠️ Tiene que decir la verdad. Si la app empieza a guardar algo nuevo
 * (una tabla, un campo con datos de una persona), se añade aquí.
 *
 * Plantilla y estilos: components/web/LegalPage.jsx.
 */
import { Link } from "react-router-dom";
import { LegalPage, LegalTable, OwnerContact } from "../../../components/web/LegalPage";
import { OWNER } from "../../../data/company";

const DATA_ROWS = [
    ["Tu cuenta: nombre, apellidos, correo, teléfono, contraseña (cifrada) y foto, si la subes", "Entrar y que se te reconozca en el panel"],
    ["Tus direcciones, con las notas de acceso que escribas", "Saber a dónde iría el servicio"],
    ["Tus reservas, con sus tareas, las fotos del antes y el después y las incidencias", "Seguir cada servicio"],
    ["Tus valoraciones", <>Enseñar qué tal fue. <b>Se ven en la web pública</b>, con tu nombre, la inicial de tu apellido y tu foto</>],
    ["Los mensajes del formulario de contacto", "Contestarte"],
    ["Las candidaturas de «Trabaja con nosotros»", "Valorarlas"],
    ["Si eres trabajador: tus turnos y ausencias", "Repartir el trabajo"],
    ["La dirección IP de cada intento de entrar o de registrarse", <>Frenar a quien prueba contraseñas. <b>Se borra al minuto</b></>],
];

const SECTIONS = [
    {
        id: "responsable",
        title: "Quién los guarda",
        content: (
            <p>
                El responsable de los datos es <b>{OWNER.name}</b>, que ha hecho esta web como proyecto de
                portfolio. Para cualquier cosa sobre tus datos, escríbele desde <OwnerContact />.
            </p>
        ),
    },
    {
        id: "inventados",
        title: "Mejor, con datos inventados",
        content: (
            <p>
                CleanFlow es una demostración: <b>no envía correos, no llama por teléfono y no presta ningún
                servicio</b>. Por eso puedes registrarte, reservar o escribir con un nombre, un correo y un
                teléfono inventados, y todo funciona igual.
            </p>
        ),
    },
    {
        id: "que-datos",
        title: "Qué datos se guardan y para qué",
        content: (
            <>
                <LegalTable head={["Datos", "Para qué"]} rows={DATA_ROWS} />
                <p>
                    Si entras con Google, Google le pasa a CleanFlow tu nombre, tu correo, tu foto y un
                    identificador de tu cuenta. Nunca tu contraseña de Google.
                </p>
            </>
        ),
    },
    {
        id: "por-que",
        title: "Por qué se pueden guardar",
        content: (
            <p>
                Porque tú los envías para usar la demo: al crear la cuenta aceptas esta política, y al
                escribir por un formulario nos das esos datos para que se usen en eso.
            </p>
        ),
    },
    {
        id: "quien-ve",
        title: "Quién los ve",
        content: (
            <>
                <p><b>Dentro de la demo</b>, cada uno ve lo suyo y lo que necesita para su trabajo:</p>
                <ul>
                    <li>el encargado ve los clientes, las reservas, los mensajes y las candidaturas;</li>
                    <li>
                        el trabajador ve, de sus servicios, el nombre del cliente y la dirección, y el teléfono
                        solo el día del servicio.
                    </li>
                </ul>
                <p><b>Fuera de la demo</b>, solo los servicios técnicos que la hacen funcionar:</p>
                <ul>
                    <li>el alojamiento de la web (Vercel) y el de la base de datos;</li>
                    <li>Cloudinary, donde se guardan las fotos;</li>
                    <li>Google, si entras con tu cuenta de Google.</li>
                </ul>
                <p>
                    Nadie más. Algunos de estos servicios pueden guardar los datos fuera de la Unión Europea,
                    con las garantías que ofrece cada uno.
                </p>
            </>
        ),
    },
    {
        id: "cuanto",
        title: "Cuánto tiempo",
        content: (
            <>
                <p>
                    Mientras exista la demo o hasta que pidas que se borren. Como es una demostración, puede
                    reiniciarse y borrarse todo antes.
                </p>
                <p>Las direcciones IP de los intentos de entrar se borran al minuto.</p>
            </>
        ),
    },
    {
        id: "derechos",
        title: "Lo que puedes hacer",
        content: (
            <ul>
                <li><b>Cambiar tus datos:</b> tu nombre, tu teléfono, tu foto y tu contraseña, en <i>Ajustes</i>.</li>
                <li>
                    <b>Pedir una copia, que se corrijan o que se borren</b>, también tu cuenta entera: escribe
                    a {OWNER.name} desde <OwnerContact />.
                </li>
                <li>
                    <b>Reclamar</b> ante la Agencia Española de Protección de Datos, en{" "}
                    <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
                        aepd.es<span className="sr-only"> (se abre en otra pestaña)</span>
                    </a>, si crees que no se han tratado bien.
                </li>
            </ul>
        ),
    },
    {
        id: "cambios",
        title: "Si esta política cambia",
        content: (
            <p>
                La fecha de arriba dice cuándo se revisó por última vez. Si cambia algo importante, se dirá
                aquí. Lo que se guarda en tu navegador se explica en <Link to="/cookies">Cookies</Link>.
            </p>
        ),
    },
];

export const Privacy = () => (
    <LegalPage
        page="privacy"
        title="Política de privacidad"
        lede="Qué datos se guardan cuando pruebas la demo, para qué y cómo pedir que se borren."
        updated="11 de noviembre de 2026"
        summary={[
            <>Solo se guarda lo que tú escribes para usar la demo. <b>No se vende, no se cede y no se usa para publicidad.</b></>,
            <><b>Usa datos inventados</b>: la web no envía correos ni llama a nadie, así que no te hace falta poner los tuyos.</>,
            <>Puedes pedir en cualquier momento que se borren.</>,
        ]}
        sections={SECTIONS}
    />
);
