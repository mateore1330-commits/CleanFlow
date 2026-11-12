/**
 * AVISO DE PROYECTO DE PORTFOLIO (WEB-01).
 *
 * CleanFlow es un proyecto de portfolio: la empresa y sus servicios son
 * ficticios. Esta barra fina, encima del menú de todas las páginas
 * públicas y del acceso, evita que alguien intente contratar una limpieza
 * de verdad. Siempre visible y sin botón de cerrar: es justo lo que no
 * debe pasar desapercibido. El pie lo repite.
 *
 * Estilos: index.css (cf-demo-notice).
 */

export const DemoNotice = () => (
    <p className="cf-demo-notice">
        <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
        {/* Dos versiones: en móvil la larga ocupaba tres líneas antes del
            menú; la corta cabe en una a 390 px y repite las palabras del pie. Solo se ve una; la otra va con display: none, así que el
            lector de pantalla tampoco la lee dos veces. */}
        <span className="cf-demo-notice__long">
            <b>Proyecto de portfolio:</b> CleanFlow es una empresa ficticia. Puedes probar la web,
            pero no se presta ningún servicio real.
        </span>
        <span className="cf-demo-notice__short">
            <b>Proyecto de portfolio:</b> empresa y servicios ficticios.
        </span>
    </p>
);
