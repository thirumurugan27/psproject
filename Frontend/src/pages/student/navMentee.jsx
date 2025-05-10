import React from 'react'
import Navbar from '../../components/navbar/navbar'

function NavMentee() {
  return (
    <div className='flex w-full h-screen'>
        <Navbar/>
        <div className="flex-1 flex flex-col">
        <header className=" h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
            PS Mentorship
        </header>
        <main className='p-6 overflow-y-auto bg-gray-100 flex-1 w-full h-full'>
            <p className='text-[#5F6388] text-center'>No options</p>
        </main>
    </div>
    </div>
  )
}

export default NavMentee
