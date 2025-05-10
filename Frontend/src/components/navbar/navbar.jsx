import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import ps from '../../assets/ps.png';
import profile from '../../assets/avatar.png';
import mentor from '../../assets/help.png';
import mentee from '../../assets/mentee.png';
import logout from '../../assets/logout.png';
import courses from '../../assets/courses.png';

const navbar = [
  { i: profile, name: 'profile', to: '/login/student/profile' },
  { i: courses, name: 'courses available', to: '/login/student/mycourses' },
  { i: mentor, name: 'view mentor', to: '/login/student/mentor' },
  { i: mentee, name: 'view mentee', to: '/login/student/mentee' },
  { i: logout, name: 'logout', to: '/' },
];

function Navbar() {
  const [hamburger, setHamburger] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-[84px] bg-white lg:flex flex-col items-center py-4 space-y-6 shadow-md">
        <div>
          <img src={ps} alt="Logo" className="w-12 h-12" />
        </div>
        <div className="flex justify-around flex-col h-full py-25">
          {navbar.map(({ i, name, to }, index) => (
            <NavLink to={to} key={index} className={({ isActive }) =>  `flex relative flex-row group w-fit p-2 rounded cursor-pointer ${  isActive ? 'bg-[#7D53F6]' : 'hover:bg-[#7D53F6]' }`}>

              {({isActive}) => (<>
                <img src={i} alt={name} className= {`w-full h-8 group-hover:invert group-hover:brightness-0 group-hover:contrast-200 ${isActive?"invert brightness-0 contrast-200":''}`}/>
              <div className="w-auto rounded-r-sm absolute h-12 left-10 top-0 hidden group-hover:flex group-hover:text-white group-hover:bg-[#7D53F6] z-20">
                <p className="px-2 self-center whitespace-nowrap">{name}</p>
              </div>

              </>)}
              
            </NavLink>

          ))}
        </div>
      </aside>

      {/*Hamburger Button */}
      <div
        className="fixed top-5 left-2 z-30 lg:hidden"
        onClick={() => setHamburger(!hamburger)}
      >
        {hamburger ? <X /> : <Menu />}
      </div>

      {/* Mobile Sidebar */}
      {hamburger && (
        <div className="fixed top-16 left-0 h-fit w-[64px] bg-white z-20 flex flex-col items-center py-4 space-y-6 lg:hidden shadow-md">
          {navbar.map(({ i, to, name }, index) => (
            <NavLink
              to={to}
              key={index}
              className={({ isActive }) =>
                `group w-fit p-2 rounded cursor-pointer transition ${
                  isActive ? 'bg-[#7D53F6]' : 'hover:bg-[#7D53F6]'
                }`
              }
              onClick={() => setHamburger(false)} // Auto close on click
            >
              {({isActive})=>(
                <>
                <img src={i} alt={name} className={`w-6 h-6 group-hover:invert group-hover:brightness-0 group-hover:contrast-200 ${isActive?'invert brightness-0 contrast-200':''}`}/>
                </>
              )}
            
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}

export default Navbar;
