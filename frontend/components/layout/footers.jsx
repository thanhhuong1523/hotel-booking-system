/**
 * @name Hotel Room Booking System
 */

import React from 'react';

function Footers() {
  return (
    <footer className='footer'>
      <div className='footer-logo'>Beach Resort</div>
      <div className='footer-tagline'>Luxury Hotel &amp; Spa</div>
      <div className='footer-divider' />
      <p>
        &copy; {new Date().getFullYear()} Beach Resort. All rights reserved.
      </p>
    </footer>
  );
}

export default Footers;
