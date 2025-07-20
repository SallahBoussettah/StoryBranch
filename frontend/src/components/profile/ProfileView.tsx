import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import Button from '../ui/Button';
import WriterDashboard from './WriterDashboard';
import ReadingHistory from './ReadingHistory';
import type { ReadingHistoryItem } from './ReadingHistory';
import AchievementsList from './AchievementsList';
import type { Achievement } from './AchievementsList';

const ProfileView: React.FC = () => {
  const { profile, isLoading, error } = useProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
        <p>Error loading profile: {error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-4">
        <p>Profile not found. Please log in again.</p>
        <Link to="/login" className="mt-2 inline-block">
          <Button variant="primary">Go to Login</Button>
        </Link>
      </div>
    );
  }

  // Mock data for demonstration
  const mockWriterStats = {
    storiesCreated: profile.statistics?.storiesCreated || 0,
    storiesPublished: profile.statistics?.storiesCreated ? Math.floor(profile.statistics.storiesCreated * 0.7) : 0,
    totalReaders: 0,
    totalCompletions: 0,
    averageRating: 0
  };

  // Define properly typed empty arrays for mock data
  const mockReadingHistory: ReadingHistoryItem[] = [];
  const mockAchievements: Achievement[] = [];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <p className="text-blue-100">{profile.email}</p>
          </div>
          <div className="bg-white text-blue-600 px-3 py-1 rounded-full font-medium capitalize">
            {profile.role}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reading History
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'achievements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Achievements
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-600">
                {profile.bio || "No bio provided yet. Click 'Edit Profile' to add one."}
              </p>
            </div>

            {/* Role-specific UI elements */}
            {profile.role === 'writer' && (
              <div className="mb-6">
                <WriterDashboard stats={mockWriterStats} />
              </div>
            )}

            {/* Reader statistics - shown to all users */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Reading Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500">Stories Read</p>
                  <p className="text-2xl font-bold">{profile.statistics?.storiesRead || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500">Choices Made</p>
                  <p className="text-2xl font-bold">{profile.statistics?.choicesMade || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500">Endings Discovered</p>
                  <p className="text-2xl font-bold">{profile.statistics?.endingsDiscovered || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500">Achievements</p>
                  <p className="text-2xl font-bold">{mockAchievements.length}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Preferences</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Theme</span>
                  <span className="capitalize">{profile.preferences?.theme || 'light'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Notifications</span>
                  <span>{profile.preferences?.notifications ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email Updates</span>
                  <span>{profile.preferences?.emailUpdates ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/profile/edit">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reading History</h2>
            <ReadingHistory historyItems={mockReadingHistory} />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <AchievementsList achievements={mockAchievements} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;