import React from 'react';
import ProfileView from '../components/profile/ProfileView';

const Profile: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <ProfileView />
      </div>
    </div>
  );
};

export default Profile;