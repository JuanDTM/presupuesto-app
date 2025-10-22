import logo from './logo.svg';
import './App.css';
import PlanoDemo from './components/PlanoDemo';
import PlanoMuros from './components/PlanoMuros';
import PlanoInteractivo from './components/PlanoInteractivo';
import ComponenteEjesNodos from './components/ComponenteEjesNodos';
// Rutas y auth
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
