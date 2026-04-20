import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Spinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
    <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-700 spin" />
    <p className="text-sm text-gray-400 font-body">Loading VerifyIt...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { business, loading } = useAuth();
  if (loading) return <Spinner />;
  return business ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
