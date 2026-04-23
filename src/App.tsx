import AppToaster from './components/AppToaster'
import Navbar from './components/sections/Navbar.tsx'
import Hero from './components/sections/Hero.tsx'
import Services from './components/sections/Services.tsx'
import About from './components/sections/About.tsx'
import Contact from './components/sections/Contact.tsx'
import Footer from './components/sections/Footer.tsx'

function App() {
  return (
    <>
      <AppToaster />
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

export default App
