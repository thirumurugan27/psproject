import React from "react";
import { useState } from "react";
function Stars()
{
const [count,setCount] = useState(0);
const stars = []
for(let i=1;i<=5;i++)
{
    stars.push(
        <div className={`hover:cursor-pointer ${i<=count? 'text-yellow-400':'text-[#c7c5c5]'} text-2xl gap-1`} onClick={()=>setCount(i)}>
            {i <= count ? '★' : '☆'}
        </div>
    )
}
return (
    <div className="flex gap-1">
        {stars}
    </div>
)
}

export default Stars;