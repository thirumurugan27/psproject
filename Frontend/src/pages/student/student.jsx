import React from "react";
import { Menu,X } from "lucide-react";
import { useState } from "react";
import ps from '../../assets/ps.png'

import mentor from '../../assets/help.png'
import mentee from '../../assets/mentee.png'
import logout from '../../assets/logout.png'
import profile from '../../assets/avatar.png'

import c from '../student/skills_img/c.png'
import c_class from '../student/skills_img/c++.png'
import data_struct from '../student/skills_img/data_struct.png'
import java from '../student/skills_img/java.png'
import ml  from '../student/skills_img/ml.png'
import networking from '../student/skills_img/networking.png'
import python  from '../student/skills_img/python.png'
import uiux  from '../student/skills_img/uiux.png'
import Navbar from "../../components/navbar/navbar";

// Dummy course list with image paths (replace with actual paths or URLs)

const courses = [
    {
      title: "C",
      level:1,
      image: c,
    },
    {
      title: "Data Structures",
      level:2,
      image: data_struct,
    },
    {
      title: "C++",
      level:3,
      image: c_class,
    },
    {
      title: "Java",
      level:4,
      image: java,
    },
    {
      title: "Machine Learning",
      level:1,
      image: ml,
    },
    {
      title: "Networking Skill",
      level:2,
      image: networking,
    },
    {
      title: "Python Programming",
      level:4,
      image: python,
    },
    {
      title: "UI/UX Design",
      level:1,
      image: uiux,
    },
  ];

  const navbar = [
    {'i':profile ,'name':'profile'}, 
    {'i':mentor ,'name':'mentor'},
    {'i':mentee, 'name':'mentee'},
    {'i':logout, 'name':'logout'}
  ]
function Courses() {
  const [hamburger,setHamburger] = useState(false);
  const [mentor_btn, setMentor_btn] = useState(false);
  const [mentor_request,set_mentor_request] = useState("pending");
  const [mentee_btn ,setMentee_btn] = useState(false);
  const [mentee_request,set_mentee_request] = useState("pending");


return (
<div className="flex h-screen w-full">
<Navbar/>
    <div className="flex-1 flex flex-col">
    <header className=" h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
        PS Mentorship
    </header>

    {/* Main Page Content */}
    <main className="p-6 overflow-y-auto bg-gray-100 flex-1">
      
        <h2 className="text-xl font-medium mb-4 text-[#5F6388]">Courses Available</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {
        !mentor_btn && courses.map((course, index) => (
            <div key={index} className=" p-[15px] bg-white rounded-lg shadow-md overflow-hidden">
              <img src={course.image} alt={course.title} className="h-[200px] w-full lg:w-full lg:h-[200px] object-cover rounded-sm"/>
              <div className="p-3">
                  <h2 className="text-lg lg:text-[18px] font-medium text-gray-700">{course.title} level- {course.level}</h2>
              </div>

              {/* mentor or mentee btn */}
                {
                course.level>=2?
                <div className="flex w-full gap-2" on={()=>setMentor_btn(false)}>
                    {!mentor_btn && 
                    <>
                      <div onClick={()=>setMentor_btn(true) } className="rounded-sm bg-emerald-700 text-white flex-1 text-center p-1 hover:cursor-pointer hover:bg-emerald-800">
                          mentor
                        </div>
                        <div className="rounded-sm bg-blue-800 text-white flex-1 text-center p-1 hover:cursor-pointer hover:bg-blue-900">
                          mentee
                        </div>
                    </>
                      }
                      {
                        mentor_btn &&
                      <>
                          <div className="rounded-sm bg-emerald-700 text-white flex-1 text-center p-1">
                            mentor
                          </div>
                          <div className={`rounded-sm ${mentor_request === "accepted" ? "bg-green-800":mentor_request === "rejected"?"bg-red-600":"bg-orange-400"} text-white flex-1 text-center p-1`}>
                            <p>{mentor_request === "accepted" ? "ongoing":mentor_request === "rejected"?"rejected":"pending"}</p>
                          </div>
                      </>
                      }
                </div>
                  :
                <div className="rounded-sm bg-blue-800 text-white flex-1 text-center p-1 hover:cursor-pointer hover:bg-blue-900">
                  mentee
                </div>
                }
              </div>
        ))}
        </div>
    </main>
    </div>
</div>
);
}

export default Courses;
