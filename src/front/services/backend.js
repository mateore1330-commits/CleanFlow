/**
 * DÓNDE ESTÁ LA API Y CÓMO SE LLAMA (DEPLOY-01).
 *
 * BACKEND_URL
 *   En local, VITE_BACKEND_URL (http://127.0.0.1:3001): Vite y Flask van
 *   en puertos distintos. Publicada en Vercel, vacía: la web y la API
 *   comparten dominio y basta con /api. Así, al cambiar el dominio
 *   (DEPLOY-02), no hay que reconstruir nada.
 *
 * apiFetch(url, opciones)
 *   El fetch de siempre, y además avisa cuando una petición tarda. La base
 *   de datos (Neon) se duerme tras 5 minutos sin visitas, y la primera
 *   petición después tarda unos segundos: si pasa de SLOW_MS, WakeNotice
 *   enseña «Despertando la demo…» hasta que termine. Todas las llamadas a
 *   la API pasan por aquí, también las de apiClient.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

// A partir de aquí, una petición «tarda». Por debajo, nadie lo nota.
const SLOW_MS = 2500;

let slowRequests = 0;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(slowRequests > 0));

/** Se llama con true mientras haya alguna petición lenta, y con false al acabar. */
export const onSlowRequests = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const apiFetch = async (url, options) => {
    let slow = false;

    const timer = setTimeout(() => {
        slow = true;
        slowRequests += 1;
        notify();
    }, SLOW_MS);

    try {
        return await fetch(url, options);
    } finally {
        clearTimeout(timer);

        if (slow) {
            slowRequests -= 1;
            notify();
        }
    }
};
