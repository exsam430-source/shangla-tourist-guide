import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useAuth();

  if (isLoading) return <Loader fullScreen />;
  if (!token && !isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;