/**
 * @name Hotel Room Booking System
 */

import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaAlignRight } from 'react-icons/fa';
import { getSessionToken, getSessionUser } from '../../utils/authentication';
import UserPopover from './popover';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getSessionUser());
    setToken(getSessionToken());
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className='nav-center'>
        <div className='nav-header'>
          {/* app logo */}
          <Link href='/'>
            <img src='/images/svg/logo.svg' alt='Beach Resort' />
          </Link>

          {/* navbar toggle button */}
          <button
            className='nav-btn'
            onClick={() => setIsOpen(!isOpen)}
            type='button'
            aria-label='Toggle navigation'
          >
            <FaAlignRight className='nav-icon' />
          </button>
        </div>

        {/* navbar links */}
        <ul className={isOpen ? 'nav-links show-nav' : 'nav-links'}>
          <li>
            <Link href='/'>Home</Link>
          </li>
          <li>
            <Link href='/rooms'>Rooms</Link>
          </li>
        </ul>

        {/* navbar auth area */}
        <div className='nav-auth'>
          {user?.id && token ? (
            <UserPopover />
          ) : (
            <Button
              onClick={() => router.push('/auth/login')}
              type='primary'
              size='middle'
              style={{
                background: 'transparent',
                borderColor: 'rgba(201,169,110,0.5)',
                color: '#c9a96e',
                fontWeight: 600,
                letterSpacing: '1px',
                fontSize: '0.78rem'
              }}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
