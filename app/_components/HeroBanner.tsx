import { cn } from "@/lib/utils";
import { Sacramento } from "next/font/google";
import Image from "next/image";

const sacramentoFont = Sacramento({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cursive",
});

type Props = {};

const HeroBanner = (props: Props) => {
  return (
    <section className="mb-[50px]">
      <section
        className={cn(
          sacramentoFont.className,
          "bg-[url(/hero-bg.jpeg)] bg-cover h-[25vh] w-full flex flex-col items-center justify-center hidden lg:block"
        )}
      >
        <h1 className="text-4xl text-white text-center mb-2 absolute left-[375px] top-[200px]">
          <span>I&apos;m Hannah</span>
        </h1>
        <Image
          height={200}
          width={200}
          className="z-50 absolute left-[200px] top-40"
          src="/zerosicx/profilePic.png"
          alt="profile image"
          style={{ height: "150px", width: "150px" }}
        ></Image>
      </section>
      <section
        className={cn(
          sacramentoFont.className,
          "lg:hidden bg-[url(/hero-bg.jpeg)] bg-cover h-[30vh] w-full flex flex-col items-center justify-center"
        )}
      >
        <h1 className="text-4xl text-white text-center mb-2">
          <span>I&apos;m Hannah</span>
        </h1>
        <Image
          height={200}
          width={200}
          className="z-50"
          src="/zerosicx/profilePic.png"
          alt="profile image"
          style={{ height: "150px", width: "150px" }}
        ></Image>
      </section>
    </section>
  );
};

export default HeroBanner;
