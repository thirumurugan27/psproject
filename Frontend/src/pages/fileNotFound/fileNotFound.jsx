import React from 'react'
import styles from './fileNotFound.module.css';
import ps from "../../assets/ps.png"
import logout from "../../assets/logout.png"
import { useNavigate } from 'react-router-dom';
function FileNotFound() {
    const navigate = useNavigate();
return (
    <div className={styles.mainBox}>
                <div className={styles.hero}>
                    <div style={{display:"flex",alignItems:"center"}}>
                    <img style={{width:45,height:45,display:"flex",margin:10}} src={ps}/>
                    <h4 style={{display:"flex",fontSize:18}}>PS Mentorship</h4>
                    </div>
                    <div style={{marginLeft:"auto",marginRight:30}} className={styles.logout} onClick={()=>{navigate("/") ,localStorage.clear()}}>
                    <img style={{width:25,height:25,margin:10,marginRight:"auto"}} src={logout}/>
                    </div>
                </div>
                <div style={{width:"100vw",textAlign:"center"}}>
                    <p style={{padding:10 ,fontSize:20}}>Request URL 404 | Not Found</p>
                </div>
    </div>
);
}

export default FileNotFound
