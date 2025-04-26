import React, { useState } from 'react'
import styles from "../faculty/faculty.module.css"
import ps from "../../assets/ps.png"
import userPS from "../../assets/userPS.png"
import axios from "axios"
import { useEffect } from 'react'
import logout from "../../assets/logout.png"
import {useNavigate} from "react-router-dom"
function Faculty() {
    const [email,setEmail] = useState("");
    const [course,setCourse] = useState("");
    const [level,setLevel] = useState("");
    const [name,setName] = useState("");
    const [status,setStatus] = useState("");
    const [data ,setData] = useState([]);
    const navigate = useNavigate();

    async function GetDetails() {
        try {
            const response = await axios.get("http://localhost:5000/mentorrequests"); 
            const email = response.data.student_email;
            const course = response.data.language_name;
            const level = response.data.level;
            const name = response.data.student_name;
            console.log(response.data);
            setData(response.data);
            setEmail(email);
            setLevel(level);
            setCourse(course);
            setName(name);
        } catch (err) {
            console.error("500 Error from DataBase!!! " + err);
            setError("something went wrong...");
        }
    }
    
    useEffect(() => {
        GetDetails();
    }, []);
    
    async function HandleApprove(request_id) {
        const status = "approved";
        try {
            const response = await axios.put("http://localhost:5000/update-request-status", { request_id, status });
            setStatus(response.data.message);
            GetDetails(); // ✅ Refresh after approval
        } catch (err) {
            console.error(err || "DB error");
        }
    }
    
    async function HandleReject(request_id) {
        const status = "rejected";
        try {
            const response = await axios.put("http://localhost:5000/update-request-status", { request_id, status });
            setStatus(response.data.message);
            GetDetails(); // ✅ Refresh after rejection
        } catch (err) {
            console.error(err || "DB error");
        }
    }
    // useEffect(()=>{
    //     try{
    //         async function GetDetails()
    //         {
    //             const response = await axios.get("http://localhost:5000/mentorrequests"); 
    //             const email = response.data.student_email;
    //             const course = response.data.language_name;
    //             const level = response.data.level;
    //             const name = response.data.student_name;
    //             console.log(response.data)
    //             setData(response.data);
    //             SetEmail(email);
    //             SetLevel(level);
    //             SetCourse(course);
    //             setName(name);
    //         }
    //         GetDetails()
    //     }
    //     catch (err){
    //         if(err)
    //         {
    //             console.error("500 Error from DataBase!!! "+err);
    //             setError("something went wrong...")
    //         }
    //     }
    // },[])

    // async function HandleApprove(request_id) {
    //     const status = "approved";
    //     try {
    //         const response = await axios.put("http://localhost:5000/update-request-status", { request_id, status });
    //         setStatus(response.data.message);
    //     } catch (err) {
    //         console.error(err || "DB error");

    //     }
    //     GetDetails();
    // }
    
    // async function HandleReject(request_id)
    //     {
    //         const status  = "rejected";
    //         try{
    //             const response = await axios.put("http://localhost:5000/update-request-status" , {request_id , status:status});
    //             setStatus(response.data.message);
    //         }
    //         catch(err)
    //         {
    //             console.error(err || "DB error")
    //         }
    //         GetDetails();
    //     }

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
                <div style={{width:"100%",textAlign:"center"}}><p style={{color:status === "Mentor request rejected successfully"? "green":"red"}}>{status}</p></div>
                <div className={styles.cardsContainer}>
                    {
                        data.length === 0 ? "" :
                        data.map(({student_name,student_email,language_name , level ,request_id}, id)=>(
                            <div key={id} className={styles.card}>
                            <div style={{display:"flex" , flexDirection:"row",flex:1,margin:10}}>
                                <div style={{display:"flex",flex:1 ,backgroundColor:"#F5F7FC ",marginRight:5 ,borderRadius:5}}>
                                    <img src={userPS} style={{width:150,height:150, margin:10}}/>
                                </div>
                                <div className={styles.details}>
                                    <div style={{width:"auto",marginBottom:10,marginLeft:5}}>
                                        <h3>{student_name}</h3>
                                        <p>{student_email}</p>
                                        <p style={{fontSize:13}}>Mentorship applied for</p>
                                        <h4>{`${language_name} level-${level}`}</h4>
                                    </div>
                                    <div style={{display:"flex",flexDirection:"row",width:"100%",flex:3,marginBottom:10}}>
                                        <div  className={styles.button1} onClick={() => HandleApprove(request_id)} ><p>Approve</p></div>
                                        <div className={styles.button2} onClick={() => HandleReject(request_id)} ><p>Reject</p></div>
                                    </div>
                                </div>
                            </div>
                            
                            
                        </div>
                        ))
                    }
                    
                    
                </div>
            </div>

            
        </div>
    )
}

export default Faculty
