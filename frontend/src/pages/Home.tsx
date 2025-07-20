import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Interactive Branching Stories</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and experience interactive stories where your choices determine the outcome.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
            <div className="mb-6 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a Story</h2>
            <p className="text-gray-600 mb-8 h-24">
              Build your own interactive story with multiple paths, choices, and endings.
              Let your creativity flow and craft unique narratives!
            </p>
            <Link 
              to="/create" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Start Creating
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg transform transition duration-300 hover:scale-105">
            <div className="mb-6 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse Stories</h2>
            <p className="text-gray-600 mb-8 h-24">
              Explore interactive stories created by others. Make choices and discover
              different paths and endings in exciting adventures.
            </p>
            <Link 
              to="/browse" 
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
            >
              Browse Stories
            </Link>
          </div>
        </div>
        
        <div className="mt-20 max-w-4xl mx-auto bg-blue-600 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-blue-700 flex items-center justify-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-blue-100 font-semibold">Get Started Today</div>
              <p className="mt-2 text-white">
                Join our community of storytellers and readers. Create an account to start crafting your own interactive narratives or dive into stories created by others.
              </p>
              <div className="mt-4">
                <Link to="/signup" className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition shadow-md">
                  Sign Up Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;