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

          {/* ---- COMUNES A TODOS LOS ROLES ----
              Sin RoleRoute a propósito: son la entrada de todo el mundo. */}
          <Route index lazy={page(() => import("./pages/dashboard/home/DashboardHome"), "DashboardHome")} />

          {/* Ajustes de la cuenta: un marco con pestañas y una ruta por
              apartado, para poder enlazar cada uno por separado.
              Direcciones solo para client: no contratan ni el encargado ni
              el trabajador. */}
          <Route path="profile" lazy={page(() => import("./pages/dashboard/account/AccountLayout"), "AccountLayout")}>
            <Route index lazy={page(() => import("./pages/dashboard/account/AccountDetails"), "AccountDetails")} />
            <Route path="security" lazy={page(() => import("./pages/dashboard/account/AccountSecurity"), "AccountSecurity")} />
            <Route element={<RoleRoute allowed={["client"]} />}>
              <Route path="addresses" lazy={page(() => import("./pages/dashboard/account/AccountAddresses"), "AccountAddresses")} />
            </Route>
          </Route>

          {/* ---- SECCIONES DE CLIENT ----
              service-catalog es un contrato: "Reservar ahora" (WEB-15) apunta
              aquí. No confundir con services-catalog, la del encargado. */}
          <Route element={<RoleRoute allowed={["client"]} />}>
            <Route path="service-catalog" lazy={page(() => import("./pages/dashboard/ServiceCatalog"), "ServiceCatalog")} />
            {/* book es otro contrato: "Contratar" del catálogo llega aquí
                con ?servicio=<slug>. */}
            <Route path="book" lazy={page(() => import("./pages/dashboard/booking/BookingPanel"), "BookingPanel")} />
            <Route path="contracted-services" lazy={page(() => import("./pages/dashboard/MyBookings"), "MyBookings")} />
            {/* El detalle de una reserva, dentro del mismo RoleRoute: si
                se declara fuera, se cuela cualquier rol. */}
            <Route path="contracted-services/:bookingId" lazy={page(() => import("./pages/dashboard/BookingDetail"), "BookingDetail")} />
          </Route>

          {/* ---- SECCIONES DE WORKER ---- */}
          <Route element={<RoleRoute allowed={["worker"]} />}>
            <Route path="tasks" lazy={page(() => import("./pages/dashboard/MisReservasTrabajador"), "MisReservasTrabajador")} />
            {/* El detalle, dentro del mismo RoleRoute: si se declara
                fuera, se cuela cualquier rol. */}
            <Route path="tasks/:bookingId" lazy={page(() => import("./pages/dashboard/WorkerBookingDetail"), "WorkerBookingDetail")} />
          </Route>

          {/* ---- SECCIONES DE MANAGER ----
              Un mismo RoleRoute envuelve varias rutas.
              tasks-catalog y no tasks: tasks ya es la ruta del trabajador. */}
          <Route element={<RoleRoute allowed={["manager"]} />}>
            <Route path="applications" lazy={page(() => import("./pages/dashboard/Applications"), "Applications")} />
            <Route path="messages" lazy={page(() => import("./pages/dashboard/Messages"), "Messages")} />
            <Route path="incidents" lazy={page(() => import("./pages/dashboard/ListadoIncidencias"), "ListadoIncidencias")} />
            <Route path="clients" lazy={page(() => import("./pages/dashboard/ListadoClientes"), "ListadoClientes")} />
            <Route path="bookings" lazy={page(() => import("./pages/dashboard/ListadoReservas"), "ListadoReservas")} />
            <Route path="workers" lazy={page(() => import("./pages/dashboard/ListadoTrabajadores"), "ListadoTrabajadores")} />
            <Route path="affected-bookings" lazy={page(() => import("./pages/dashboard/AffectedBookings"), "AffectedBookings")} />
            <Route
              path="workers/:workerId/edit"
              lazy={page(() => import("./pages/dashboard/EditarTrabajador"), "EditarTrabajador")}
            />
            <Route
              path="workers/:workerId/absences"
              lazy={page(() => import("./pages/dashboard/WorkerAbsencesPage"), "WorkerAbsencesPage")}
            />
            <Route
              path="workers/new"
              lazy={page(() => import("./pages/dashboard/EditarTrabajador"), "EditarTrabajador")}
            />
            <Route path="shifts" lazy={page(() => import("./pages/dashboard/ListadoTurnos"), "ListadoTurnos")} />
            <Route path="services-catalog" lazy={page(() => import("./pages/dashboard/ManageServices"), "ManageServices")} />
            <Route path="tasks-catalog" lazy={page(() => import("./pages/dashboard/ManageTasks"), "ManageTasks")} />
          </Route>

          {/* ---- CÓMO AÑADIR UNA SECCIÓN NUEVA ----

              1) Crea tu página en src/front/pages/dashboard/.
              2) Añade la ruta dentro del RoleRoute de su rol, con `lazy` para
                 que se descargue al visitarla (WEB-03):
                    <Route path="shifts" lazy={page(() => import("./pages/dashboard/Shifts"), "Shifts")} />
              3) Añade su enlace a LINKS en components/dashboard/Sidebar.jsx.

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
