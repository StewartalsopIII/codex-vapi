import Link from 'next/link';

import ThreeDemoScene from '@/components/ThreeDemoScene';

export const metadata = {
  title: 'Three.js Experience Demo',
  description: 'Interactive WebGL scene that highlights what Three.js can do in a modern Next.js app.',
};

export default function ThreeDemoPage() {
  return (
    <main className="relative min-h-screen bg-slate-950 pb-24 pt-16 text-white">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/30 via-blue-500/20 to-transparent blur-3xl" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-14 px-6">
        <header className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/80">
            <span>WebGL</span>
            <span className="h-px w-12 bg-emerald-300/60" />
            <span>Three.js</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Bring ideas to life with a cinematic Three.js scene in your Next.js app.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-200/80 sm:text-lg">
            This interactive demo combines physically-based lighting, procedural animation, and immersive camera controls.
            Use it to show stakeholders how Three.js turns the web into a real-time 3D canvas.
          </p>
        </header>

        <ThreeDemoScene />

        <section className="grid gap-8 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Physically-Based Lighting</h2>
            <p className="mt-2 text-sm text-slate-200/80">
              Layered ambient, directional, and rim lights deliver depth, crisp shadows, and a cinematic glow.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Animated Geometry</h2>
            <p className="mt-2 text-sm text-slate-200/80">
              A torus knot centerpiece and orbiting spheres react in real-time, showcasing Three.js animation loops.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Orbit Controls</h2>
            <p className="mt-2 text-sm text-slate-200/80">
              Drag to orbit and scroll to zoom thanks to the familiar `OrbitControls` experience.
            </p>
          </article>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-base font-semibold text-white">Want to try a different scene?</h3>
            <p className="mt-1 text-sm text-slate-200/75">
              Duplicate this page and swap the geometry or materials to tailor the demo to your audience.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to platform overview
          </Link>
        </footer>
      </div>
    </main>
  );
}
