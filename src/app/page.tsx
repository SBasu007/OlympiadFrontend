import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Slideshow from "./components/Slideshow";

export default function Home() {
  const subjects = [
    { id: 9, name: "Mathematics", image: "/subjects/mathematics.png" },
    { id: 10, name: "Science", image: "/subjects/science.png" },
    { id: 11, name: "English", image: "/subjects/english.png" },
    { id: 13, name: "Computer", image: "/subjects/computer.png" },
    { id: 12, name: "General Knowledge", image: "/subjects/gk.png" },
    { id: 15, name: "Abacus", image: "/subjects/abacus.png" },
    { id: 69, name: "Essay", image: "/subjects/essay.png" },
    { id: 14, name: "Social Studies", image: "/subjects/socialstudies.png" },
  ];
  const natsubjects = [
    { id: 16, name: "Mathematics", image: "/subjects/mathematics.png" },
    { id: 17, name: "Science", image: "/subjects/science.png" },
    { id: 18, name: "English", image: "/subjects/english.png" },
    { id: 19, name: "Computer", image: "/subjects/computer.png" },
    { id: 20, name: "General Knowledge", image: "/subjects/gk.png" },
    { id: 21, name: "Abacus", image: "/subjects/abacus.png" },
    { id: 69, name: "Essay", image: "/subjects/essay.png" },
    { id: 22, name: "Social Studies", image: "/subjects/socialstudies.png" },
  ]; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="w-full mt-16">
        <Image
          src="/CTSShome.png"
          alt="Talent Search Olympiad"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-cover"
        />
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

      {/* State Level Exams Section */}
      <div className="w-full bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
            Talent Search Olympiad Exams State Level
          </h1>

          {/* Description */}
          <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">
            State level Talent Search Examination is designed to assess the overall intellectual potential of the students for Indian School Students From Class 1 to 10th Standard. It helps in improving the students' knowledge and makes their base strong. This question follows school board syllabus and are constructed by the subject experts
          </p>

          {/* Categories */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">We Have two Categories</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">ONLINE EXAM</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">OFFLINE EXAM</span>
            <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold">How it works</span>
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
            National level Talent Search Examination is designed to assess the overall intellectual potential of the students for Indian School Students From Class 1 to 10th Standard. It helps in improving the students' knowledge and makes their base strong. This question follows school board syllabus and are constructed by the subject experts
          </p>

          {/* Categories */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">We have only one Category</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">OFFLINE EXAM</span>
            <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold">How it works</span>
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
