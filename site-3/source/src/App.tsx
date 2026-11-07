import SmoothScroll from './SmoothScroll';
import BlurText from './components/reactbits/BlurText';

// Page de départ du Site 3 : on la remplacera par le vrai contenu.
export default function App() {
  return (
    <SmoothScroll>
      <main className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center px-5 py-16">
        <h1 className="sr-only">Site 3</h1>
        <div aria-hidden="true">
          <BlurText text="Site 3 arrive bientôt." animateBy="words" direction="bottom" delay={100} className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl" />
        </div>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-texte/70">
          Le projet est prêt avec React, React Bits, GSAP et Lenis. Il ne reste plus qu’à choisir son contenu.
        </p>
      </main>
    </SmoothScroll>
  );
}
