import React from 'react'

function StaticStar(props) {
    const stars = []
    for(let i=1;i<=5;i++)
    {
        stars.push(
            <div key={i} className={`text-2xl gap-1 ${i<= props.count? 'text-yellow-400': 'text-[#c7c5c5]'}`} onClick={()=>setCount(i)}>
                {i <= props.count ? '★' : '☆'}
            </div>
        )
    }
return (
<div className='gap-1 flex'>
    {stars}
</div>
)
}

export default StaticStar
