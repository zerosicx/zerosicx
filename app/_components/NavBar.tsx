"use client";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {};

const NavBar = (props: Props) => {
  const scrolled = useScrollTop();

  return (
    <nav
      className={cn(
        "h-[60px] w-full flex flex-row items-center justify-between z-50 bg-background sticky top-0 p-5 md:p-0",
        scrolled && "border-b shadow-sm"
      )}
    >
      <h1 className="text-2xl font-bold">ZEROSICX</h1>
      <div>
        <Image
          width={100}
          height={100}
          src="/profilePic.png"
          alt="profile-image"
          style={{ height: "45px", width: "auto" }}
        />
      </div>
    </nav>
  );
};

export default NavBar;
