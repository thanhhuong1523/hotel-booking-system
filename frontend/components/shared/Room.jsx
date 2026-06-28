/**
 * @name Hotel Room Booking System
 */

import Link from 'next/link';
import React from 'react';

function Room({ room }) {
  return (
    <article className='room'>
      <div className='img-container'>
        <img
          src={room?.room_images[0]?.url || '/images/jpeg/room-1.jpeg'}
          alt={room?.room_name || 'room'}
        />

        <div className='price-top'>
          <h6>{`$${room?.room_price}`}</h6>
          <p>per night</p>
        </div>

        <Link
          className='btn-primary room-link'
          href={`/rooms/${room?.room_slug}`}
        >
          View Room
        </Link>
      </div>

      <div className='room-info'>
        <span className='room-info-text'>{room?.room_name}</span>
        <span className='room-type-badge'>{room?.room_type}</span>
      </div>
    </article>
  );
}

export default Room;
