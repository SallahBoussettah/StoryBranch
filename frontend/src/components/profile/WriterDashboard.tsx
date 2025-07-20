import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export interface WriterStats {
  storiesCreated: number;
  storiesPublished: number;
  totalReaders: number;
  totalCompletions: number;
  averageRating?: number;
}

interface WriterDashboardProps {
  stats: WriterStats;
  isLoading?: boolean;
}

const WriterDashboard: React.FC<WriterDashboardProps> = ({ 
  stats, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Writer Dashboard</h2>
        <Link to="/create">
          <Button variant="primary">Create New Story</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Stories Created</p>
          <p className="text-2xl font-bold">{stats.storiesCreated}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Published</p>
          <p className="text-2xl font-bold">{stats.storiesPublished}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Readers</p>
          <p className="text-2xl font-bold">{stats.totalReaders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Completions</p>
          <p className="text-2xl font-bold">{stats.totalCompletions}</p>
        </div>
      </div>
      
      {stats.averageRating !== undefined && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <p className="text-gray-500 text-sm mb-1">Average Rating</p>
          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${star <= Math.round(stats.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-lg font-medium">{stats.averageRating.toFixed(1)}</span>
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Link to="/my-stories" className="flex-1">
          <Button variant="outline" fullWidth>
            Manage Stories
          </Button>
        </Link>
        <Link to="/analytics" className="flex-1">
          <Button variant="outline" fullWidth>
            View Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WriterDashboard;