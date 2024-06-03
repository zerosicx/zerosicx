import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import projectData from "../../data/projects.json";

type ProjectDataType = {
  id: string;
  name: string;
  description: string;
  company: string;
  iconUrl: string;
  imageUrl: string;
  tags: string[];
};

export function ProjectSlideshow() {
  const projects: ProjectDataType[] = projectData.projects;

  return (
    <Carousel className="w-full max-w-lg">
      <CarouselContent className="">
        {projects.map((project, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex flex-row items-center justify-center p-6 gap-2">
                  <Image
                    width={100}
                    height={100}
                    src={project.imageUrl}
                    className="w-[70%] h-full bg-slate-600"
                    alt={`${project.name} image`}
                  ></Image>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                      <Image
                        width={45}
                        height={45}
                        src={project.iconUrl}
                        alt={`${project.company} logo`}
                        className="w-4 h-4"
                      />
                      <h3 className="text-lg font-medium">{project.company}</h3>
                    </div>

                    <h2 className="text-2xl font-medium">{project.name}</h2>
                    <p>{project.description}</p>
                    <div className="flex flex-row gap-2">
                      <Button>Learn More</Button>
                      <Button variant="zerosicx">See in Action</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
