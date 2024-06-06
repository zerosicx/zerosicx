"use client";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { scale } from "@cloudinary/url-gen/actions/resize";
import Image from "next/image";
import { cld } from "../CloudinaryProvider";

type Props = {};

const NavBar = (props: Props) => {
  const scrolled = useScrollTop();

  // Get profile pic
  const profilePic = cld
    .image("profilePic_rubvv7")
    .resize(scale().width(50))
    .toURL();

  return (
    <nav
      className={cn(
        "h-[60px] w-full flex flex-row items-center justify-between z-[9999] bg-background sticky top-0 p-5 lg:p-0",
        scrolled && "border-b shadow-sm"
      )}
    >
      <h1 className="text-2xl font-bold">ZEROSICX</h1>
      <div>
        <Image
          width={100}
          height={100}
          src={profilePic}
          alt="profile-image"
          style={{ height: "45px", width: "auto" }}
        />
      </div>
    </nav>
  );
};

export default NavBar;
