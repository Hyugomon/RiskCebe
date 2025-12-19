import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Assets } from './components/Assets';
import { Diagnostic } from './components/Diagnostic';
import { RiskPlan } from './components/RiskPlan';
import { RiskWizard } from './components/RiskWizard';
import { Schedules } from './components/Schedules';

type Page = 'dashboard' | 'assets' | 'diagnostic' | 'risks' | 'wizard' | 'schedules';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'assets':
        return <Assets />;
      case 'diagnostic':
        return <Diagnostic />;
      case 'risks':
        return <RiskPlan />;
      case 'wizard':
        return <RiskWizard />;
      case 'schedules':
        return <Schedules />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
