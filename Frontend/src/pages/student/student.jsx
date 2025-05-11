import React, { useEffect } from "react";
import { Menu,X } from "lucide-react";
import { useState } from "react";
import axios from "axios";

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
import SkillsCard from "./skills_card";

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

  useEffect(()=>{
    async function GetAllSkill() {
      try{
        const response = await axios.get(`http://localhost:5000/student/levels/${localStorage.getItem("email")}`)
        console.log("response: ",response.data);
      }
      catch (err)
      {
        console.error(err);
      }
    }
    GetAllSkill();

  },[])

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
        courses.map((course, index) => (
          <SkillsCard index={index} course={course}/>
        ))
        }
        </div>
    </main>
    </div>
</div>
);
}

export default Courses;
