/**
 * @name Hotel Room Booking System
 */

import React from 'react';

function Banner({ children, title, subtitle }) {
  return (
    <div className='banner'>
      <span className='banner-badge'>Beach Resort</span>
      <h1>{title}</h1>
      <div className='banner-divider' />
      {subtitle && <p>{subtitle}</p>}
      <div className='banner-actions'>
        {children}
      </div>
    </div>
  );
}

export default Banner;
