import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const PublicNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-white/80/80 backdrop-blur-md border-b border-gray-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors border-2 border-gray-200">
              <span className="text-black font-bold text-sm">CA</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">CGPA Analyzer</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
