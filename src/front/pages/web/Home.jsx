/**
 * LANDING (maqueta 02, WEB-01).
 *
 * Este archivo solo importa y ordena. Cada sección vive en su propio
 * componente dentro de home/, y sus estilos en landing.css.
 *
 * El orden es el de la maqueta aprobada. Los ids de las secciones (hero,
 * services, how, about-us, why-cleanflow, reviews, faq, contact) son los
 * destinos de los enlaces del menú y del pie: si se cambia uno, hay que
 * cambiarlo también allí.
 */

import "../../landing.css"
import { Hero } from "./home/Hero"
import { PartnersSection } from "./home/PartnersSection"
import { ServicesSection } from "./home/ServicesSection"
import { HowItWorksSection } from "./home/HowItWorksSection"
import { AboutSection } from "./home/AboutSection"
import { WhyCleanFlowSection } from "./home/WhyCleanFlowSection"
import { ReviewsSection } from "./home/ReviewsSection"
import { FaqSection } from "./home/FaqSection"
import { ContactSection } from "./home/ContactSection"
import { LocationSection } from "./home/LocationSection"

export const Home = () => {
    return (
        <main className="cf-home">
            <Hero />
            <PartnersSection />
            <ServicesSection />
            <HowItWorksSection />
            <AboutSection />
            <WhyCleanFlowSection />
            <ReviewsSection />
            <FaqSection />
            <ContactSection />
            <LocationSection />
        </main>
    )
}
