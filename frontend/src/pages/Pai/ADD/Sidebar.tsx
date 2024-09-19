import React from 'react';
import {
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsCalendarFill,
  BsFillPersonPlusFill,
} from 'react-icons/bs';
import { Link } from 'react-router-dom';
import LogoImage from '../../../assets/logo.png';

interface SidebarProps {
  openSidebarToggle: boolean;
  OpenSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ openSidebarToggle, OpenSidebar }) => {
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
      <div className='sidebar-title'>
        <div className='sidebar-brand'>
          <img src={LogoImage} alt="Brand Logo" className='brand-logo' />
        </div>
        <span className='icon close_icon' onClick={OpenSidebar}>X</span>
      </div>
      <ul className='sidebar-list'>
        <li className='sidebar-list-item'>
          <Link to="/dashboard">
            <BsGrid1X2Fill className='icon' /> Dashboard
          </Link>
        </li>
        <li className='sidebar-list-item'>
          <Link to="/tutorAdmin">
            <BsFillArchiveFill className='icon' /> Tutor
          </Link>
        </li>
        <li className='sidebar-list-item'>
          <Link to="/courseAdmin">
            <BsFillGrid3X3GapFill className='icon' /> Course
          </Link>
        </li>
        <li className='sidebar-list-item'>
          <Link to="/calendarAdmin">
            <BsCalendarFill className='icon' /> Calendar
          </Link>
        </li>
        <li className='sidebar-list-item'>
          <Link to="/createuserbyAdmin">
            <BsFillPersonPlusFill className='icon' /> Create User
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
