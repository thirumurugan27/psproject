import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import userPS from '../../assets/userPS.png';
import axios from 'axios';

function NavMentee() {
  const [bookedMentees, setBookedMentees] = useState([]);
  const [mentee_list, setMentee_list] = useState([]);
  const [venueDetailsMap, setVenueDetailsMap] = useState({});
  const [showVenuePopup, setShowVenuePopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    async function GetMenteeDetails() {
      try {
        const response = await axios.get(
          `http://localhost:5000/mentor/menteeslist/${localStorage.getItem('email')}`
        );
        setMentee_list(response.data);
      } catch (err) {
        console.log(err);
      }
    }
    GetMenteeDetails();
  }, []);

  const handleBookSlot = async (data) => {
    const payload = {
      mentor_email: localStorage.getItem('email'),
      mentee_email: data.mentee_email,
      language_name: data.language_name,
      start_time: '8:45:00',
    };

    try {
      const res = await axios.post('http://localhost:5000/mentor/slot', payload);
      const venueInfo = res.data;

      setVenueDetailsMap((prev) => ({
        ...prev,
        [data.mentee_email]: venueInfo,
      }));

      setBookedMentees((prev) => [...prev, data.mentee_email]);
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('❌ Failed to book slot. Please try again.');
    }
  };

  const handleViewVenue = (mentee_email) => {
    const venue = venueDetailsMap[mentee_email];
    setSelectedVenue(venue);
    console.log(selectedVenue)
    setShowVenuePopup(true);
  };

  return (
    <div className="flex w-full h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <header className="h-[64px] bg-white px-10 lg:px-6 py-4 shadow text-xl font-semibold sticky top-0 z-10">
          PS Mentorship
        </header>

        <main
          className={`p-6 overflow-y-auto bg-gray-100 flex-1 w-full h-full ${
            mentee_list.length === 0 ? 'flex lg:items-center justify-center' : ''
          }`}
        >
          {mentee_list.length === 0 ? (
            <p className="text-[#5F6388] text-center text-lg">No mentorship history found</p>
          ) : (
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:px-7 pb-5">
              {mentee_list.map((data, id) => {
                const isBooked = bookedMentees.includes(data.mentee_email);
                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
                  >
                    <div className="flex flex-row">
                      <img
                        src={userPS}
                        alt="user"
                        className="w-17 h-17 m-2 bg-gray-300 rounded-full"
                      />
                      <div className="flex flex-col justify-center sm:ml-4">
                        <h3 className="text-xl font-semibold">{data.mentee_name}</h3>
                        <p className="text-base text-gray-600">{data.mentee_email}</p>
                        <p className="text-base">Mentee applied for</p>
                        <p className="font-medium flex text-[16px]">
                          {data.language_name}
                          <span className="pl-1">level {data.mentee_level}</span>
                        </p>

                        {/* Show "View Venue" only after booking */}
                        {isBooked && (
                          <p
                            className="text-gray-700 hover:underline mt-3 hover:cursor-pointer"
                            onClick={() => handleViewVenue(data.mentee_email)}
                          >
                            View Venue
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Show "Book a Slot" only if not booked */}
                    {!isBooked && (
                      <div className="mt-4">
                        <button
                          className="w-full text-white bg-[#7D53F6] hover:cursor-pointer hover:bg-[#683FE0] py-2 rounded"
                          onClick={() => handleBookSlot(data)}
                        >
                          Book a Slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Venue Popup */}
      {showVenuePopup && selectedVenue && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 lg:w-1/3 ">
            <h2 className="text-2xl font-semibold mb-4">Venue Details</h2>
            <p>
              <strong>Booking Date:</strong> {selectedVenue.booking_date}
            </p>
            <p>
              <strong>Start Time:</strong> {selectedVenue.start_time}
            </p>
            <p>
              <strong>End Time:</strong> {selectedVenue.end_time}
            </p>
            <p>
              <strong>Level:</strong> {selectedVenue.level}
            </p>
            <p>
              <strong>Venue:</strong> {selectedVenue.venue}
            </p>
            <button
              className="mt-4 w-full bg-[#7D53F6] text-white py-2 rounded hover:cursor-pointer" 
              onClick={() => setShowVenuePopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavMentee;
