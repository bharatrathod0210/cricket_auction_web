import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Players from './pages/Players';
import PlayerRegistration from './pages/PlayerRegistration';
import Auction from './pages/Auction';
import Matches from './pages/Matches';
import Leaderboard from './pages/Leaderboard';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminSetup from './pages/admin/AdminSetup';
import { AdminLayout } from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeams from './pages/admin/AdminTeams';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminAuction from './pages/admin/AdminAuction';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMatches from './pages/admin/AdminMatches';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

// Public layout wrapper
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: '100vh' }}>{children}</main>
    <Footer />
  </>
);

// Admin protected route
const ProtectedAdmin = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#000' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/teams" element={<PublicLayout><Teams /></PublicLayout>} />
        <Route path="/teams/:id" element={<PublicLayout><TeamDetail /></PublicLayout>} />
        <Route path="/players" element={<PublicLayout><Players /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><PlayerRegistration /></PublicLayout>} />
        <Route path="/auction" element={<PublicLayout><Auction /></PublicLayout>} />
        <Route path="/matches" element={<PublicLayout><Matches /></PublicLayout>} />
        <Route path="/leaderboard" element={<PublicLayout><Leaderboard /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminSetup />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin/teams" element={<ProtectedAdmin><AdminTeams /></ProtectedAdmin>} />
        <Route path="/admin/players" element={<ProtectedAdmin><AdminPlayers /></ProtectedAdmin>} />
        <Route path="/admin/auction" element={<ProtectedAdmin><AdminAuction /></ProtectedAdmin>} />
        <Route path="/admin/payments" element={<ProtectedAdmin><AdminPayments /></ProtectedAdmin>} />
        <Route path="/admin/matches" element={<ProtectedAdmin><AdminMatches /></ProtectedAdmin>} />
        <Route path="/admin/announcements" element={<ProtectedAdmin><AdminAnnouncements /></ProtectedAdmin>} />

        {/* Catch all */}
        <Route path="*" element={
          <PublicLayout>
            <div style={{ paddingTop: 'var(--nav-height)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '8rem', letterSpacing: 8, opacity: 0.1 }}>404</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 8 }}>Page Not Found</h2>
                <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Go Home</a>
              </div>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
