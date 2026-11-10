/**
 * RUTAS DE LA APP.
 *
 * Web pública, login y registro, y zona privada (/dashboard).
 * La zona privada pide sesión (ProtectedRoutes) y cada sección, su rol (RoleRoute).
 *
 * CADA PÁGINA SE DESCARGA AL VISITARLA (WEB-03). Solo la landing, su marco
 * y las guardas van en el paquete principal: es lo primero que se ve. El
 * resto lleva `lazy`, y React Router lo descarga la primera vez que hace
 * falta; después ya se queda. Mientras llega, la página de antes sigue en
 * pantalla con una barra arriba (components/PageLoading.jsx).
 */

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { RootLayout } from "./pages/RootLayout";
import { PageSplash, RouteError } from "./components/PageLoading";
import { PublicLayout } from "./pages/web/PublicLayout";
import { Home } from "./pages/web/Home";
import { ProtectedRoutes } from "./pages/dashboard/ProtectedRoutes";
import { RoleRoute } from "./pages/dashboard/RoleRoute";


// Una página que se descarga al visitarla. Nuestras páginas se exportan con
// nombre (export const Home), así que hay que decirle cuál es el componente.
//   lazy={page(() => import("./pages/web/WorkWithUs"), "WorkWithUs")}
const page = (load, name) => async () => {
  const module = await load();
  return { Component: module[name] };
};


export const router = createBrowserRouter(
  createRoutesFromElements(
    // El marco raíz pone la barra de carga encima de todo. Mientras llega la
    // primera página al abrir la web en una dirección del panel, se ve
    // PageSplash; si una página no se puede descargar, RouteError.
    <Route element={<RootLayout />} hydrateFallbackElement={<PageSplash />} errorElement={<RouteError />}>
      {/* ---------- ZONA PÚBLICA ---------- */}
      <Route path="/" element={<PublicLayout />} errorElement={<RouteError />}>
        <Route index element={<Home />} />
        <Route path="work-with-us" lazy={page(() => import("./pages/web/WorkWithUs"), "WorkWithUs")} />
        <Route path="services/:slug" lazy={page(() => import("./pages/web/ServiceDetail"), "ServiceDetail")} />
      </Route>

      {/* ---------- ACCESO Y REGISTRO: layout propio, sin navbar ni footer ----------
          Dos puertas y un solo formulario: las dos llaman al mismo
          POST /api/login. Cambian el título y lo que se le ofrece a quien
          todavía no tiene cuenta (WEB-10). */}
      <Route lazy={page(() => import("./pages/web/AuthLayout"), "AuthLayout")}>
        <Route path="login-clients" lazy={page(() => import("./pages/web/LoginClients"), "LoginClients")} />
        <Route path="login-workers" lazy={page(() => import("./pages/web/LoginWorkers"), "LoginWorkers")} />
        <Route path="register" lazy={page(() => import("./pages/web/Register"), "Register")} />
        {/* El paso que falta tras entrar con Google. Pide sesión, pero va
            fuera de /dashboard porque todavía no puede pasar ahí, así que
            ProtectedRoutes no la cubre: la pantalla se guarda ella sola. */}
        <Route path="completar-perfil" lazy={page(() => import("./pages/web/CompleteProfile"), "CompleteProfile")} />
      </Route>

      {/* ---------- ZONA PRIVADA ---------- */}
      {/* ProtectedRoutes vigila que haya sesión; no aporta URL. */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" lazy={page(() => import("./pages/dashboard/DashboardLayout"), "DashboardLayout")}>

          {/* ---- LA MIGA DE PAN (PANEL-01) ----
              Cada ruta lleva su nombre en handle.crumb, y la barra de arriba
              (DashboardTopbar.jsx) los pinta en orden: «Panel · Reservas».
              Puede ser un texto o una lista; un { label, to } se pinta como
              enlace, para volver a la lista desde un detalle. */}

          {/* ---- COMUNES A TODOS LOS ROLES ----
              Sin RoleRoute a propósito: son la entrada de todo el mundo. */}
          <Route index lazy={page(() => import("./pages/dashboard/home/DashboardHome"), "DashboardHome")} handle={{ crumb: "Inicio" }} />

          {/* Ajustes de la cuenta: un marco con pestañas y una ruta por
              apartado, para poder enlazar cada uno por separado.
              Direcciones solo para client: no contratan ni el encargado ni
              el trabajador. */}
          <Route path="profile" lazy={page(() => import("./pages/dashboard/account/AccountLayout"), "AccountLayout")} handle={{ crumb: { label: "Ajustes", to: "/dashboard/profile" } }}>
            <Route index lazy={page(() => import("./pages/dashboard/account/AccountDetails"), "AccountDetails")} handle={{ crumb: "Datos personales" }} />
            <Route path="security" lazy={page(() => import("./pages/dashboard/account/AccountSecurity"), "AccountSecurity")} handle={{ crumb: "Seguridad" }} />
            <Route element={<RoleRoute allowed={["client"]} />}>
              <Route path="addresses" lazy={page(() => import("./pages/dashboard/account/AccountAddresses"), "AccountAddresses")} handle={{ crumb: "Direcciones" }} />
            </Route>
          </Route>

          {/* ---- SECCIONES DE CLIENT ----
              book es «Reservar limpieza»: el catálogo y la reserva en una
              sola página (PANEL-02). Es un contrato: la web y «Repetir»
              llegan aquí, a veces con ?servicio=<slug>.
              service-catalog era el catálogo de antes: ahora solo lleva a
              book, para que no se rompan los enlaces de siempre. No
              confundir con services-catalog, la del encargado. */}
          <Route element={<RoleRoute allowed={["client"]} />}>
            <Route path="service-catalog" lazy={page(() => import("./pages/dashboard/booking/CatalogRedirect"), "CatalogRedirect")} />
            <Route path="book" lazy={page(() => import("./pages/dashboard/booking/BookingPanel"), "BookingPanel")} handle={{ crumb: "Reservar limpieza" }} />
            <Route path="contracted-services" lazy={page(() => import("./pages/dashboard/MyBookings"), "MyBookings")} handle={{ crumb: "Servicios contratados" }} />
            {/* El detalle de una reserva, dentro del mismo RoleRoute: si
                se declara fuera, se cuela cualquier rol. */}
            <Route path="contracted-services/:bookingId" lazy={page(() => import("./pages/dashboard/BookingDetail"), "BookingDetail")} handle={{ crumb: [{ label: "Servicios contratados", to: "/dashboard/contracted-services" }, "Detalle"] }} />
          </Route>

          {/* ---- SECCIONES DE WORKER ---- */}
          <Route element={<RoleRoute allowed={["worker"]} />}>
            <Route path="tasks" lazy={page(() => import("./pages/dashboard/MisReservasTrabajador"), "MisReservasTrabajador")} handle={{ crumb: "Mis servicios" }} />
            {/* El detalle, dentro del mismo RoleRoute: si se declara
                fuera, se cuela cualquier rol. */}
            <Route path="tasks/:bookingId" lazy={page(() => import("./pages/dashboard/WorkerBookingDetail"), "WorkerBookingDetail")} handle={{ crumb: [{ label: "Mis servicios", to: "/dashboard/tasks" }, "Detalle"] }} />
          </Route>

          {/* ---- SECCIONES DE MANAGER ----
              Un mismo RoleRoute envuelve varias rutas.
              tasks-catalog y no tasks: tasks ya es la ruta del trabajador. */}
          <Route element={<RoleRoute allowed={["manager"]} />}>
            <Route path="applications" lazy={page(() => import("./pages/dashboard/Applications"), "Applications")} handle={{ crumb: "Candidaturas" }} />
            <Route path="messages" lazy={page(() => import("./pages/dashboard/Messages"), "Messages")} handle={{ crumb: "Mensajes" }} />
            <Route path="incidents" lazy={page(() => import("./pages/dashboard/ListadoIncidencias"), "ListadoIncidencias")} handle={{ crumb: "Incidencias" }} />
            <Route path="clients" lazy={page(() => import("./pages/dashboard/ListadoClientes"), "ListadoClientes")} handle={{ crumb: "Clientes" }} />
            <Route path="bookings" lazy={page(() => import("./pages/dashboard/ListadoReservas"), "ListadoReservas")} handle={{ crumb: "Reservas" }} />
            <Route path="workers" lazy={page(() => import("./pages/dashboard/ListadoTrabajadores"), "ListadoTrabajadores")} handle={{ crumb: "Trabajadores" }} />
            <Route path="affected-bookings" lazy={page(() => import("./pages/dashboard/AffectedBookings"), "AffectedBookings")} handle={{ crumb: [{ label: "Reservas", to: "/dashboard/bookings" }, "Afectadas"] }} />
            <Route
              path="workers/:workerId/edit"
              handle={{ crumb: [{ label: "Trabajadores", to: "/dashboard/workers" }, "Editar"] }}
              lazy={page(() => import("./pages/dashboard/EditarTrabajador"), "EditarTrabajador")}
            />
            <Route
              path="workers/:workerId/absences"
              handle={{ crumb: [{ label: "Trabajadores", to: "/dashboard/workers" }, "Ausencias"] }}
              lazy={page(() => import("./pages/dashboard/WorkerAbsencesPage"), "WorkerAbsencesPage")}
            />
            <Route
              path="workers/new"
              handle={{ crumb: [{ label: "Trabajadores", to: "/dashboard/workers" }, "Nuevo trabajador"] }}
              lazy={page(() => import("./pages/dashboard/EditarTrabajador"), "EditarTrabajador")}
            />
            <Route path="shifts" lazy={page(() => import("./pages/dashboard/ListadoTurnos"), "ListadoTurnos")} handle={{ crumb: "Turnos" }} />
            <Route path="services-catalog" lazy={page(() => import("./pages/dashboard/ManageServices"), "ManageServices")} handle={{ crumb: "Servicios" }} />
            <Route path="tasks-catalog" lazy={page(() => import("./pages/dashboard/ManageTasks"), "ManageTasks")} handle={{ crumb: "Tareas" }} />
          </Route>

          {/* ---- CÓMO AÑADIR UNA SECCIÓN NUEVA ----

              1) Crea tu página en src/front/pages/dashboard/.
              2) Añade la ruta dentro del RoleRoute de su rol, con `lazy` para
                 que se descargue al visitarla (WEB-03):
                    <Route path="shifts" lazy={page(() => import("./pages/dashboard/Shifts"), "Shifts")} handle={{ crumb: "Turnos" }} />
              3) Ponle su nombre en handle, para la miga de pan de la barra de arriba.
              4) Añade su enlace a LINKS en components/dashboard/Sidebar.jsx.

              ¿Para VARIOS roles? No dupliques la ruta: añade el rol al array.
                    <Route element={<RoleRoute allowed={["client", "manager"]} />}>
                      <Route path="invoices" lazy={page(() => import("./pages/dashboard/Invoices"), "Invoices")} />
                    </Route>

              Los path van SIN barra inicial (son relativos a /dashboard) y no
              pueden repetirse entre roles. Si la ve todo el mundo, va suelta
              como profile, sin RoleRoute. */}

        </Route>
      </Route>

      <Route path="*" element={<h1>Not found!</h1>} />
    </Route>
  )
);
