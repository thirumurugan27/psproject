import React from 'react'
import Navbar from '../../components/navbar/navbar'
import userPS from '../../assets/userPS.png'
const mentee_list = [
  {
    mentee_name: "Rahul Mehta",
    mentee_email: "rahul.mehta@example.com",
    skill: "Python",
    level: 5
  },
  {
    mentee_name: "Ananya Iyer",
    mentee_email: "ananya.iyer@example.com",
    skill: "Machine Learning",
    level: 4
  },
  {
    mentee_name: "Irfan Qureshi",
    mentee_email: "irfan.qureshi@example.com",
    skill: "Java",
    level: 5
  },
  {
    mentee_name: "Meera Jain",
    mentee_email: "meera.jain@example.com",
    skill: "C++",
    level: 4
  },
  {
    mentee_name: "Zaid Shaikh",
    mentee_email: "zaid.shaikh@example.com",
    skill: "Python",
    level: 5
  },
  {
    mentee_name: "Vidya Krishnan",
    mentee_email: "vidya.krishnan@example.com",
    skill: "C",
    level: 4
  },
  {
    mentee_name: "Aditya Bansal",
    mentee_email: "aditya.bansal@example.com",
    skill: "Java",
    level: 5
  },
  {
    mentee_name: "Ritika Paul",
    mentee_email: "ritika.paul@example.com",
    skill: "Machine Learning",
    level: 4
  },
  {
    mentee_name: "Tanishq Rawat",
    mentee_email: "tanishq.rawat@example.com",
    skill: "C++",
    level: 5
  },
  {
    mentee_name: "Divya Sharma",
    mentee_email: "divya.sharma@example.com",
    skill: "Python",
    level: 4
  }
]


function NavMentee() {
  return (
    <div className='flex w-full h-screen'>
        <Navbar/>
        <div className="flex-1 flex flex-col">
        <header className=" h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
            PS Mentorship
        </header>
        <main className='p-6 overflow-y-auto bg-gray-100 flex-1 w-full h-full'>
            { mentee_list.length===0 && <p className='text-[#5F6388] text-center text-lg'>No options</p> } 

            {
            mentee_list.length!==0 &&
            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:px-7 pb-5'>
              {
              mentee_list.map((data,id)=>(
                            <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                                <div className="flex flex-row">
                                <img src={userPS}  alt="user" className="w-17 h-17 m-2 bg-gray-300 rounded-full"/>
                                  <div className="flex flex-col justify-center sm:ml-4">
                                      <h3 className="text-xl font-semibold">{data.mentee_name}</h3>
                                      <p className="text-base text-gray-600">{data.mentee_email}</p> 
                                      <p className='text-base'>Mentee applied for</p>
                                      <p className='font-medium flex text-[16px]'>{data.skill}<span className='pl-1'><p>level {data.level}</p></span></p>    {/*this is for setting mentor_review*/}
                                  </div>
                                </div>
                          </div>
              ))
              }
            </div>

            } 
        </main>
    </div>
    </div>
  )
}

export default NavMentee
