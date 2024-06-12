import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCloudinaryImageURL = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality: number;
}) => {
  // Use the CLOUDNAME from the environment variables
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Construct the URL with dynamic width and public name
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_${width}/${src}`;
};
