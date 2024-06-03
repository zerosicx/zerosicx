"use client";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";
import projectData from "../../data/projects.json";

type ProjectDataType = {
  id: string;
  name: string;
  description: string;
  company: string;
  iconUrl?: string;
  imageUrl?: string;
  tags: string[] | undefined;
  link?: string;
};

export function ProjectSlideshow() {
  const projects: ProjectDataType[] = projectData.projects;
  const router = useRouter();

  const handleLearnMoreButton = (id: string) => {
    router.push(`/projects/${id}`);
  };

  return (
    <Carousel className="w-[80%]">
      <CarouselContent className="">
        {projects.map((project, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex flex-row items-center p-6 gap-2">
                  {project.imageUrl && (
                    <Image
                      width={250}
                      height={250}
                      src={project.imageUrl}
                      className="w-[40%] h-full bg-slate-600"
                      alt={`${project.name} image`}
                    ></Image>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                      {project.iconUrl && (
                        <Image
                          width={45}
                          height={45}
                          src={project.iconUrl}
                          alt={`${project.company} logo`}
                          className="w-4 h-4"
                        />
                      )}

                      <h3 className="text-lg font-medium">{project.company}</h3>
                    </div>
                    <h2 className="text-2xl font-medium">{project.name}</h2>
                    <p>{project.description}</p>
                    <div className="flex flex-row flex-wrap gap-2 my-2">
                      {project.tags &&
                        project.tags.map((tag, index) => {
                          return (
                            <Badge variant="secondary" key={index}>
                              {tag}
                            </Badge>
                          );
                        })}
                    </div>
                    <div className="flex flex-row gap-2">
                      <Button onClick={() => handleLearnMoreButton(project.id)}>
                        Learn More
                      </Button>
                      {project.link && (
                        <Button
                          variant="zerosicx"
                          onClick={() => router.push(project.link || "")}
                        >
                          See in Action
                        </Button>
                      )}
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
