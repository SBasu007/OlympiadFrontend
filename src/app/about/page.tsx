import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Introduction Paragraph */}
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
            <p>
              Talent Search Olympiad is a leading Olympiad Examination in India that conducted by SMART TALENT. Olympiad exams and scholarship exams that follows the academic subjects which includes the topics adhere to the school board syllabus.
            </p>

            {/* Exams Offered */}
            <p>
              Our major Olympiad exams are Science Olympiad, Maths Olympiad, English Olympiad, General Knowledge Olympiad (GK), Computer Olympiad, Social Studies Olympiad, Drawing Olympiad, Abacus Olympiad and Essay Olympiad. Students are given a platform to showcase their ability of learning and increases potential in performing efficiently in their preferred subject and earn lots of Prizes. Olympiads in India are of a great help in the preparing students mentally to take up the challenges and promote the learning skills in the subjects the student wants to excel in.
            </p>

            {/* Assessment */}
            <p>
              Talent Search Olympiad is a scientifically designed, skill-based assessment test to get the strengths and weaknesses of individual students.
            </p>

            {/* Scope */}
            <p>
              Talent Search Olympiad is designed to assess the overall intellectual potential of the students from class 1 to 12.
            </p>

            {/* Types */}
            <p className="font-semibold text-[#253b70] text-sm">
              Talent Search Olympiad is of two type :-
            </p>

            {/* Types Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Type 1 */}
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#253b70]">
                <h3 className="text-lg font-bold text-[#253b70] mb-3">
                  For direct/individual candidates
                </h3>
                <p className="text-gray-700 text-sm">
                  Open to all the students of class 1 to 12. Any student can participate in Talent Search Olympiad by registering online. You can participate in this test from the comfort of your home. You need a laptop or desktop or tablet with webcam and live internet connection.
                </p>
              </div>

              {/* Type 2 */}
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#253b70]">
                <h3 className="text-lg font-bold text-[#253b70] mb-3">
                  Paper-based/Online only through schools
                </h3>
                <p className="text-gray-700 text-sm">
                  Register through your school. Ask you teacher for Talent Search Olympiad exam form.We also Provide Research based Study Materials for All Exam All year All subjects. We have a Second Section Called TOPPERS ONLINE This is a training And Mock test Section From where we are providing Training through Study Materials and Mock Tests in Each Subjects.
                </p>
              </div>
            </div>

            {/* Additional Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="font-semibold text-[#253b70] mb-3 text-sm">
                We also have a one more section :-
              </p>
              <p className="text-sm">
                Designed to assess the overall potential of the students in Various Entrance Examination Like NID, NIFT, CLAT, JEE States, JEE Main, NEET and Many More also Online Preparations in SSC Bank Railways Central and State Government It helps in improving the students' knowledge and Improving Online Test, Mock Tests/Quiz, Solving Method,Shortcut Tricks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}