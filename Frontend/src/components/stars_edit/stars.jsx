    import React from "react";

    function Stars({ value = 0, onChange }) {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
    stars.push(
        <div
        key={i}
        className={`hover:cursor-pointer ${i <= value ? 'text-yellow-400' : 'text-[#c7c5c5]'} text-2xl`}
        onClick={() => onChange(i)}
        >
        {i <= value ? '★' : '☆'}
        </div>
    );
    }

    return (
    <div className="flex gap-1">
        {stars}
    </div>
    );
    }

    export default Stars;
