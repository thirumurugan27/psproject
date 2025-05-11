import React from 'react'
import { useState } from 'react';

import c from '../student/skills_img/c.png'
import c_class from '../student/skills_img/c++.png'
import data_struct from '../student/skills_img/data_struct.png'
import java from '../student/skills_img/java.png'
import ml  from '../student/skills_img/ml.png'
import networking from '../student/skills_img/networking.png'
import python  from '../student/skills_img/python.png'
import uiux  from '../student/skills_img/uiux.png'

function SkillsCard({course}) {
    const [mentor_btn, setMentor_btn] = useState(false);
    const [mentor_request,set_mentor_request] = useState("pending");
    const [mentee_btn ,setMentee_btn] = useState(false);
    const [mentee_request,set_mentee_request] = useState("pending");
    return (
    <div className=" p-[15px] bg-white rounded-lg shadow-md overflow-hidden">
    <img src={course.language_name==='C'?c :
    course.language_name==='C++'?c_class :
    course.language_name==='Data Structure'?data_struct :
    course.language_name==='Java'?java :
    course.language_name==='Machine Learning'?ml :
    course.language_name==='Networking'?networking :
    course.language_name==='Python'?python :
    course.language_name==='UI/UX'?uiux :
    ''} alt={course.language_name} className="h-[200px] w-full lg:w-full lg:h-[200px] object-cover rounded-sm"/>
    <div className="p-3">
        <h2 className="text-lg lg:text-[18px] font-medium text-gray-700">{course.language_name} level- {course.level}</h2>
    </div>

    {/* mentor or mentee btn */}
      {
      course.level>=2?
      <div className="flex w-full gap-2" onClick={()=>setMentor_btn(false)}>
          {
          !mentor_btn && <>
            <div onClick={()=>setMentor_btn(true)} className="rounded-sm bg-[#7D53F6] hover:bg-[#5e3ed1] text-white flex-1 text-center p-1 hover:cursor-pointer">
                mentor
              </div>
              <div className="rounded-sm bg-[#2DC4B6] hover:bg-[#25a99f]  text-white flex-1 text-center p-1 hover:cursor-pointer ">
                mentee
              </div>
          </>
            }
            {
              mentor_btn &&
            <>
                <div className="rounded-sm bg-[#7D53F6] text-white flex-1 text-center p-1">
                    mentor
                </div>
                <div className={`rounded-sm ${mentor_request === "accepted" ? "bg-green-800":mentor_request === "rejected"?"bg-red-600":"bg-orange-400"} text-white flex-1 text-center p-1`}>
                    <p>{mentor_request === "accepted" ? "ongoing":mentor_request === "rejected"?"rejected":"pending"}</p>
                </div>
            </>
            }
      </div>
        :
      <div className="rounded-sm bg-[#2DC4B6] hover:bg-[#25a99f] text-white flex-1 text-center p-1 hover:cursor-pointer">
        mentee
      </div>
      }
    </div>
  )
}

export default SkillsCard
