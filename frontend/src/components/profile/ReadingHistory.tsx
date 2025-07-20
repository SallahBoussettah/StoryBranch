import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export interface ReadingHistoryItem {
  id: string;
  storyId: string;
  storyTitle: string;
  coverImageUrl?: string;
  progress: number; // 0-100
  lastReadAt: Date;
  completed: boolean;
}

interface ReadingHistoryProps {
  historyItems: ReadingHistoryItem[];
  isLoading?: boolean;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ 
  historyItems, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500 mb-4">You haven't started reading any stories yet.</p>
        <Link to="/browse">
          <Button variant="primary">Browse Stories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {historyItems.map((item) => (
        <div 
          key={item.id} 
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition"
        >
          <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden mr-4 flex-shrink-0">
            {item.coverImageUrl ? (
              <img 
                src={item.coverImageUrl} 
                alt={item.storyTitle} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-100">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-blue-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-800">{item.storyTitle}</h3>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${item.completed ? 'bg-green-600' : 'bg-blue-600'}`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {item.completed ? 'Completed' : `${Math.round(item.progress)}% complete`}
                </span>
                <span className="text-xs text-gray-500">
                  Last read: {new Date(item.lastReadAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <Link to={`/story/${item.storyId}`}>
              <Button variant="outline" className="whitespace-nowrap">
                {item.completed ? 'Read Again' : 'Continue'}
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReadingHistory;