/**
 * @name Hotel Room Booking System
 */

import React from 'react';

function Title({ title, subtitle }) {
  return (
    <div className='section-title'>
      {subtitle && <p>{subtitle}</p>}
      <h4>{title}</h4>
      <div />
    </div>
  );
}

export default Title;
