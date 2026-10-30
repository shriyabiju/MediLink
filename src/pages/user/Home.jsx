import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Statistics from "./components/Statistics";
import Services from "./components/Services";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import WhyChooseUs from "./components/WhyChooseUs";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import "./css/home.css";

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <Hero />
      <Statistics />
      <Services />
      <HowItWorks />
      <Features />
      <WhyChooseUs />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
