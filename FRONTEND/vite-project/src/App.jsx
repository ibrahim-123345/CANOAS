// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './authentication'
import HomePage from './home'
import VoterDashboard from './voter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Home route */}
        <Route path="/" element={<HomePage />} />
        <Route path="/vote" element={<VoterDashboard />} />


        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;