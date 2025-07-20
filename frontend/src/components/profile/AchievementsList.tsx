import React from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
}

interface AchievementsListProps {
  achievements: Achievement[];
  isLoading?: boolean;
}

const AchievementsList: React.FC<AchievementsListProps> = ({ 
  achievements, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500">No achievements yet. Keep exploring stories!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <div 
          key={achievement.id} 
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition"
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            {achievement.iconUrl ? (
              <img 
                src={achievement.iconUrl} 
                alt={achievement.name} 
                className="h-8 w-8" 
              />
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-blue-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
            <p className="text-sm text-gray-500">{achievement.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsList;