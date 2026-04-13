import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
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
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/social" element={<SocialMedia />} />
          <Route path="/mail" element={<DirectMail />} />
          <Route path="/email" element={<EmailNewsletters />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
