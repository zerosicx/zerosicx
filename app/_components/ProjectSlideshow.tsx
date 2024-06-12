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
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getCloudinaryImageURL } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

export type ProjectDataType = {
  _id: Id<"projects">;
  name: string;
  description: string;
  company: string;
  iconUrl?: string;
  imageUrl?: string;
  tags: string[] | undefined;
  link?: string;
};

interface ProjectSlideshowProps {
  config?: string;
}

export function ProjectSlideshow(props: ProjectSlideshowProps) {
  const projects: ProjectDataType[] | undefined = useQuery(
    props.config === "personal"
      ? api.projects.getPersonalProjects
      : api.projects.getProjects
  );

  const router = useRouter();

  const handleLearnMoreButton = (id: Id<"projects">) => {
    router.push(`/projects/${id}`);
  };

  return (
    <>
      {projects && (
        <Carousel className="w-[80%]">
          <CarouselContent className="">
            {projects?.map((project, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-row items-center p-6 gap-2 flex-wrap md:flex-nowrap">
                      {project.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getCloudinaryImageURL({
                            src: project.imageUrl,
                            width: 500,
                            quality: 100,
                          })}
                          className="w-[40%] h-full bg-slate-600"
                          alt={`${project.name} image`}
                        ></img>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center">
                          {project.iconUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getCloudinaryImageURL({
                                src: project.iconUrl,
                                width: 45,
                                quality: 75,
                              })}
                              alt={`${project.company} logo`}
                              className="w-4 h-4"
                            />
                          )}

                          <h3 className="text-lg font-medium">
                            {project.company}
                          </h3>
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
                          <Button
                            onClick={() => handleLearnMoreButton(project._id)}
                          >
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
      )}
    </>
  );
}
