import React from 'react'
import styles from "./student.module.css"
import ps from "../../assets/ps.png"
import logout from "../../assets/logout.png"
import {useNavigate} from "react-router-dom"
function Student() {
    const status = true;
    const navigate = useNavigate();

    return (
        <div className={styles.mainBox}>
            <div className={styles.hero}>
                <div style={{display:"flex",alignItems:"center"}}>
                <img style={{width:45,height:45,display:"flex",margin:10}} src={ps}/>
                <h4 style={{display:"flex"}}>PS Mentorship</h4>
                </div>
                <div style={{marginLeft:"auto",marginRight:30}} onClick={()=>navigate("/")}>
                <img style={{width:25,height:25,margin:10,marginRight:"auto"}} src={logout}/>
                </div>
            </div>

            <div className={styles.options}>
                <h4 style={{alignSelf:"center"}}>Apply for </h4>
                <div style={{display:"flex",marginLeft:50}}>
                    <div className={styles.mentor}>Mentor</div>
                    <p style={{marginLeft:20,marginRight:20,fontSize:30}}>/</p>
                    <div className={styles.mentee}>Mentee</div>
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
