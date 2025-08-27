import Hero from "../../components/Landing/Hero";
import Feature from "../../components/Landing/Feature";
import Feature2 from "../../components/Landing/Feature2";

// Main landing page that composes the hero section and feature components
// Provides the primary entry point for new users to learn about the platform
const Home = () => {
  return (
    <div>
      <Hero />
      <Feature />
      <Feature2 />
    </div>
  );
};

export default Home;
