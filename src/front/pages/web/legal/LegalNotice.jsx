/**
 * AVISO LEGAL (WEB-04): quién hay detrás de la web y para qué sirve.
 * Plantilla y estilos: components/web/LegalPage.jsx.
 */
import { LegalPage, OwnerContact } from "../../../components/web/LegalPage";
import { OWNER } from "../../../data/company";

const SECTIONS = [
    {
        id: "quien",
        title: "Quién está detrás",
        content: (
            <>
                <p>
                    Esta web la ha creado <b>{OWNER.name}</b> como proyecto de portfolio de desarrollo
                    web. Puedes escribirle desde <OwnerContact />.
                </p>
                <p>
                    CleanFlow no es una empresa registrada: no tiene NIF, domicilio ni actividad. La
                    dirección, el teléfono y el correo que salen en la web son inventados.
                </p>
            </>
        ),
    },
    {
        id: "para-que",
        title: "Para qué sirve",
        content: (
            <>
                <p>
                    Para enseñar cómo funciona una aplicación de reservas de limpieza de principio a fin:
                    la web pública, el panel del cliente, el del trabajador y el del encargado.
                </p>
                <p>
                    Puedes crear una cuenta, reservar, valorar o escribir por el formulario. Nada de eso
                    llega a una empresa real: <b>no se presta ningún servicio ni se cobra nada</b>.
                </p>
            </>
        ),
    },
    {
        id: "contenidos",
        title: "Los contenidos",
        content: (
            <>
                <p>
                    Los textos, el diseño y el código se han hecho para este proyecto. Los logotipos de la
                    sección de clientes son marcas inventadas.
                </p>
                <p>
                    Las fotos ilustran el proyecto: algunas, como la del equipo, se han generado con
                    inteligencia artificial. Las personas que aparecen no son clientes ni trabajadores de
                    CleanFlow.
                </p>
                <p>
                    Las opiniones y los nombres que aparecen en la web son datos de demostración, no de
                    clientes reales.
                </p>
            </>
        ),
    },
    {
        id: "codigo",
        title: "El código",
        content: (
            <p>
                El código de CleanFlow es público y se puede consultar en{" "}
                <a href="https://github.com/mateore1330-commits/CleanFlow" target="_blank" rel="noreferrer">
                    GitHub<span className="sr-only"> (se abre en otra pestaña)</span>
                </a>.
            </p>
        ),
    },
    {
        id: "demo",
        title: "La demo puede cambiar",
        content: (
            <p>
                Al ser una demostración, puede dejar de estar disponible, cambiar o reiniciarse sin aviso.
                Si se reinicia, se borra lo que hayas creado: cuentas, reservas o mensajes.
            </p>
        ),
    },
    {
        id: "enlaces",
        title: "Enlaces a otras webs",
        content: (
            <p>
                Algunos botones llevan a otras webs, como Google Maps o las redes sociales. Lo que pase
                allí depende de cada una y de sus condiciones.
            </p>
        ),
    },
];

export const LegalNotice = () => (
    <LegalPage
        page="legal"
        title="Aviso legal"
        lede="Quién hay detrás de esta web y para qué sirve."
        updated="11 de noviembre de 2026"
        summary={[
            <>CleanFlow es <b>un proyecto de portfolio</b>: la empresa, sus servicios, precios, oficina y equipo son ficticios.</>,
            <>Puedes registrarte y probarlo todo, pero <b>ninguna reserva da lugar a un servicio ni a un cobro</b>.</>,
            <>Lo ha hecho {OWNER.name}, desarrollador web.</>,
        ]}
        sections={SECTIONS}
    />
);
