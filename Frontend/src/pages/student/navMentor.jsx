import React, { useEffect,useState } from 'react'
import Navbar from '../../components/navbar/navbar'
import userPS from '../../assets/userPS.png'
import axios from 'axios'
function NavMentor() {
  const [mentor_details,SetMentor_details] = useState([])

  useEffect(()=>{
    async function GetMentorDetail() {
      const response = await axios.get(`http://localhost:5000/mentee/mentor-detail/${localStorage.getItem('email')}`)
      console.log('mentor detail: ',response.data);
      SetMentor_details(response.data)
    }
    GetMentorDetail();
  },[])
  return (
    <div className='flex h-screen w-full'>
        <Navbar/>
        <div className="flex-1 flex flex-col">
        <header className=" h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
            PS Mentorship
        </header>
        <main className="p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center lg:items-center">
          {mentor_details.message && <p className='text-[#5F6388] text-lg'>{mentor_details.message || 'No mentorship history found'}</p>}

        {

      // "mentor_email": "thirumurugank.al24@bitsathy.ac.in",
      // "mentor_name": "Thirumurugan K",
      // "language_name": "C",
      // "mentor_level": 6,
      // "start_date": "27-04-2025",
      // "end_date": "03-05-2025",
      // "status": "ongoing"

        !mentor_details.message && mentor_details.map((data, id) => (
  <div key={id} className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto mb-6 h-fit">
    <div className="flex flex-col sm:flex-row sm:items-center">
      {/* Profile Image */}
      <img src={userPS} alt="Mentor" className="w-20 h-20 rounded-full border border-gray-300 shadow-sm mx-auto sm:mx-0"/>

      {/* Mentor Info */}
      <div className="sm:ml-5 mt-4 sm:mt-0 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-gray-800">{data.mentor_name}</h3>
        <p className="text-base text-gray-600">{data.mentor_email}</p>

        {/* Mentorship Duration */}
        <div className="mt-3 text-base text-gray-700">
          <p className="font-medium">Duration of mentorship:</p>
          <p className="text-gray-600">
            {data.start_date} to {data.end_date}
          </p>
        </div>

        {/* Skill and Level */}
        <p className="text-base mt-2 text-gray-700">
          Skill: <span className="text-indigo-600 font-medium">{data.language_name}</span> | Level: <span className="font-medium">{data.mentor_level}</span>
        </p>

        {/* Status */}
        <span className={`inline-block mt-4 px-4 py-1.5 text-sm font-semibold ${data.status === 'ongoing'?'bg-green-100':'bg-red-100'} ${data.status === 'ongoing'?'text-green-700':'text-red-700'} rounded-full`}>
          {data.status}
        </span>
      </div>
    </div>
  </div>
))}


        </main>
    </div>
    </div>
  )
}

export default NavMentor
