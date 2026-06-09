import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import AdminLogin from "./pages/AdminLogin"
import SiteLoader from "./components/casino/SiteLoader";
import Home from "./pages/Home";
import GMS from "./pages/GMS";
import ApiDocs from "./pages/ApiDocs";
import UserProfilePage from "./pages/UserProfile";
import WithdrawalPage from "./pages/Withdrawal";
import DepositPage from "./pages/Deposit";
import Play from "./pages/Play";
import TestGame from "./pages/TestGame";
import MegaFishing from "./pages/MegaFishing";
import BoxingKing from "./pages/BoxingKing";
import GameOfOlympus from "./pages/GameOfOlympus";
import MidasGoldenTouch from "./pages/MidasGoldenTouch";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <SiteLoader />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gms" element={<GMS />} />
      <Route path="/api-docs" element={<ApiDocs />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/withdrawal" element={<WithdrawalPage />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/play" element={<Play />} />
      <Route path="/test-game" element={<TestGame />} />
      <Route path="/mega-fishing" element={<MegaFishing />} />
      <Route path="/boxing-king" element={<BoxingKing />} />
      <Route path="/game-of-olympus" element={<GameOfOlympus />} />
      <Route path="/midas-golden-touch" element={<MidasGoldenTouch />} />
      {/* Add your page Route elements here */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App