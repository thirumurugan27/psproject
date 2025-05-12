import React, { useEffect, useState } from 'react'
import Navbar from '../../components/navbar/navbar'
import userPS from '../../assets/userPS.png'
import axios from 'axios'

function NavMentee() {

  const [mentee_list,setMentee_list] = useState([]);
  useEffect(()=>{
    async function GetMenteeDetails() {
      try{
        const response = await axios.get(`http://localhost:5000/mentor/menteeslist/${localStorage.getItem('email')}`);
        console.log('Mentees details: ',response.data);
        setMentee_list(response.data);
      }
      catch(err)
      {console.log(err)}
    }
    GetMenteeDetails();
  },[])
  return (
    <div className='flex w-full h-screen'>
        <Navbar/>
        <div className="flex-1 flex flex-col">
        <header className=" h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
            PS Mentorship
        </header>
<main className={`p-6 overflow-y-auto bg-gray-100 flex-1 w-full h-full ${mentee_list.length === 0 ? 'flex lg:items-center justify-center' : ''}`}>
  {
    mentee_list.length === 0 ? (
      <p className='text-[#5F6388] text-center text-lg'>No mentorship history found</p>
    ) : (
      <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:px-7 pb-5'>
        {
          mentee_list.map((data, id) => (
            <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
              <div className="flex flex-row">
                <img src={userPS} alt="user" className="w-17 h-17 m-2 bg-gray-300 rounded-full" />
                <div className="flex flex-col justify-center sm:ml-4">
                  <h3 className="text-xl font-semibold">{data.mentee_name}</h3>
                  <p className="text-base text-gray-600">{data.mentee_email}</p>
                  <p className='text-base'>Mentee applied for</p>
                  <p className='font-medium flex text-[16px]'>{data.language_name}<span className='pl-1'>level {data.mentee_level}</span></p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }
</main>

    </div>
    </div>
  )
}

export default NavMentee
