import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition">
            Interactive Stories
          </Link>
          <nav>
            <ul className="flex space-x-6 items-center">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Browse
                </Link>
              </li>
              
              {isAuthenticated && (
                <li>
                  <Link to="/create" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Create
                  </Link>
                </li>
              )}
              
              {isAuthenticated ? (
                <li className="flex items-center space-x-4">
                  <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition">
                    {user?.username}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li className="flex items-center space-x-2">
                  <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                    Sign Up
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Interactive Branching Stories</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;