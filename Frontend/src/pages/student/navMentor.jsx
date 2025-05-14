import React, { useEffect, useState } from 'react'
import Navbar from '../../components/navbar/navbar'
import userPS from '../../assets/userPS.png'
import axios from 'axios'

function NavMentor() {
  const [mentor_details, SetMentor_details] = useState([])
  const [mentorBooked_slot, setMentorBooked_slot] = useState([])
  const [showVenuePopup, setShowVenuePopup] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)

  useEffect(() => {
    async function GetMentorDetail() {
      const response = await axios.get(
        `http://localhost:5000/mentee/mentor-detail/${localStorage.getItem('email')}`
      )
      console.log('mentor detail: ', response.data)
      SetMentor_details(response.data)
    }

    async function GetMenteeSlot() {
      const response = await axios.get(
        `http://localhost:5000/mentee/slot/${localStorage.getItem('email')}`
      )
      console.log('mentee - slot booked by mentor : ', response.data)
      setMentorBooked_slot(response.data)
    }

    GetMenteeSlot()
    GetMentorDetail()
  }, [])

  async function PostFeedback_to_mentor() {
    try{
      const response = await axios.post(`http://localhost:5000/mentee/slot/${localStorage.getItem('email')}`)
      console.log('mentee feedback to mentor status: ', response.data)
    }
    catch(err)
    {console.log(err)}
  }

  return (
    <div className='flex h-screen w-full'>
      <Navbar />
      <div className='flex-1 flex flex-col'>
        <header className='h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10'>
          PS Mentorship
        </header>
        <main className='p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center lg:items-center flex-col'>

          {/* If no mentor found */}
          {mentor_details.message && (
            <p className='text-[#5F6388] text-lg'>
              {mentor_details.message || 'No mentorship history found'}
            </p>
          )}

          {/* Mentor Card */}
          {!mentor_details.message &&
            mentor_details.map((data, id) => (
              <div
                key={id}
                className='bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto mb-6 h-fit'
              >
                <div className='flex flex-col sm:flex-row sm:items-center'>
                  {/* Profile Image */}
                  <img
                    src={userPS}
                    alt='Mentor'
                    className='w-20 h-20 rounded-full border border-gray-300 shadow-sm mx-auto sm:mx-0'
                  />

                  {/* Mentor Info */}
                  <div className='sm:ml-5 mt-4 sm:mt-0 text-center sm:text-left'>
                    <h3 className='text-2xl font-bold text-gray-800'>
                      {data.mentor_name}
                    </h3>
                    <p className='text-base text-gray-600'>
                      {data.mentor_email}
                    </p>

                    {/* Mentorship Duration */}
                    <div className='mt-3 text-base text-gray-700'>
                      <p className='font-medium'>Duration of mentorship:</p>
                      <p className='text-gray-600'>
                        {data.start_date} to {data.end_date}
                      </p>
                    </div>

                    {/* Skill and Level */}
                    <p className='text-base mt-2 text-gray-700'>
                      Skill:{' '}
                      <span className='text-indigo-600 font-medium'>
                        {data.language_name}
                      </span>{' '}
                      | Level:{' '}
                      <span className='font-medium'>{data.mentor_level}</span>
                    </p>

                    {/* Status */}
                    <span
                      className={`inline-block mt-4 px-4 py-1.5 text-sm font-semibold ${
                        data.status === 'ongoing'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      } rounded-full`}
                    >
                      {data.status}
                    </span>
                    <span
                      className={`inline-block mt-4 px-4 py-1.5 text-sm font-semibold ml-2 ${
                        mentorBooked_slot[0]?.level_cleared=== 'ongoing'
                          ? 'bg-green-100 text-green-700' :
                        mentorBooked_slot[0]?.level_cleared === 'no' ? 'text-red-100 bg-red-600' :
                        'bg-green-700 text-white'
                      } rounded-full`}
                    >
                      <p className={`inline-block ${mentorBooked_slot[0]?.level_cleared === "ongoing" ? 'text-black': 'text-white'} `}>slot status:</p>  {mentorBooked_slot[0]?.level_cleared==='no'?'failed':mentorBooked_slot[0]?.level_cleared==='yes' ? 'completed':'' }
                    </span>
                  </div>
                </div>

                {/* View Venue Button */}
                { mentorBooked_slot.length !== 0 && mentorBooked_slot[0].level_cleared==='ongoing' && (
                  <div
                    className='text-white text-center hover:cursor-pointer rounded-sm hover:bg-[#744ee5] bg-[#7D53F6] p-2 mt-4'
                    onClick={() => {
                      setSelectedVenue(mentorBooked_slot[0]) // Show first slot (or filter for the correct one)
                      setShowVenuePopup(true)
                    }}
                  >
                    View venue
                  </div>
                )}
                {
                  mentorBooked_slot[0]?.level_cleared !== 'ongoing' &&(
                  <div
                    className='text-white text-center hover:cursor-pointer rounded-sm hover:bg-[#744ee5] bg-[#7D53F6] p-2 mt-4'
                    onClick={() => {
                      setSelectedVenue(mentorBooked_slot[0]) // Show first slot (or filter for the correct one)
                      setShowVenuePopup(true)
                    }}
                  >
                    Feedback
                  </div>
                  )
                }
              </div>
            ))}

          {/* Venue Details Popup */}
{showVenuePopup && selectedVenue && (
  <div className='fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50'>
    <div className='bg-white rounded-lg p-6 lg:w-1/3'>
      <h2 className='text-2xl font-semibold mb-4'>Venue Details</h2>

      <p>
        <strong>Booking Date:</strong>{' '}
        {new Date(selectedVenue.date).toLocaleDateString()}
      </p>
      <p>
        <strong>Mentor Email:</strong> {selectedVenue.mentor_email}
      </p>
      <p>
        <strong>Mentee Email:</strong> {selectedVenue.mentee_email}
      </p>
      <p>
        <strong>Timing:</strong> {selectedVenue.start_time} to {selectedVenue.end_time}
      </p>
      <p>
        <strong>Language:</strong> {selectedVenue.language} <span>{"level- "+selectedVenue.level}</span>
      </p>
      <p>
        <strong>Venue:</strong> {selectedVenue.slot_venue}
      </p>

      <button
        className='mt-4 w-full bg-[#7D53F6] text-white py-2 rounded'
        onClick={() => setShowVenuePopup(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
{showVenuePopup && selectedVenue && (
  <div className='fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.1)] flex justify-center items-center z-50'>
    <div className='bg-white rounded-lg p-6 lg:w-1/3'>
      <h2 className='text-2xl font-semibold mb-4'>Venue Details</h2>

      <p className="py-1">
        <strong>Booking Date:</strong>{' '}
        {new Date(selectedVenue.date).toLocaleDateString()}
      </p>
      <p className="py-1">
        <strong>Mentor Email:</strong> {selectedVenue.mentor_email}
      </p>
      <p className="py-1">
        <strong>Mentee Email:</strong> {selectedVenue.mentee_email}
      </p>
      <p className="py-1">
        <strong>Timing:</strong> {selectedVenue.start_time} to {selectedVenue.end_time}
      </p>
      <p className="py-1">
        <strong>Language:</strong> {selectedVenue.language} <span>{"level- " + selectedVenue.level}</span>
      </p>
      <p className="py-1">
        <strong>Venue:</strong> {selectedVenue.slot_venue}
      </p>

      <button
        className='mt-4 w-full bg-[#7D53F6] text-white py-2 rounded hover:cursor-pointer'
        onClick={() => setShowVenuePopup(false)}
      >
        Close
      </button>
    </div>
  </div>
)}

        </main>
      </div>
    </div>
  )
}

export default NavMentor
