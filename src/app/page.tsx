import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="w-full pt-16">
        <Image
          src="/CTSShome.png"
          alt="Talent Search Olympiad"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
