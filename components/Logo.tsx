import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = React.HTMLAttributes<HTMLParagraphElement>;

const Logo = ({ className, ...props }: LogoProps) => {
  return (
    <Link href="/" className="leading-none select-none">
      <p className={cn("text-4xl sm:text-5xl font-bold font-title", className)} {...props}>
        stackCount
        <span className="text-primary text-2xl sm:text-3xl">.io</span>
      </p>
    </Link>
  );
};

export default Logo;
