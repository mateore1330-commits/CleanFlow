/**
 * COOKIES (WEB-04): lo que la web guarda en el navegador y por qué no
 * pide permiso.
 *
 * ⚠️ Comprobado con las herramientas del navegador el 11/11/2026. Si la
 * app guarda algo nuevo en localStorage o en una cookie, o carga un
 * servicio de fuera, se añade aquí. Y si no es estrictamente necesario,
 * hace falta un aviso de cookies.
 *
 * Plantilla y estilos: components/web/LegalPage.jsx.
 */
import { LegalPage, LegalTable } from "../../../components/web/LegalPage";

const STORAGE_ROWS = [
    [<code key="t">token</code>, "Mantener tu sesión abierta mientras usas el panel", "Hasta que sales. Caduca sola a la hora"],
    [<code key="u">user</code>, "Tu nombre y tu rol, para enseñar el panel sin esperar", "Hasta que sales"],
    [<code key="s">cleanflow:sidebar-collapsed</code>, "Recordar si has plegado el menú del panel", "Hasta que lo borras"],
];

const SECTIONS = [
    {
        id: "que-son",
        title: "Qué son",
        content: (
            <p>
                Las cookies son pequeños archivos que una web guarda en tu navegador. Hay otra forma
                parecida de guardar cosas, el <b>almacenamiento local</b>, que es la que usa CleanFlow. Aquí
                se explican las dos.
            </p>
        ),
    },
    {
        id: "cleanflow",
        title: "Lo que guarda CleanFlow",
        content: (
            <>
                <LegalTable head={["Nombre", "Para qué", "Cuánto dura"]} rows={STORAGE_ROWS} />
                <p>
                    Los tres van en el almacenamiento local, no en cookies. Ninguno sale de tu navegador salvo
                    la sesión, que se envía a CleanFlow para saber que eres tú.
                </p>
            </>
        ),
    },
    {
        id: "otros",
        title: "Lo que pueden guardar otros",
        content: (
            <ul>
                <li>
                    <b>Google, en el acceso y en el registro.</b> El botón «Continuar con Google» se carga
                    desde Google, y Google usa sus propias cookies, en su dominio, para ofrecerte tu cuenta y
                    saber con cuál entras. Lo explica en{" "}
                    <a href="https://policies.google.com/technologies/cookies?hl=es" target="_blank" rel="noreferrer">
                        su política de cookies<span className="sr-only"> (se abre en otra pestaña)</span>
                    </a>.
                </li>
                <li>
                    <b>Google Maps, solo si pulsas «Abrir en Google Maps»</b>: se abre en otra pestaña, ya
                    fuera de CleanFlow. El mapa de la web es un dibujo y no carga nada de Google.
                </li>
                <li>
                    <b>Cloudinary, cdnjs y jsDelivr</b> sirven las fotos, los iconos y algunos estilos. No
                    ponen cookies, pero, como cualquier web a la que se conecta tu navegador, ven tu dirección
                    IP.
                </li>
            </ul>
        ),
    },
    {
        id: "sin-aviso",
        title: "Por qué no hay aviso de cookies",
        content: (
            <>
                <p>
                    La ley solo pide permiso para lo que no es necesario para que la web funcione, como la
                    publicidad o la analítica. Lo que guarda CleanFlow es justo lo necesario para la sesión que
                    tú abres, así que no hace falta preguntarte.
                </p>
                <p>Si algún día la web usara algo más, esta página lo diría y te pediría permiso antes.</p>
            </>
        ),
    },
    {
        id: "borrar",
        title: "Cómo borrarlo",
        content: (
            <ul>
                <li><b>Salir</b> del panel borra la sesión (<code>token</code> y <code>user</code>).</li>
                <li>
                    Para borrarlo todo, también la preferencia del menú, usa la opción de tu navegador de
                    borrar los datos de los sitios web.
                </li>
            </ul>
        ),
    },
];

export const Cookies = () => (
    <LegalPage
        page="cookies"
        title="Cookies"
        lede="Lo que la web guarda en tu navegador y por qué no te pide permiso para hacerlo."
        updated="11 de noviembre de 2026"
        summary={[
            <>CleanFlow <b>no usa cookies propias</b>, ni de análisis ni de publicidad.</>,
            <>Guarda en tu navegador solo lo necesario para mantener tu sesión y recordar el menú del panel.</>,
            <>Por eso no hay aviso de cookies: la ley no lo pide para lo estrictamente necesario.</>,
        ]}
        sections={SECTIONS}
    />
);
