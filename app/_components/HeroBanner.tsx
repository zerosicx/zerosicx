import { cn } from "@/lib/utils";
import { Sacramento } from "next/font/google";
import Image from "next/image";
import { cld } from "../CloudinaryProvider";

const sacramentoFont = Sacramento({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cursive",
});

interface HeroBannerProps {
  title: string;
  imageUrl?: string;
}

const HeroBanner = (props: HeroBannerProps) => {
  // Get background image
  const backgroundImg = cld.image("hero-bg_e7xlrz").toURL();

  return (
    <section className="md:mb-[100px]">
      <section
        className={cn(
          sacramentoFont.className,
          "bg-cover h-[25vh] w-full flex flex-col items-center justify-center hidden md:block"
        )}
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        <h1 className="text-4xl text-white text-center mb-2 absolute left-[375px] top-[200px]">
          <span>{props.title}</span>
        </h1>
        {props.imageUrl && (
          <Image
            height={200}
            width={200}
            className="z-50 absolute left-[200px] top-40"
            src={props.imageUrl}
            alt="profile image"
            style={{ height: "150px", width: "150px" }}
          ></Image>
        )}
      </section>
      <section
        className={cn(
          sacramentoFont.className,
          "md:hidden bg-[url(/hero-bg.jpeg)] bg-cover h-[30vh] w-full flex flex-col items-center justify-center"
        )}
      >
        <h1 className="text-4xl text-white text-center mb-2">
          <span>{props.title}</span>
        </h1>
        {props.imageUrl && (
          <Image
            height={200}
            width={200}
            className="z-50"
            src={props.imageUrl}
            alt="profile image"
            style={{ height: "150px", width: "150px" }}
          ></Image>
        )}
      </section>
    </section>
  );
};

export default HeroBanner;
