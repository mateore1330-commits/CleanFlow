/** Candidaturas: comparte listado, filtros y estados con Mensajes (WEB-13). */
import { Inbox } from "../../components/dashboard/inbox/Inbox";
import { getJobApplications, updateApplicationStatus } from "../../services/applicationService";

const config = {
    idKey: "application_id",
    responseKey: "application",
    getItems: getJobApplications,
    updateItem: updateApplicationStatus,
    title: "Candidaturas",
    description: "Gestiona las solicitudes enviadas desde Trabaja con nosotros.",
    filterLabel: "Filtrar candidaturas por estado",
    labels: { new: "Nueva", contacted: "Contactada", discarded: "Descartada" },
    filters: [
        { value: "new", label: "Nuevas", hint: "sin llamar", icon: "fa-envelope-open-text" },
        { value: "contacted", label: "Contactadas", hint: "ya llamadas", icon: "fa-phone" },
        { value: "discarded", label: "Descartadas", hint: "archivadas", icon: "fa-box-archive" },
    ],
    name: (row) => [row.name, row.last_name].filter(Boolean).join(" "),
    detailsLabel: "Ver experiencia y mensaje",
    fields: [
        { key: "experience", label: "Experiencia" },
        { key: "message", label: "Mensaje" },
    ],
    actions: [
        { status: "contacted", label: "Ya la he llamado", icon: "fa-phone" },
        { status: "discarded", label: "Descartar", icon: "fa-xmark", ghost: true },
    ],
    loadingText: "Cargando candidaturas…",
    loadError: "No se pudieron cargar las candidaturas.",
    updateError: "No se pudo actualizar el estado de la candidatura.",
    emptyTitle: "No hay candidaturas en este estado",
    emptyText: "Las solicitudes aparecen aquí cuando alguien completa el formulario de Trabaja con nosotros.",
};

export const Applications = () => <Inbox config={config} />;
