"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Slideshow from "./components/Slideshow";
import RotatingText from "./components/RotatingText";
import { use, useCallback, useEffect, useState } from "react";

export default function Home() {
  const subjects = [
    { id: 9, name: "Mathematics", image: "/subjects/mathematics.png" },
    { id: 10, name: "Science", image: "/subjects/science.png" },
    { id: 11, name: "English", image: "/subjects/english.png" },
    { id: 13, name: "Computer", image: "/subjects/computer.png" },
    { id: 12, name: "General Knowledge", image: "/subjects/gk.png" },
    { id: 15, name: "Abacus", image: "/subjects/abacus.png" },
    { id: 69, name: "Drawing", image: "/subjects/drawing.png" },
    { id: 14, name: "Social Studies", image: "/subjects/socialstudies.png" },
  ];
  const natsubjects = [
    { id: 16, name: "Mathematics", image: "/subjects/mathematics.png" },
    { id: 17, name: "Science", image: "/subjects/science.png" },
    { id: 18, name: "English", image: "/subjects/english.png" },
    { id: 19, name: "Computer", image: "/subjects/computer.png" },
    { id: 20, name: "General Knowledge", image: "/subjects/gk.png" },
    { id: 21, name: "Abacus", image: "/subjects/abacus.png" },
    { id: 69, name: "Drawing", image: "/subjects/drawing.png" },
    { id: 22, name: "Social Studies", image: "/subjects/socialstudies.png" },
  ]; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      {/* <div className="w-full mt-16">
        <Image
          src="/CTSShome.png"
          alt="Talent Search Olympiad"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-cover"
        />
      </div> */}

      {/* LOGIN + REGISTER */}
    {/* <div className="flex gap-4 mb-6 flex-wrap justify-center">

      <Link
        href="/login"
        className="bg-[#253b70] text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-[#1d2f58] transition"
      >
        Login
      </Link>

      <Link
        href="/register"
        className="bg-white border border-[#253b70] text-[#253b70] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
      >
        Register
      </Link>

    </div> */}
 {/* HERO BACKGROUND WRAPPER */}
<div className="relative w-full mt-16 overflow-hidden bg-gradient-to-br from-[#dbe4ff] via-white to-[#eef2fb]">

  {/* BLUE GLOW */}
  <div className="absolute -top-24 -left-24 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-[#253b70]/25 md:bg-[#253b70]/40 rounded-full blur-[90px] md:blur-[140px]"></div>

  {/* ORANGE GLOW */}
  <div className="absolute bottom-0 right-0 w-[250px] h-[250px] md:w-[450px] md:h-[450px] bg-orange-400/25 md:bg-orange-400/40 rounded-full blur-[80px] md:blur-[120px]"></div>

  {/* CENTER RADIAL LIGHT */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,59,112,0.08),transparent_70%)] md:bg-[radial-gradient(circle_at_center,rgba(37,59,112,0.12),transparent_60%)]"></div>

  {/* FLOATING EDUCATIONAL SYMBOLS */}
  <div className="absolute inset-0 pointer-events-none text-[#253b70]/10 text-3xl md:text-5xl font-bold">

    <div className="absolute top-24 left-10 animate-pulse">π</div>
    <div className="absolute top-40 right-16 animate-pulse">∑</div>
    <div className="absolute bottom-32 left-16 animate-pulse">√</div>
    <div className="absolute bottom-24 right-24 animate-pulse">÷</div>
    <div className="absolute top-1/2 left-1/4 animate-pulse">×</div>

  </div>

  {/* HERO SECTION */}
  <div className="relative max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center">

    <RotatingText
      texts={[
        "Biggest Olympiad Competition",
        "Online and Offline Modes",
        "Thousands of Prizes to win!",
      ]}
      mainClassName="px-4 text-orange-500 text-lg md:text-2xl font-bold overflow-hidden py-2 justify-center rounded-lg"
      staggerFrom={"last"}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-120%" }}
      staggerDuration={0.025}
      splitLevelClassName="overflow-hidden pb-1"
      transition={{ type: "spring", damping: 30, stiffness: 400 }}
      rotationInterval={3000}
    />

    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
      Talent Search <span className="text-[#253b70]">Olympiad</span>
    </h1>

    <p className="text-gray-600 text-lg mb-10 max-w-2xl">
      Compete with students across India and test your knowledge in
      Mathematics, Science, English, Computer, GK and more.
      Open for students from <b>Class KG to Class 10.</b>
    </p>

    {/* DEMO BUTTON */}
    <Link
      href="/demo"
      className="bg-orange-500 text-white px-10 py-3 rounded-lg font-semibold shadow hover:bg-orange-600 transition mb-12"
    >
      Try Our Demo Exam
    </Link>

    {/* TRUST STATS */}
    <div className="flex gap-12 text-center flex-wrap justify-center">
      <div>
        <h3 className="text-2xl font-bold text-[#253b70]">50K+</h3>
        <p className="text-gray-600 text-sm">Students</p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#253b70]">300+</h3>
        <p className="text-gray-600 text-sm">Schools</p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#253b70]">10+</h3>
        <p className="text-gray-600 text-sm">Subjects</p>
      </div>
    </div>

  </div>
</div>

      {/* Marquee Section */}
      <div className="w-full bg-[#ff8a00] overflow-hidden py-1">
        <style>{`
          @keyframes scroll-right-to-left {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .marquee-text {
            animation: scroll-right-to-left 25s linear infinite;
            white-space: nowrap;
            display: inline-block;
          }
        `}</style>
        <div className="marquee-text text-white font-semibold text-base md:text-sm">
          Nation wide Talent Search Olympiad Examinations on Maths , Science , English ,General Knowledge, Computer , Essay , Abacus , Social Science State level will start from 1st July 2022
        </div>
      </div>

      {/* demo quiz section */}
        {/* <div className="w-full bg-white py-12"> 
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6"> 
              Try Our Free Demo Exam  
            </h1>
            <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">
              Experience the excitement of our Talent Search Olympiad with a free demo exam! Test your knowledge across subjects like Maths, Science, English, and more. Perfect for students from Class 1 to 10th Standard. Get a taste of the challenge and see how you stack up against the best!
            </p>
             <div className="flex justify-center">
      <Link
        href="/demo"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg"
      >
        Take the Demo Exam
      </Link>
    </div>  
          </div>
        </div> */}

      {/* State Level Exams Section */}
      <div className="w-full bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
            Talent Search Olympiad Exams State Level
          </h1>

          {/* Description */}
          <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">
            State level Talent Search Examination is designed to assess the overall intellectual potential of the students for Indian School Students From Class KG to 10th Standard. It helps in improving the students' knowledge and makes their base strong. This question follows school board syllabus and are constructed by the subject experts
          </p>

          {/* Categories */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">We Have two Categories</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">ONLINE EXAM</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">OFFLINE EXAM</span>
          </div>

          {/* Banner Section */}
          <div className="mb-12">
            <Slideshow 
              slides={[
                "/slideshow/stateslide1.png",
                "/slideshow/stateslide2.png",
                "/slideshow/stateslide3.png",
              ]}
              autoPlayInterval={5000}
            />
          </div>

          {/* Subjects and Certificate Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Subjects Grid - Left side on desktop, top on mobile */}
            <div className="w-full lg:flex-1">
              <div className="flex flex-wrap justify-center gap-6">
                {subjects.map((subject) => (
                  <a
                    key={subject.id}
                    href={`/subcategory/${subject.id}?category=${encodeURIComponent('State Level')}`}
                    className="flex flex-col items-center text-center hover:drop-shadow-lg transition-all duration-200"
                  >
                    <div className="w-40 h-40 relative mb-3 rounded-full overflow-hidden shadow-md hover:shadow-2xl transition-shadow">
                      <Image
                        src={subject.image}
                        alt={subject.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h6 className="text-sm md:text-base font-semibold text-gray-800">
                      {subject.name}
                    </h6>
                  </a>
                ))}
              </div>
            </div>

            {/* Certificate Section - Right side on desktop, bottom on mobile */}
            <div className="w-full lg:w-80 flex-shrink-0 mt-16">
              <div className=" p-6 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-full h-64 relative bg-gray-100 rounded-lg overflow-hidden shadow-lg mb-4">
                    <Image
                      src="/statecert.png"
                      alt="Certificate and Awards"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* National Level Exams Section */}
      <div className="w-full bg-white pb-12 pt-5">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
            Talent Search Olympiad Exams National Level
          </h1>

          {/* Description */}
          <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">
            National level Talent Search Examination is designed to assess the overall intellectual potential of the students for Indian School Students From Class KG to 10th Standard. It helps in improving the students' knowledge and makes their base strong. This question follows school board syllabus and are constructed by the subject experts
          </p>

          {/* Categories */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">We have only one Category</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">ONLINE EXAM</span>
          </div>

          {/* Banner Section */}
          <div className="mb-12">
            <Slideshow 
              slides={[
                "/slideshow/natslide1.png",
                "/slideshow/natslide2.png",
              ]}
              autoPlayInterval={5000}
            />
          </div>

          {/* Subjects and Certificate Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Subjects Grid - Left side on desktop, top on mobile */}
            <div className="w-full lg:flex-1">
              <div className="flex flex-wrap justify-center gap-6">
                {natsubjects.map((subject) => (
                  <a
                    key={subject.id}
                    href={`/subcategory/${subject.id}?category=${encodeURIComponent('National Level')}`}
                    className="flex flex-col items-center text-center hover:drop-shadow-lg transition-all duration-200"
                  >
                    <div className="w-40 h-40 relative mb-3 rounded-full overflow-hidden shadow-md hover:shadow-2xl transition-shadow">
                      <Image
                        src={subject.image}
                        alt={subject.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h6 className="text-sm md:text-base font-semibold text-gray-800">
                      {subject.name}
                    </h6>
                  </a>
                ))}
              </div>
            </div>

            {/* Certificate Section - Right side on desktop, bottom on mobile */}
            <div className="w-full lg:w-90 flex-shrink-0 mt-16">
              <div className=" p-6 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-full h-64 relative bg-gray-100 rounded-lg overflow-hidden shadow-lg mb-4">
                    <Image
                      src="/natcert.png"
                      alt="Certificate and Awards"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
