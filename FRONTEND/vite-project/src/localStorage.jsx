
import {React} from 'react';
import {jwtDecode} from 'jwt-decode'; 

const extractAndValidateToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn('No token found');
    return { token: null, decoded: null };
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // seconds

    if (decoded.exp && decoded.exp < currentTime) {
      console.warn('Token expired');
      localStorage.removeItem('token');
      localStorage.removeItem('authData');
      window.location.href = '/login?session_expired=true';
      return { token: null, decoded: null };
    }

    const userData = {
      userId: decoded.id,
      username: decoded.user,
      role: decoded.role,
      expiresAt: decoded.exp ? decoded.exp * 1000 : null,
    };

    localStorage.setItem('authData', JSON.stringify({
      token,
      user: userData,
      lastUpdated: Date.now(),
    }));


    return { token, decoded };

  } catch (error) {
    console.error('Token validation failed:', error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    return { token: null, decoded: null };
  }
}

export default extractAndValidateToken;
