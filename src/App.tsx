import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AuthGate, AdminGate } from './components/AuthGate';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SocialMedia } from './pages/SocialMedia';
import { DirectMail } from './pages/DirectMail';
import { EmailNewsletters } from './pages/EmailNewsletters';
import { ThankYou } from './pages/ThankYou';
import { Compare } from './pages/Compare';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGate />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/social" element={<SocialMedia />} />
              <Route path="/mail" element={<DirectMail />} />
              <Route path="/email" element={<EmailNewsletters />} />
              <Route path="/thankyou" element={<ThankYou />} />
              <Route path="/compare" element={<Compare />} />
              <Route element={<AdminGate />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
