import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import c from '../student/skills_img/c.png';
import c_class from '../student/skills_img/c++.png';
import data_struct from '../student/skills_img/data_struct.png';
import java from '../student/skills_img/java.png';
import ml from '../student/skills_img/ml.png';
import networking from '../student/skills_img/networking.png';
import python from '../student/skills_img/python.png';
import uiux from '../student/skills_img/uiux.png';

function SkillsCard({ course }) {
  const [popup, setPopup] = useState(false);
  const [mentor, setMentor] = useState();
  const navigate = useNavigate();

  const HandlePostMentor = async (email, skill) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/mentor/send-request",
        {
          student_email: email,
          language_name: skill,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Mentor request posted: ", response.data);
      window.location.reload();
    } catch (err) {
      console.log("Mentor request error:", err.response?.data || err.message);
    }
  };

  const PutMentorReject = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/mentor/view/${mentor?.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Rejection agreed: ", response.data);
      window.location.reload();
    } catch (err) {
      console.log("Reject error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const GetAllSkill = async () => {
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
        console.log("Skill Card: ", response.data.mentorrequest);
        setMentor(response.data.mentorrequest?.[0]);
      } catch (err) {
        console.error("Get skills error:", err.response?.data || err.message);
      }
    };

    GetAllSkill();
  }, []);
  
  const imageSrc =
    course.language_name === 'C' ? c :
    course.language_name === 'C++' ? c_class :
    course.language_name === 'Data Structure' ? data_struct :
    course.language_name === 'Java' ? java :
    course.language_name === 'Machine Learning' ? ml :
    course.language_name === 'Networking' ? networking :
    course.language_name === 'Python' ? python :
    course.language_name === 'UI/UX' ? uiux :
    '';

  const level = course.level ?? course.mentee_level ?? 0;
  return (
    <div className="p-[15px] bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={imageSrc}
        alt={course.language_name}
        className="h-[200px] w-full object-cover rounded-sm"
      />
      <div className="p-3">
        <h2 className="text-lg font-medium text-gray-700">
          {course.language_name} level - {Number(level)+1}
        </h2>
      </div>

      {/* Rejection Popup */}
      {popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
          onClick={() => setPopup(false)}
        >
          <div
            className="bg-white rounded-xl px-6 py-4 shadow-xl w-[90%] max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-xl font-medium pt-2 pb-4">PS Mentorship</h1>

            <h1 className="flex text-[#727272] text-lg">
              Name: <span className="pl-2 text-black">{localStorage.getItem('name')}</span>
            </h1>

            <h1 className="flex text-[#727272] text-lg">
              Email: <span className="pl-2 text-black">{localStorage.getItem('email')}</span>
            </h1>

            <h1 className="flex text-[#727272] text-lg">
              Skill: <span className="pl-2 text-black">{mentor?.language_name}</span>
            </h1>

            <h1 className="flex text-[#727272] text-lg">
              Level: <span className="pl-2 text-black">{mentor?.level}</span>
            </h1>

            <hr className="mt-2 text-[#727272]" />

            <h1 className="mt-3 text-[#727272] text-lg">Reason</h1>

            <div className="w-full bg-[#EEF1F9] p-3 rounded text-black overflow-y-auto">
              {mentor?.rejection_reason}
            </div>

            <div
              className="bg-[#7D53F6] hover:cursor-pointer text-white text-center p-2 rounded-sm mt-4"
              onClick={PutMentorReject}
            >
              Accept
            </div>
          </div>
        </div>
      )}

      {/* Button Logic */}
      {course.role === 'mentor' && course.status === 'pending' ? (
        <div className="flex w-full gap-2">
          <div className="rounded-sm bg-[#7D53F6] text-white flex-1 text-center p-1">Mentor</div>
          <div className="rounded-sm bg-orange-400 text-white flex-1 text-center p-1">Pending</div>
        </div>
      ) : course.role === 'mentor' && course.status === 'rejected' ? (
        <div className="flex w-full gap-2">
          <div className="rounded-sm bg-[#7D53F6] text-white flex-1 text-center p-1">Mentor</div>
          <div
            className="rounded-sm bg-red-500 text-white flex-1 text-center p-1 hover:cursor-pointer"
            onClick={() => setPopup(true)}
          >
            Rejected
          </div>
        </div>
      ) : course.role==='mentee' && course.status === 'pending' ? (
        <div className="flex w-full gap-2">
          <div className="rounded-sm bg-[#2DC4B6] text-white flex-1 text-center p-1 hover:cursor-pointer hover:bg-[#25a99f]" onClick={()=>{navigate('/login/student/mycourses/mentor_request'),localStorage.setItem('language_name',course.language_name)}}>Mentee</div>
          <div className="rounded-sm bg-orange-400 text-white flex-1 text-center p-1">Pending</div>
        </div>
      ) : course.role==='mentor' && course.status==='ongoing' ? (
        <div className="flex w-full gap-2">
          <div
            className="rounded-sm bg-[#7D53F6] text-white flex-1 text-center p-1 hover:cursor-pointer hover:bg-[#5e3ed1]"
            onClick={() => navigate('/login/student/mycourses/mentee_request')}
          >
            Mentee requests
          </div>
          <div className="rounded-sm bg-green-200 text-green-600 flex-1 text-center p-1">Ongoing</div>
        </div>
      ) : course.role==='mentee' && course.status ==='ongoing' ? (
        <div className="flex w-full gap-2">
          <div className="rounded-sm bg-[#2DC4B6] text-white flex-1 text-center p-1">mentee</div>
          <div className="rounded-sm bg-green-200 text-green-600 flex-1 text-center p-1">Ongoing</div>
        </div>
      ) : course.level >= 2 ? (
        <div className="flex w-full gap-2">
          <div
            onClick={() => HandlePostMentor(localStorage.getItem('email'), course.language_name)}
            className="rounded-sm bg-[#7D53F6] hover:bg-[#5e3ed1] text-white flex-1 text-center p-1 hover:cursor-pointer"
          >
            Mentor
          </div>
          <div className="rounded-sm bg-[#2DC4B6] hover:bg-[#25a99f] text-white flex-1 text-center p-1 hover:cursor-pointer" onClick={()=>{navigate('/login/student/mycourses/mentor_request'),localStorage.setItem('language_name',course.language_name)}}>
            Mentee
          </div>
        </div>
      ) : (
        <div className="rounded-sm bg-[#2DC4B6] hover:bg-[#25a99f] text-white text-center p-1 hover:cursor-pointer" onClick={()=>{navigate('/login/student/mycourses/mentor_request'),localStorage.setItem('language_name',course.language_name)}}>
          Mentee
        </div>
      )}
    </div>
  );
}

export default SkillsCard;
