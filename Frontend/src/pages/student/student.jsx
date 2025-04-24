import React, { use, useState } from 'react'
import styles from "./student.module.css"
import ps from "../../assets/ps.png"
import logout from "../../assets/logout.png"
import {useNavigate} from "react-router-dom"

function Student() {
    const status = true; //change later
    const [mentor, setMentor] = useState(false);
    const [isPressed , setIsPressed] = useState(false);
    const [slotName , setSlotName] = useState("");
    const [slotNamePressed,setSlotNamePressed] = useState(false);
    const [isEligible , setIsEligible] = useState(false);
    const [isSlotAvailable , setIsSlotAvailable] = useState("");

    const [mentee, setMentee] = useState(false);
    const [isPressedMentee , setIsPressedMentee] = useState(false);
    const [slotNameMentee , setSlotNameMentee] = useState("");
    const [slotNamePressedMentee,setSlotNamePressedMentee] = useState(false);
    const [isMentorAvailable, setIsMentorAvailable] = useState(false);

    const navigate = useNavigate();

    function HandleSubmitMentor()
    {
        if(!slotNamePressed)
            {
                setIsSlotAvailable("Select a slot to continue")
            }
        else if (slotName.length === 0)
        {
            setIsSlotAvailable("No Slots available")
        }
        else{
            setMentor(false)
        }
    }

    function HandleSubmitMentee()
    {
        if(!slotNamePressed)
            {
                setIsSlotAvailable("Select a slot to continue")
            }
        else if (slotName.length === 0)
        {
            setIsSlotAvailable("No Slots available")
        }
        else{
            setMentee(false)
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
            }}}>

                <div className={styles.popup}>
                    <div style={{padding:20 ,paddingBottom:10}}>
                        <h3 style={{fontFamily:"inherit"}}>Book Slot</h3>
                        <p style={{marginTop:20}}>Select a skill (mentors can guide up to 2 levels below their own).</p>
                        <p style={{marginTop:10 ,fontSize:14}}>Eligible skills/levels</p>
                    </div>
                    <div style={{width:"100%",justifyItems:"center"}}>
                        <div style={{width:"100%",alignItems:'center',justifyContent:"center",display:"flex",flexDirection:"column"}} onClick={()=>setIsPressed(!isPressed)}>
                                <input readOnly value={slotNamePressed?slotName  : "select..."} className={styles.dropdown}/> 
                                {
                                    isPressed && 
                                    <div className={styles.dropdownPressed}>
                                        <div style={{width:"100%",textAlign:"center"}} onClick={() => setSlotNamePressed(!slotNamePressed)}>         {/* this thing needs to be brought from backend */}
                                            <p  style={{color:"gray"}}>{isEligible? slotName: "no options"}</p>
                                        </div>            {/*map function*/}
                                    </div>
                                }
                        </div> 
                                {
                                    isSlotAvailable.length === 0? "": <p style={{color:"red"}}>{isSlotAvailable}</p>
                                }
                        <div className={styles.bookSlots} onClick={HandleSubmitMentor}>              {/*need to complete submit logic*/}
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
            }}}>

                <div className={styles.popup}>
                    <div style={{padding:20 ,paddingBottom:10}}>
                        <h3 style={{fontFamily:"inherit"}}>Book Slot</h3>
                        <p style={{marginTop:20}}>You'll be paired with mentors who are at least 2 levels ahead of you.</p>
                        <p style={{marginTop:10 ,fontSize:14}}>Book slot</p>
                    </div>
                    <div style={{width:"100%",justifyItems:"center"}}>
                        <div style={{width:"100%",justifyContent:"center",alignItems:'center',display:"flex",flexDirection:"column"}} onClick={()=>setIsPressedMentee(!isPressedMentee)}>
                                <input readOnly value={slotNamePressedMentee ? slotNameMentee  : "select..."} className={styles.dropdown}/> 
                                {
                                    isPressedMentee  && 
                                    <div className={styles.dropdownPressed}>
                                        <div style={{width:"100%",textAlign:"center"}} onClick={()=>{setSlotNameMentee(slotNameMentee),setSlotNamePressedMentee(!slotNamePressedMentee)}}>
                                            <p  style={{color:"gray"}}>{isMentorAvailable? slotNameMentee : "no options"}</p>
                                        </div>            {/*map function*/}
                                    </div>
                                }
                        </div>  
                                {
                                    isSlotAvailable.length === 0? "": <p style={{color:"red"}}>{isSlotAvailable}</p>
                                }            
                        <div className={styles.bookSlots} onClick={HandleSubmitMentee}>              {/*need to complete submit logic*/}
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
                <div style={{marginLeft:"auto",marginRight:30}} className={styles.logout} onClick={()=>navigate("/")}>
                <img style={{width:25,height:25,margin:10,marginRight:"auto"}} src={logout}/>
                </div>
            </div>

            <div className={styles.options}>
                <h3 style={{alignSelf:"center"}}>Apply for </h3>
                <div style={{display:"flex",marginLeft:50}}>
                    <div className={styles.mentor} onClick={()=> setMentor(true)}>Mentor</div>
                    <p style={{marginLeft:20,marginRight:20,fontSize:30}}>/</p>
                    <div className={styles.mentee} onClick={()=> setMentee(true)}>Mentee</div>
                </div>
            </div>
            <div className={styles.tableContainer}>
                <table>
                    <thead>
                    <tr>
                        <th>Role</th>
                        <th>Date</th>
                        <th>Assigned Person(s)</th>
                        <th>Skill / Level</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Mentor</td>
                            <td>Apr 7 - Apr 13</td>
                            <td>student1.bitsathy.ac.in<br/>student2.bitsathy.ac.in<br/>student3.bitsathy.ac.in<br/>student4.bitsathy.ac.in</td>
                            <td>C level-5</td>
                            <td><div className={styles.pending}>Pending</div></td>
                        </tr>
                        
                        <tr>
                            <td>Mentee</td>
                            <td>Apr 7 - Apr 13</td>
                            <td>student7.bitsathy.ac.in</td>
                            <td>C level-2</td>
                            <td>
                                <div className={status ? styles.active : styles.expired}>{status ? <p>Active</p> : <p>Expired</p>}</div>
                            </td>
                        </tr>

                        <tr>
                            <td>Mentee</td>
                            <td>Apr 7 - Apr 13</td>
                            <td>student8.bitsathy.ac.in</td>
                            <td>Java level-1</td>
                            <td>
                                <div className={styles.expired}><p>Expired</p></div>
                            </td>
                        </tr>

                        <tr>
                            <td>Mentor</td>
                            <td>Apr 7 - Apr 13</td>
                            <td>student1.bitsathy.ac.in<br/>student2.bitsathy.ac.in<br/>student3.bitsathy.ac.in<br/>student4.bitsathy.ac.in</td>
                            <td>C level-5</td>
                            <td><div className={styles.active}>Approved</div></td>
                        </tr>
                    </tbody>
                </table>
                        
        </div>
    </div>
        
    )
}

export default Student
