// student.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../../components/navbar/navbar";
import SkillsCard from "./skills_card";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [mentor, setMentor] = useState([]);
  const [mentee, setMentee] = useState([]);
  const [mentorReq, setMentorReq] = useState([]);
  const [menteeReq, setMenteeReq] = useState([]);
  const [popup, setPopup] = useState(false);
  const [selectedRejectedCourse, setSelectedRejectedCourse] = useState(null);

  useEffect(() => {
    async function GetAllSkill() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/student/levels/${localStorage.getItem(
            "email"
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("students : ", response.data);
        setCourses(response.data.levels);
        setMentor(response.data.mentor);
        setMentee(response.data.mentee);
        setMentorReq(response.data.mentorrequest);
        setMenteeReq(response.data.menteerequest);
      } catch (err) {
        console.error(
          "Error fetching skill data:",
          err.response?.data || err.message
        );
      }
    }

    GetAllSkill();
  }, []);
  
  console.log("mentee req: ",[menteeReq[0]])
  return (
    <div className="flex h-screen w-full">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <header className="h-[64px] bg-white px-10 py-4 shadow text-xl font-semibold sticky top-0 z-10">
          PS Mentorship
        </header>

        <main className="p-6 overflow-y-auto bg-gray-100 flex-1">
          <h2 className="text-xl font-medium mb-4 text-[#5F6388]">
            Courses Available
          </h2>
          {courses.length===0 && <p className="text-gray-600 text-center">Loading...</p>}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
  {(
    mentorReq.length
      ? mentorReq
      : menteeReq.length
      ? (menteeReq[0] ? [menteeReq[0]] : []) 
      : mentor.length
      ? mentor
      : mentee.length
      ? mentee
      : courses
  ).map((course, index) => (
    <SkillsCard
      key={index}
      id={index}
      course={course}
      onRejectClick={(course) => {
        setSelectedRejectedCourse(course);
        setPopup(true);
      }}
    />
  ))}

</div>

        </main>
      </div>
    </div>
  );
}

export default Courses;
