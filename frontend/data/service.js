/**
 * @name Hotel Room Booking System
 */

import {
  FaConciergeBell, FaSwimmingPool, FaSpa, FaCar, FaUtensils, FaWifi
} from 'react-icons/fa';

const services = [
  {
    icon: <FaConciergeBell />,
    title: '24/7 Concierge',
    info: 'Our dedicated concierge team is available around the clock to fulfill every request, from restaurant reservations to bespoke experiences.'
  },
  {
    icon: <FaSwimmingPool />,
    title: 'Infinity Pool',
    info: 'Immerse yourself in our rooftop infinity pool with panoramic ocean views, private cabanas, and a full poolside beverage service.'
  },
  {
    icon: <FaSpa />,
    title: 'Luxury Spa',
    info: 'Rejuvenate mind and body at our award-winning spa, offering curated treatments using organic products and ancient wellness rituals.'
  },
  {
    icon: <FaUtensils />,
    title: 'Fine Dining',
    info: 'Savour world-class cuisine crafted by Michelin-starred chefs using locally sourced seasonal ingredients in an elegant setting.'
  },
  {
    icon: <FaCar />,
    title: 'Airport Transfer',
    info: 'Arrive in style with our complimentary luxury airport transfer service available 24 hours a day in premium chauffeur-driven vehicles.'
  },
  {
    icon: <FaWifi />,
    title: 'Premium Wi-Fi',
    info: 'Stay seamlessly connected with ultra-high-speed fibre internet throughout the property, available complimentary for all guests.'
  }
];

export default services;
