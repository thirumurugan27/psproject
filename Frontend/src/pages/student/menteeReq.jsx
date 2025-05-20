import React, { useEffect, useState } from 'react'
import Navbar from '../../components/navbar/navbar'
import axios from 'axios'
import userPS from '../../assets/userPS.png';
import StaticStar from '../../components/stars_static/StaticStar';
function Mentee_Request() {

    const [menteeList , setMenteeList] = useState([]);
    const [showFeedBack ,setShowFeedBack] = useState(false);
    const [id,setId] = useState(null)
    useEffect(() => {
      async function GetMentee_Req() {
        try {
          const token = localStorage.getItem("token");
          const email = localStorage.getItem("email");

          const response = await axios.get(
            `http://localhost:5000/mentor/mentees-requests/${email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("mentee request (in mentor page): ", response.data);
          setMenteeList(response.data.requests);
        } catch (err) {
          console.error(
            "Error fetching mentee requests:",
            err.response?.data || err.message
          );
        }
      }

      GetMentee_Req();
    }, []);

    function HandlePopup(id) {
      setShowFeedBack(true);
      setId(id);
      console.log("id: ", id);
    }

    async function HandleAccept(id) {
      try {
        const token = localStorage.getItem("token");

        const postResponse = await axios.post(
          "http://localhost:5000/mentor/update-request",
          {id, status: "accepted"},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("POST response:", postResponse.data);

        await new Promise((resolve) => setTimeout(resolve, 200));

        const deleteResponse = await axios.delete(
          "http://localhost:5000/mentor/delete",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("DELETE response:", deleteResponse.data);

        window.location.reload();
      } catch (error) {
        console.error(
          "Error in handleSubmit:",
          error.response?.data || error.message
        );
      }
    }

    async function PostDecline(id) {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
          "http://localhost:5000/mentor/update-request",
          {id, status: "rejected"},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("reject post: ", response.data);
        window.location.reload();
      } catch (err) {
        console.error("Error in decline:", err.response?.data || err.message);
      }
    }
    

return (
        <div className="flex h-screen w-full">
            <Navbar />
                <div className="flex-1 flex flex-col">
                    <header className="h-[64px] bg-white px-10 py-4 shadow text-xl font-semibold sticky top-0 z-10">
                        PS Mentorship
                    </header>

                    <main className={`p-6 overflow-y-auto bg-gray-100 flex-1 ${menteeList.length===0 &&'lg:content-center lg:align-center'}`}>


        {
        showFeedBack && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"onClick={() => setShowFeedBack(false)}>
                    <div className="bg-white rounded-xl px-6 py-4 shadow-xl w-[90%] max-w-xl" onClick={(e) => e.stopPropagation()}>
                    <h1 className=" text-medium lg:text-xl font-medium pt-2 pb-4">PS Mentorship</h1>

                    <h1 className="flex text-[#727272] text-sm lg:text-lg">
                        mentor name: <span className="pl-2 text-black text-sm lg:text-lg">{menteeList[id]?.mentor_name || '-'}</span>
                    </h1>

                    <h1 className="flex text-[#727272] text-sm lg:text-lg  mt-2 lg:mt-0">
                        mentor email: <span className="pl-2 text-black text-sm lg:text-lg">{menteeList[id]?.mentor_email || '-'}</span>
                    </h1>

                    <hr className="mt-2 text-[#727272]" />

                    <h1 className="mt-3 text-[#727272] text-base lg:text-lg">Feedback</h1>

                    <div className={`mb-2 w-full bg-[#EEF1F9] border-none focus:outline-none ${!menteeList[id]?.latest_feedback && 'py-5'} p-3 rounded text-gray-700 overflow-y-auto text-sm lg:text-base`}>
                        {menteeList[id]?.latest_feedback || '-'}
                    </div>
                    </div>
                </div>
        )}
                        

                        {menteeList?.length === 0 && <p className='text-center text-gray-500 lg:text-lg'>No mentee requests found.</p>}
                        {
                        menteeList?.length!== 0 && 
                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                                    {
                                    menteeList.map(
                                            (data, id) => (
                                        <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                                            <div className="flex flex-row">
                                            <img src={userPS}  alt="user" className="w-17 h-17 m-2 bg-gray-300 rounded-full"/>
                                            <div className="flex flex-col justify-center sm:ml-4">
                                                <h3 className="text-xl font-semibold">{data.student_name}</h3>
                                                <p className="text-base text-gray-600">{data.student_email}</p>   
                                                <p className='text-gray-600 font-medium my-1'>{data.language_name+' '+' level-'+ ' '}<span className='text-gray-600 font-medium'>{Number(data.level)+1}</span></p>                  
                                                
                                                {! data.latest_rating && <p>-</p>}
                                                {data.latest_rating && <StaticStar count={data.latest_rating}/>}

                                                <p className='text-gray-600 hover:underline hover:cursor-pointer mb-2 w-fit' onClick={()=>HandlePopup(id)}>view feedback</p>
                                            </div>
                                            </div>
                                        <div className='flex gap-2'>
                                                <div className='text-white flex flex-1 bg-green-600 rounded-sm p-1 justify-center hover:cursor-pointer hover:bg-green-700' onClick={()=>HandleAccept(data.request_id)}>Accept</div>
                                                <div className='text-white flex flex-1 bg-red-500 rounded-sm p-1 text-center justify-center hover:cursor-pointer hover:bg-red-600' onClick={()=> PostDecline(data.request_id)}>Reject</div>
                                            </div>
                                        </div>
                                )
                            )
                                    }
                        </div>
                        }
                    </main>
            </div>
        </div>
)
}

export default Mentee_Request
