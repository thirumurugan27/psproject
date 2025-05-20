import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ps from '../../assets/ps.png'
import logout from '../../assets/logout.png'
import { useNavigate } from 'react-router-dom'
import userPS from '../../assets/userPS.png'
import { ArrowBigLeft, ArrowBigLeftDash, ArrowBigRight, ArrowLeft } from 'lucide-react'
import StaticStar from '../../components/stars_static/StaticStar'
function MentorReview() {
    const navigate = useNavigate();
    const [filtered_data,SetFiltered_data] = useState([]);
    console.log(localStorage.getItem('email') , localStorage.getItem('mentor_language'))
    useEffect(() => {
      async function GetMentee_review() {
        try {
          const token = localStorage.getItem("token");
          const mentorEmail = localStorage.getItem("mentor_email");
          const mentorLanguage = localStorage.getItem("mentor_language");

          const response = await axios.get(
            `http://localhost:5000/faculty/mentor-feedback/${mentorEmail}/${mentorLanguage}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("mentee review details: ", response.data);
          SetFiltered_data(response.data);
        } catch (err) {
          console.error(
            "Error fetching mentee reviews:",
            err.response?.data || err.message
          );
        }
      }

      GetMentee_review();
    }, []);
    


return (
<div className="bg-[#EEF1F9] w-full min-h-screen">
    <div className="flex items-center bg-white h-16 px-4 shadow-md justify-between fixed w-full">
        <div className="flex items-center">
            <img className="w-11 h-11 mr-3" src={ps} alt="ps" />
            <h4 className="text-lg font-semibold">PS Mentorship</h4>
        </div>
        <div className="cursor-pointer" onClick={() => { navigate('/Login'); localStorage.clear(); }}>
            <img className="w-6 h-6" src={logout} alt="logout" />
        </div>
    </div>
    <div className='w-full pt-21'>
        <div className='w-fit flex flex-row py-2 px-5'>
            <ArrowLeft className='self-center hover:cursor-pointer' onClick={()=>navigate('/login/faculty')}/>
            <div>
                <h1 className='pl-3 text-2xl lg:text-3xl font-bold'>Review</h1>
                <p className='pl-3 text-gray-500'>{localStorage.getItem("mentor_review")}</p>
            </div>
        </div>
        
    </div>
    <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 px-7 pb-5'>
        {
        filtered_data.map(
                (data, id) => (
            <div key={id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <div className="flex flex-row">
                <img src={userPS}  alt="user" className="w-17 h-17 m-2 bg-gray-300 rounded-full"/>
                <div className="flex flex-col justify-center sm:ml-4">
                    <h3 className="text-xl font-semibold">{data.name}</h3>
                    <p className="text-base text-gray-600">{data.email}</p>                                        {/*this is for setting mentor_review*/}
                    <StaticStar count={data.rating}/>
                    
                </div>
                </div>
                    <div>
                        <p className='text-base text-gray-600 pt-2'>"{data.feedback}"</p>
                    </div>
            </div>
    )
)
    }
    </div>
</div>

)
}

export default MentorReview
