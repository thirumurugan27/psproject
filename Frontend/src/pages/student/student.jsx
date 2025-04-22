import React from 'react'
import styles from "./student.module.css"
import ps from "../../assets/ps.png"
function Student() {
    return (
        <div className={styles.mainBox}>
            <div className={styles.hero}>
                <img style={{width:45,height:45,display:"flex",margin:10}} src={ps}/>
                <h4 style={{display:"flex"}}>PS Mentorship</h4>
            </div>
        </div>
    )
}

export default Student
