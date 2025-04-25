import React, { useState } from 'react'
import styles from "../faculty/faculty.module.css"
import ps from "../../assets/ps.png"
import userPS from "../../assets/userPS.png"
import axios from "axios"
import { useEffect } from 'react'
import logout from "../../assets/logout.png"
import {useNavigate} from "react-router-dom"
function Faculty() {
    const [email,SetEmail] = useState("");
    const [course,SetCourse] = useState("");
    const [level,SetLevel] = useState("");
    const [name,setName] = useState("");
    const [error,setError] = useState("");
    const [data ,setData] = useState([]);
    const navigate = useNavigate();
    useEffect(()=>{
        try{
            async function GetDetails()
            {
                const response = await axios.get("http://localhost:5000/mentorrequests"); //update path
                const email = response.data.student_email;
                const course = response.data.language_name;
                const level = response.data.level;
                const name = response.data.student_name;
                setData(response.data);
                SetEmail(email);
                SetLevel(level);
                SetCourse(course);
                setName(name);
            }
            GetDetails()
        }
        catch (err){
            if(err)
            {
                console.error("500 Error from DataBase!!! "+err);
                setError("something went wrong...")
            }
        }

    },[])
    return (
        <div className={styles.mainBox}>
            <div className={styles.hero}>
                <div style={{display:"flex",alignItems:"center"}}>
                <img style={{width:45,height:45,display:"flex",margin:10}} src={ps}/>
                <h4 style={{display:"flex"}}>PS Mentorship</h4>
                </div>
                <div style={{marginLeft:"auto",marginRight:30}} className={styles.logout} onClick={()=>{navigate("/") ,localStorage.clear()}}>
                <img style={{width:25,height:25,margin:10,marginRight:"auto"}} src={logout}/>
                </div>
            </div>

            {/* below is for map() */}
            <div>
                <div className={styles.cardsContainer}>
                    <div className={styles.card}>
                        <div style={{flexDirection:"row",display:"flex",flex:5}}>
                        <div style={{display:"flex" , flexDirection:"row",flex:1,margin:5}}>
                            <div style={{display:"flex",flex:1}}>
                                <img src={userPS} style={{width:95,height:95, margin:10}}/>
                            </div>
                            <div className={styles.details}>
                                <div style={{marginTop:15,width:"auto"}}>
                                    <h3>userName</h3>
                                    <p style={{fontSize:13}}>Mentorship applied for</p>
                                    <h4>name of the course</h4>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"row",alignSelf:"center",alignItems:"center",flex:3,marginBottom:10}}>
                            <div  className={styles.button1} ><p>Approve</p></div>
                            <div className={styles.button2} ><p>Reject</p></div>
                        </div>
                    </div>
                    
                    <div className={styles.card}>
                        <div style={{flexDirection:"row",display:"flex",flex:5}}>
                        <div style={{display:"flex" , flexDirection:"row",flex:1,margin:5}}>
                            <div style={{display:"flex",flex:1}}>
                                <img src={userPS} style={{width:95,height:95, margin:10}}/>
                            </div>
                            <div className={styles.details}>
                                <div style={{marginTop:15,width:"auto"}}>
                                    <h3>userName</h3>
                                    <p style={{fontSize:13}}>Mentorship applied for</p>
                                    <h4>name of the course</h4>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"row",alignSelf:"center",alignItems:"center",flex:3,marginBottom:10}}>
                            <div  className={styles.button1} ><p>Approve</p></div>
                            <div className={styles.button2} ><p>Reject</p></div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div style={{flexDirection:"row",display:"flex",flex:5}}>
                        <div style={{display:"flex" , flexDirection:"row",flex:1,margin:5}}>
                            <div style={{display:"flex",flex:1}}>
                                <img src={userPS} style={{width:95,height:95, margin:10}}/>
                            </div>
                            <div className={styles.details}>
                                <div style={{marginTop:15,width:"auto"}}>
                                    <h3>userName</h3>
                                    <p style={{fontSize:13}}>Mentorship applied for</p>
                                    <h4>name of the course</h4>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"row",alignSelf:"center",alignItems:"center",flex:3,marginBottom:10}}>
                            <div  className={styles.button1} ><p>Approve</p></div>
                            <div className={styles.button2} ><p>Reject</p></div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div style={{flexDirection:"row",display:"flex",flex:5}}>
                        <div style={{display:"flex" , flexDirection:"row",flex:1,margin:5}}>
                            <div style={{display:"flex",flex:1}}>
                                <img src={userPS} style={{width:95,height:95, margin:10}}/>
                            </div>
                            <div className={styles.details}>
                                <div style={{marginTop:15,width:"auto"}}>
                                    <h3>userName</h3>
                                    <p style={{fontSize:13}}>Mentorship applied for</p>
                                    <h4>name of the course</h4>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"row",alignSelf:"center",alignItems:"center",flex:3,marginBottom:10}}>
                            <div  className={styles.button1} ><p>Approve</p></div>
                            <div className={styles.button2} ><p>Reject</p></div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div style={{flexDirection:"row",display:"flex",flex:5}}>
                        <div style={{display:"flex" , flexDirection:"row",flex:1,margin:5}}>
                            <div style={{display:"flex",flex:1}}>
                                <img src={userPS} style={{width:95,height:95, margin:10}}/>
                            </div>
                            <div className={styles.details}>
                                <div style={{marginTop:15,width:"auto"}}>
                                    <h3>userName</h3>
                                    <p style={{fontSize:13}}>Mentorship applied for</p>
                                    <h4>name of the course</h4>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"row",alignSelf:"center",alignItems:"center",flex:3,marginBottom:10}}>
                            <div  className={styles.button1} ><p>Approve</p></div>
                            <div className={styles.button2} ><p>Reject</p></div>
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    )
}

export default Faculty
