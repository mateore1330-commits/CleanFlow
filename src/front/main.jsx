import React from 'react'
import ReactDOM from 'react-dom/client'
// Tipografías de la marca, alojadas en la propia web (DISENO-01): el
// navegador no se conecta a Google. Van antes de index.css, que las usa.
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/inter'
import './index.css'  // Global styles for your application
import { RouterProvider } from "react-router-dom";  // Import RouterProvider to use the router
import { router } from "./routes";  // Import the router configuration
import { StoreProvider } from './hooks/useGlobalReducer';  // Import the StoreProvider for global state management
import { BackendURL } from './components/BackendURL';
import { ServicesLoader } from './components/web/ServicesLoader';
import { ReviewsLoader } from './components/web/ReviewsLoader';
import { WakeNotice } from './components/WakeNotice';

const Main = () => {

    // Solo en local: publicada, la web llama a /api de su propio dominio y
    // la variable va vacía a propósito (services/backend.js, DEPLOY-01).
    if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) return (
        <React.StrictMode>
              <BackendURL/ >
        </React.StrictMode>
        );
    return (
        <React.StrictMode>  
            {/* Provide global state to all components */}
            <StoreProvider> 
                {/* Set up routing for the application */} 
                <ServicesLoader />
                <ReviewsLoader />
                {/* Fuera del router: también avisa en la primera carga. */}
                <WakeNotice />
                <RouterProvider router={router}>
                </RouterProvider>
            </StoreProvider>
        </React.StrictMode>
    );
}

// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
