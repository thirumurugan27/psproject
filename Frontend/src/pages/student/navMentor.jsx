import React from 'react'
import Navbar from '../../components/navbar/navbar'
import userPS from '../../assets/userPS.png'

const mentor_details = [
  {
    'name':"Gowtham J",
    'email':'gowthamj.al24@bitsathy.ac.in',
    'skill':'python',
    'level':'3',
    'startDate':'12-05-2025',
    'endDate':'19-05-2025'
  }
]
function NavMentor() {
  return (
    <div className='flex h-screen w-full'>
        <Navbar/>
        <div className="flex-1 flex flex-col">
        <header className=" h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
            PS Mentorship
        </header>
        <main className="p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center lg:items-center">
          {mentor_details === 0 && <p className='text-[#5F6388] text-center text-lg'>No options</p>}

        {mentor_details !== 0 && mentor_details.map((data, id) => (
  <div key={id} className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center">
      {/* Profile Image */}
      <img
        src={userPS}
        alt="Mentor"
        className="w-20 h-20 rounded-full border border-gray-300 shadow-sm mx-auto sm:mx-0"
      />

      {/* Mentor Info */}
      <div className="sm:ml-5 mt-4 sm:mt-0 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-gray-800">{data.name}</h3>
        <p className="text-base text-gray-600">{data.email}</p>

        {/* Mentorship Duration */}
        <div className="mt-3 text-base text-gray-700">
          <p className="font-medium">Duration of mentorship:</p>
          <p className="text-gray-600">
            {data.startDate} to {data.endDate}
          </p>
        </div>

        {/* Skill and Level */}
        <p className="text-base mt-2 text-gray-700">
          Skill: <span className="text-indigo-600 font-medium">{data.skill}</span> | Level: <span className="font-medium">{data.level}</span>
        </p>

        {/* Status */}
        <span className="inline-block mt-4 px-4 py-1.5 text-sm font-semibold bg-green-100 text-green-700 rounded-full">
          Ongoing
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
