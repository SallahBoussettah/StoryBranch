import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Layout from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import StoryManagement from './pages/StoryManagement';
import StoryEditor from './pages/StoryEditor';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

// Note: The Create Story functionality is now integrated into the My Stories page

const BrowseStories = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Browse Stories</h1>
      <p className="text-xl text-gray-600 mb-8">
        This page will be implemented in future tasks. Here you'll be able to browse and discover interactive stories.
      </p>
      <div className="p-6 bg-green-50 rounded-lg border border-green-100">
        <p className="text-green-800">
          Coming soon: A catalog of interactive stories with filtering by genre, popularity, and more.
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
          </Route>

          {/* Role-protected routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['WRITER', 'ADMIN']} />}>
            <Route path="/stories/manage" element={<StoryManagement />} />
            <Route path="/stories/:storyId/edit" element={<StoryEditor />} />
          </Route>

          {/* Public routes */}
          <Route path="/browse" element={<BrowseStories />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;