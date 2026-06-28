/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ApiService from '../utils/apiService';

const useFetchData = (url, fetchAgain) => {
  const reFetch = useSelector((state) => state.app.reFetch);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    ApiService.get(url)
      .then((res) => {
        setLoading(false);
        if (res?.result_code === 0) {
          setResponse(res?.result);
        } else {
          setError('Sorry! Something went wrong. App server error');
        }
      })
      .catch((err) => {
        const errorMsg = err?.response?.data?.result?.error?.message ||
                         (typeof err?.response?.data?.result?.error === 'string' ? err?.response?.data?.result?.error : null) ||
                         err?.message ||
                         'Sorry! Something went wrong. App server error';
        setError(errorMsg);
        setLoading(false);
      });
  }, [url, fetchAgain, reFetch]);

  return [loading, error, response];
};

export default useFetchData;
