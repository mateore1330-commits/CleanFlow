// Logotipo de CleanFlow: «Clean» + «Flow» en una sola palabra, con «Flow»
// en el color de marca (manual de marca, DISENO-01). Solo el nombre: el
// isotipo (Logo.jsx) lo coloca cada sitio a su manera.
//
// dark: para fondos oscuros (menú del panel). Entonces «Clean» va en blanco
// y «Flow» en menta. El tamaño lo pone la clase de quien lo usa.
export const Wordmark = ({ className = "", dark = false }) => {
    const classes = ["cf-wordmark", dark && "cf-wordmark--neg", className]
        .filter(Boolean)
        .join(" ")

    return (
        <span className={classes}>
            Clean<span className="cf-wordmark__flow">Flow</span>
        </span>
    )
}
