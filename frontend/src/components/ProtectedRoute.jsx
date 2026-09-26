import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Spinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
    <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-700 spin" />
    <p className="text-sm text-gray-400 font-body">Loading VerifyIt...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { business, loading, loggingOut } = useAuth();

  useEffect(() => {
    if (!loading && !business && !loggingOut) {
      toast.error("You need to login");
    }
  }, [business, loading, loggingOut]);

  if (loading) return <Spinner />;
  if (business) return children;
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
