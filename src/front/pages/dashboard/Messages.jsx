/** Mensajes de contacto: el estado contacted se presenta como Respondido. */
import { Inbox } from "../../components/dashboard/inbox/Inbox";
import { getContactMessages, updateMessageStatus } from "../../services/contactService";

// Mantener config fuera del componente para conservar una referencia estable.
// Si se crea dentro, los callbacks dependientes podrían recrearse y disparar peticiones en bucle.
const config = {
    idKey: "contact_message_id",
    responseKey: "contact_message",
    getItems: getContactMessages,
    updateItem: updateMessageStatus,
    title: "Mensajes",
    description: "Lee las consultas recibidas y marca las que ya has respondido.",
    filterLabel: "Filtrar mensajes por estado",
    labels: { new: "Nuevo", contacted: "Respondido", discarded: "Descartado" },
    filters: [
        { value: "new", label: "Nuevos", hint: "sin responder", icon: "fa-envelope" },
        { value: "contacted", label: "Respondidos", hint: "ya contestados", icon: "fa-reply" },
        { value: "discarded", label: "Descartados", hint: "archivados", icon: "fa-box-archive" },
    ],
    name: (row) => row.name,
    subject: true,
    mailSubject: (row) => `Re: ${row.subject || "Consulta a CleanFlow"}`,
    detailsLabel: "Leer mensaje completo",
    fields: [{ key: "message", label: "Mensaje" }],
    actions: [
        { status: "contacted", label: "Marcar como respondido", icon: "fa-check" },
        { status: "discarded", label: "Descartar", icon: "fa-xmark", ghost: true },
    ],
    loadingText: "Cargando mensajes…",
    loadError: "No se pudieron cargar los mensajes.",
    updateError: "No se pudo actualizar el estado del mensaje.",
    emptyTitle: "No hay mensajes en este estado",
    emptyText: "Aquí aparecerán las consultas enviadas desde el formulario de contacto. Puedes revisar los demás filtros.",
};

export const Messages = () => <Inbox config={config} />;
