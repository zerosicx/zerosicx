import HeroBanner from "./_components/HeroBanner";
import NavBar from "./_components/NavBar";
import { ProjectSlideshow } from "./_components/ProjectSlideshow";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-2">
      <NavBar />
      <HeroBanner></HeroBanner>
      <ProjectSlideshow />
      {/* <h1 className="text-2xl">Hello World</h1> */}
    </main>
  );
}
