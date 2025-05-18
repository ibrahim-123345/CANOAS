import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './authentication';
import HomePage from './home';
import VoterDashboard from './voter';
import ContestantRegistration from './contestantRegistration';
import RegisterUserForm from './voterRegistration';
import extractAndValidateToken from './localStorage';
import AdminDashboard from './adminPage';
import UserDashboard from './userAccount';
const isAuthenticated = () => {
  const { token, decoded } = extractAndValidateToken();
  return token && decoded;
};

const isAdmin = () => {
  const authData = JSON.parse(localStorage.getItem('authData'));
  const { token, user, lastUpdated } = authData;
  const { userId, username, role, expiresAt } = user;

  if (!user) return false;
  
  try {
    return role === 'admin' ;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return false;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible when NOT authenticated */}
        <Route 
          path="/auth" 
          element={!isAuthenticated() ? <AuthPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/registration" 
          element={!isAuthenticated() ? <RegisterUserForm /> : <Navigate to="/vote" replace />} 
        />
        
        {/* Always accessible routes */}
        <Route path="/" element={<HomePage />} />

        {/* Protected routes - only accessible when authenticated */}
        <Route
          path="/vote"
          element={isAuthenticated() ? <VoterDashboard /> : <Navigate to="/auth" replace />}
        />


         <Route
          path="/userDashboard"
          element={isAuthenticated() ? <UserDashboard /> : <Navigate to="/auth" replace />}
        />
        
      
        <Route
          path="/register-contestant"
          element={
            isAuthenticated() && isAdmin() 
              ? <ContestantRegistration /> 
              : <Navigate to={isAuthenticated() ? "/vote" : "/"} replace />
          }
        />

<Route
  path="/admin"
  element={
    isAuthenticated() && isAdmin() 
      ? <AdminDashboard /> 
      : <Navigate to={isAuthenticated() ? "/vote" : "/auth"} replace />
  }
/>


        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;