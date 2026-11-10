/**
 * AVATAR: LA FOTO DE PERFIL, O LAS INICIALES (#13, DISENO-02).
 *
 * Con foto la pinta; sin foto (o si la foto ya no carga), un círculo con
 * las iniciales sobre el degradado de marca. La regla vive aquí y en un
 * solo sitio para toda la app: panel, reservas y opiniones de la web.
 *
 *   user:  el usuario del store o los datos de la cuenta (name, last_name, avatar_url)
 *   name:  o solo un nombre, como "Ana G." (lo que traen las reservas)
 *   src:   la foto, si no va dentro de user
 *   size:  "xs" | "sm" | "md" | "lg"  (22, 32, 48 y 96 px)
 *   tone:  "brand" (degradado de marca) | "accent" (degradado menta)
 *   alt:   texto si la foto dice algo por sí sola
 *   className: para ajustar el tamaño desde fuera, si hace falta
 *
 * Estilos: index.css (PIEZAS COMUNES, cf-dash-avatar*).
 */
import { useState } from "react"

// Tamaño en píxeles de cada talla. Va en los atributos width y height de la
// imagen: sin ellos, hasta que carga el CSS, la foto saldría a su tamaño
// real (256px) y reventaría la fila. El CSS manda sobre esto.
const SIZES = { xs: 22, sm: 32, md: 48, lg: 96 }

/**
 * Las iniciales de una persona.
 *   { name: "Mateo", last_name: "Restrepo" } -> "MR"
 *   "Ana G."                                 -> "AG"
 * Sin apellidos, una sola letra.
 */
export const initialsOf = (person) => {
    if (typeof person === "string" || person == null) {
        return (person || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase()
    }

    const first = (person.name || "").trim().charAt(0)
    const second = (person.last_name || "").trim().charAt(0)

    return (first + second).toUpperCase()
}

export const Avatar = ({ user, name, src, size = "md", tone = "brand", alt = "", className = "" }) => {
    // Si la foto falla (una URL que ya no responde), mejor las iniciales
    // que un icono de imagen rota.
    const [failed, setFailed] = useState(false)

    const photo = src || user?.avatar_url
    const classes = [
        "cf-dash-avatar",
        `cf-dash-avatar--${size}`,
        tone === "accent" && "cf-dash-avatar--accent",
        className,
    ].filter(Boolean).join(" ")
    const pixels = SIZES[size] || SIZES.md

    if (photo && !failed) {
        // alt vacío por defecto: al lado casi siempre está el nombre, y
        // repetirlo solo molesta a quien usa lector de pantalla.
        return (
            <img
                className={classes}
                src={photo}
                alt={alt}
                width={pixels}
                height={pixels}
                loading="lazy"
                onError={() => setFailed(true)}
            />
        )
    }

    // aria-hidden: las iniciales son un dibujo, no un texto que aporte.
    return (
        <span className={classes} aria-hidden="true">
            {initialsOf(user || name)}
        </span>
    )
}
