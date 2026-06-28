/**
 * @name Hotel Room Booking System
 */

import React from 'react';
import { v4 as uniqueId } from 'uuid';
import services from '../../data/service';
import Title from './Title';

function Services() {
  return (
    <section className='services'>
      <Title title='Our Services' subtitle='Everything you need for the perfect stay' />

      <div className='services-center'>
        {services?.map((item) => (
          <article key={uniqueId()} className='service-card'>
            <div className='service-icon'>
              {item.icon}
            </div>
            <h6>{item.title}</h6>
            <p>{item.info}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;
