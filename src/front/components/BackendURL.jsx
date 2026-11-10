// Aviso para desarrollo: sale solo si falta VITE_BACKEND_URL, porque sin
// esa variable el front no sabe dónde está la API y nada funcionaría.
export const BackendURL = () => (
	<div className="mt-5 pt-5 w-50 mx-auto">
		<h2>Falta la variable VITE_BACKEND_URL</h2>
		<p>
			El front no sabe en qué dirección está la API. Añade{" "}
			<code>VITE_BACKEND_URL</code> a tu archivo <code>.env</code> con la URL
			del servidor de Flask (en local, <code>http://127.0.0.1:3001</code>) y
			vuelve a arrancar Vite.
		</p>
		<p>
			Tienes la lista de variables en <code>.env.example</code>.
		</p>
	</div>
);
