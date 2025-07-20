import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Layout from './components/Layout';

// Placeholder components - will be implemented in future tasks
const CreateStory = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Create a New Story</h1>
      <p className="text-xl text-gray-600 mb-8">
        This page will be implemented in future tasks. Here you'll be able to create your own interactive branching stories.
      </p>
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-800">
          Coming soon: A visual editor for creating nodes, adding choices, and connecting your story paths.
        </p>
      </div>
    </div>
  </div>
);

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

// Additional placeholder components
const Login = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Login</h1>
      <p className="text-gray-600 mb-8">
        This page will be implemented in future tasks.
      </p>
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-800">
          Coming soon: User authentication functionality.
        </p>
      </div>
    </div>
  </div>
);

const SignUp = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sign Up</h1>
      <p className="text-gray-600 mb-8">
        This page will be implemented in future tasks.
      </p>
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-800">
          Coming soon: User registration functionality.
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
          <Route path="/create" element={<CreateStory />} />
          <Route path="/browse" element={<BrowseStories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Additional routes will be added in future tasks */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;