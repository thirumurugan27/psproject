import React, { use, useEffect, useState } from 'react'
import styles from "./student.module.css"
import ps from "../../assets/ps.png"
import logout from "../../assets/logout.png"
import {useNavigate} from "react-router-dom"
import axios from 'axios'

function Student() {
    const status = true; //change later
    const [mentor, setMentor] = useState(false);
    const [isPressed , setIsPressed] = useState(false);
    const [slotName , setSlotName] = useState("");
    const [slotNamePressed,setSlotNamePressed] = useState(false);
    const [isSlotAvailable , setIsSlotAvailable] = useState("");
    const [requestSkill,setRequestSkill] = useState("");
    const [requestLevel, setRequestLevel] = useState("");         {/* need to update this part*/}

    const [mentee, setMentee] = useState(false);
    const [isPressedMentee , setIsPressedMentee] = useState(false);
    const [slotNameMentee , setSlotNameMentee] = useState("");
    const [slotNamePressedMentee,setSlotNamePressedMentee] = useState(false);
    const [mentor_email , set_mentor_email] = useState("");

    const [data,setData] = useState([]);
    const [dataMentee ,setDataMentee] = useState([]);

    const navigate = useNavigate();
    const email = localStorage.getItem("email");
    const name  = localStorage.getItem("name");
    console.log("logged in as: ",name);

    useEffect(()=>{
        async function GetEligibleSkill() {
            
            try{
                const response = await axios.get(`http://localhost:5000/levels/${email}`);
                if (response.data){
                    console.log("mentor's list: ",response.data);
                    setData(response.data);
                }
                else
                    console.log("data empty");
            }

            catch(err)
            {
                if (err)
                    console.error(err || "unexpected error occurred -GetEligibleSkill");
            }
        }
        async function GetEligibleSkillMentee() {
            try{
                const response = await axios.get(`http://localhost:5000/approved-mentors/${email}`);
                if (response.data){
                    console.log("mentee's list: ", response.data);
                    setDataMentee(response.data);
                }
                else
                    console.log("data empty");
            }
            catch (err){
                console.error(err || "unexpected error occurred -GetEligibleSkillMentee")
            }
            
        }
        GetEligibleSkill();
        GetEligibleSkillMentee();
    },[]);


    async function MentorRequestSent() {
        console.log("Mentor-request-sent...","\n","email:",email ,"\n", "skill_name: ",requestSkill)
        if(!slotNamePressed)
            {
                setIsSlotAvailable("Select a slot to continue")
            }
        else if (slotName.length === 0)
        {
            setIsSlotAvailable("No Slots available")
        }
        else{

            try{
                const response = await axios.post("http://localhost:5000/send-mentor-request" , {student_email:email ,language_name:requestSkill })
                const data = response.data.message;
                setIsSlotAvailable(data)
            }
            catch (err)
            {
                if (err.response)
                    console.error(err.response || "unexpected error -mentorRequestSent")
            }
            
        }
        
    
    }

    async function MenteeAdded()
    {
        if(!slotNamePressedMentee)
            {
                setIsSlotAvailable("Select a slot to continue")
            }
        else if (slotNameMentee.length === 0)
        {
            setIsSlotAvailable("No Slots available")
        }
        else{
            console.log("mentor:", mentor_email ,"mentee_email:",email,"language_name:",requestLevel)
            try{
                const response  = await axios.post("http://localhost:5000/assign-mentee" ,{mentor_email:mentor_email ,mentee_email:email ,language_name:requestSkill});
                
                console.log(response.data.message);
                setIsSlotAvailable(response.data.message);
            }
            catch(err)
            {
                console.log(err || "received unexpected error!!!")
            }
        }

    }

    return (
        <div className={styles.mainBox}>

            {/* This is for mentor */}

            {mentor && 
            <div className={styles.overlay} onClick={(e) => {
                if (e.target.classList.contains(styles.overlay)) {
                    setMentor(false);
                    setIsSlotAvailable("");
                    setIsPressed(false);
            }}}>

                <div className={styles.popup}>
                    <div style={{padding:20 ,paddingBottom:10}}>
                        <h3 style={{fontFamily:"inherit"}}>Book Slot</h3>
                        <p style={{marginTop:20}}>Select a skill (mentors can guide up to 2 levels below their own).</p>
                        <p style={{marginTop:10 ,fontSize:14}}>Eligible skills/levels</p>
                    </div>
                    <div style={{width:"100%",justifyItems:"center"}}>
                        <div style={{width:"100%",alignItems:'center',justifyContent:"center",display:"flex",flexDirection:"column"}} onClick={()=>setIsPressed(!isPressed)}>
                                <input readOnly value={slotName.length === 0 ?"select..."  : slotName} className={styles.dropdown}/> 
                                {
                                    isPressed && 
                                    <div className={styles.dropdownPressed}>
                                        {
                                            
                                            data.length === 0 ?
                                            <div style={{width:"100%",textAlign:"center",color:"gray"}}>
                                                <p style={{textAlign:"center", fontSize:15}}>No options</p>
                                            </div> :
                                            <div style={{display:"flex",width:"100%",flexDirection:"column",textAlign:"center"}} onClick={()=>setSlotNamePressed(true)}>
                                                {data.map(({language_name , level} , id)=>( 
                                                    <div key={id}>
                                                <div style={{width:"100%",color:"gray",display:"flex",marginTop:10,marginBottom:10}} onClick={() => {setSlotName(`${language_name} level - ${level}`) , setRequestSkill(language_name), setRequestLevel(level)}}>         {/*slot name is added here*/}
                                                        <p style={{fontSize:15}}>{language_name} level - {level}</p>
                                                        
                                                </div>
                                                <hr style={{color:"lightgray"}}/>
                                                </div>
                                            )) }
                                            </div>
                                        }
                                    </div>
                                    
                                }
                        </div> 
                                {
                                    isSlotAvailable.length === 0? "": <p style={{color:isSlotAvailable === "Request submitted" ? "green": "red"}}>{isSlotAvailable}</p>
                                }
                        <div className={styles.bookSlots} onClick={()=> { MentorRequestSent() , setSlotNamePressed(false) }}>              {/*need to complete submit logic*/}
                            <p>Apply Now</p>
                        </div>
                    </div>
                </div>
            </div>
            }

            {/* This is for mentee */}

            {mentee && 
            
            <div className={styles.overlay} onClick={(e) => {
                if (e.target.classList.contains(styles.overlay)) {
                    setMentee(false);
                    setIsSlotAvailable("");
                    setSlotNameMentee("");
                    setIsPressedMentee(false);
            }}}>

                <div className={styles.popup}>
                    <div style={{padding:20 ,paddingBottom:10}}>
                        <h3 style={{fontFamily:"inherit"}}>Book Slot</h3>
                        <p style={{marginTop:20}}>You'll be paired with mentors who are at least 2 levels ahead of you.</p>
                        <p style={{marginTop:10 ,fontSize:14}}>Book slot</p>
                    </div>
                    <div style={{width:"100%",justifyItems:"center"}}>
                        <div style={{width:"100%",justifyContent:"center",alignItems:'center',display:"flex",flexDirection:"column"}} onClick={()=>setIsPressedMentee(!isPressedMentee)}>
                                <input readOnly value={slotNameMentee.length === 0 ? "select...":slotNameMentee } className={styles.dropdown}/> 
                                {
                                    isPressedMentee  && 
                                    <div className={styles.dropdownPressed}>
                                        {
                                            dataMentee.length === 0 ? 
                                            <div style={{width:"100%",textAlign:"center",color:"gray"}}>
                                                <p style={{textAlign:"center", fontSize:15}}>No options</p>
                                            </div> :
                                            
                                            <div style={{display:"flex",width:"100%",flexDirection:"column",textAlign:"center"}} onClick={()=>setSlotNamePressedMentee(true)}>
                                                    {dataMentee.map(({mentor_name,language_name , mentor_level, mentor_email} , id)=>( 
                                                        <div key={id}>
                                                    <div style={{width:"100%",color:"gray",display:"flex",marginTop:10,marginBottom:10}} onClick={() => {setSlotNameMentee(`${mentor_name} | ${mentor_email} | ${language_name} | level - ${mentor_level}`) , setRequestSkill(language_name), setRequestLevel(mentor_level),set_mentor_email(mentor_email)}}>         {/* setReqeust see it*/}
                                                            <p style={{fontSize:15}}>{mentor_name} | {mentor_email} | {language_name} | level - {mentor_level}</p>
                                                            
                                                    </div>
                                                    <hr style={{color:"lightgray"}}/>
                                                    </div>
                                                )) }
                                            </div>
                                        }        
                                    </div>
                                }
                        </div>  
                                {
                                    isSlotAvailable.length === 0? "": <p style={{color:isSlotAvailable === "Mentee assigned successfully"? "green": "red"}}>{isSlotAvailable}</p>
                                }            
                        <div className={styles.bookSlots} onClick={()=>{MenteeAdded() ,setSlotNamePressedMentee(false)}}>              {/*need to complete submit logic*/}
                            <p>Book Now</p>
                        </div>
                    </div>
                </div>
            </div>
            }


            <div className={styles.hero}>
                <div style={{display:"flex",alignItems:"center"}}>
                <img style={{width:45,height:45,display:"flex",margin:10}} src={ps}/>
                <h4 style={{display:"flex"}}>PS Mentorship</h4>
                </div>
                <div style={{marginLeft:"auto",marginRight:30}} className={styles.logout} onClick={()=>{navigate("/") , localStorage.clear()}}>
                <img style={{width:25,height:25,margin:10,marginRight:"auto"}} src={logout}/>
                </div>
            </div>

            <div className={styles.options}>
                <h3 style={{alignSelf:"center"}}>Apply for </h3>
                <div style={{display:"flex",marginLeft:50}}>
                    <div className={styles.mentor} onClick={()=> {setMentor(true) ,setSlotName("")}}>Mentor</div>
                    <p style={{marginLeft:20,marginRight:20,fontSize:30}}>/</p>
                    <div className={styles.mentee} onClick={()=> setMentee(true)}>Mentee</div>
                </div>
            </div>
            <div className={styles.tableContainer}>
                <table>
                    <thead>
                    <tr>
                        <th>Role</th>
                        <th>name</th>
                        <th>Assigned Person(s)</th>
                        <th>Skill / Level</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Mentor</td>
                            <td>student1</td>
                            <td>student1.bitsathy.ac.in<br/>student2.bitsathy.ac.in<br/>student3.bitsathy.ac.in<br/>student4.bitsathy.ac.in</td>
                            <td>C level-5</td>
                            <td>26-04-2025 to 03-05-2025</td>
                            <td><div className={styles.pending}>Pending</div></td>
                        </tr>
                        
                        <tr>
                            <td>Mentee</td>
                            <td>student1</td>
                            <td>student7.bitsathy.ac.in</td>
                            <td>C level-2</td>
                            <td>26-04-2025 to 03-05-2025</td>
                            <td>
                                <div className={status ? styles.active : styles.expired}>{status ? <p>Active</p> : <p>Expired</p>}</div>
                            </td>
                        </tr>

                        <tr>
                            <td>Mentee</td>
                            <td>student1</td>
                            <td>student8.bitsathy.ac.in</td>
                            <td>Java level-1</td>
                            <td>26-04-2025 to 03-05-2025</td>
                            <td>
                                <div className={styles.expired}><p>Expired</p></div>
                            </td>
                        </tr>

                        <tr>
                            <td>Mentor</td>
                            <td>student1</td>
                            <td>student1.bitsathy.ac.in<br/>student2.bitsathy.ac.in<br/>student3.bitsathy.ac.in<br/>student4.bitsathy.ac.in</td>
                            <td>C level-5</td>
                            <td>26-04-2025 to 03-05-2025</td>
                            <td><div className={styles.active}>Approved</div></td>
                        </tr>
                    </tbody>
                </table>
                        
        </div>
    </div>
        
    )
}

export default Student
