import { cn } from "@/lib/utils";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { Sacramento } from "next/font/google";
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
  const backgroundImg = cld
    .image("hero-bg_e7xlrz")
    .resize(scale().width(500))
    .toURL();

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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="z-50 h-[150px] w-[150px] absolute left-[200px] top-40"
            src={props.imageUrl}
            alt="profile image"
          ></img>
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="z-50 h-[150px] w-[150px]"
            src={props.imageUrl}
            alt="profile image"
          ></img>
        )}
      </section>
    </section>
  );
};

export default HeroBanner;
