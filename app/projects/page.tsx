"use client";
import HeroBanner from "../_components/HeroBanner";
import NavBar from "../_components/NavBar";
import { ProjectSlideshow } from "../_components/ProjectSlideshow";

type Props = {};

const ProjectsPage = (props: Props) => {
  return (
    <div>
      <NavBar />
      <HeroBanner title={"Projects"} imageUrl="/project-header-image.png" />
      <main className="px-5">
        <section className="flex flex-col gap-2 mb-3 mt-10">
          <h1 className="text-2xl font-semibold">🚀 Project Highlight</h1>
          <p>
            My proudest projects comprise of making real-world impact in the
            Software industry.
          </p>
          <div className="flex flex-row w-full justify-center">
            <ProjectSlideshow />
          </div>
        </section>
        <section className="flex flex-col gap-2 mb-3 mt-10">
          <h1 className="text-2xl font-semibold">🔮 Personal Projects</h1>
          <p>Core personal projects undetaken to upskill, learn, and grow.</p>
          <div className="flex flex-row w-full justify-center">
            <ProjectSlideshow config="personal" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectsPage;
