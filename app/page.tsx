import HeroBanner from "./_components/HeroBanner";
import NavBar from "./_components/NavBar";
import { ProjectSlideshow } from "./_components/ProjectSlideshow";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-2">
      <NavBar />
      <HeroBanner></HeroBanner>
      <main className="px-5">
        <section className="mb-5 mt-3">
          <h1 className="text-2xl font-semibold mb-3">👩🏻‍💻 About Me</h1>
          <p>
            High-performing, organised, goal-oriented student. Experienced in
            website/android application development/design, machine learning and
            UX research and design. My interests include productivity, project
            management, and am passionate about solving real world problems in a
            sustainable way.
          </p>
        </section>
        <section className="mb-5 mt-3">
          <h1 className="text-2xl font-semibold mb-5">🚀 Project Highlight</h1>
          <div className="flex flex-row w-full justify-center">
            <ProjectSlideshow />
          </div>
        </section>
      </main>

      {/* <h1 className="text-2xl">Hello World</h1> */}
    </main>
  );
}
