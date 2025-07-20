import React from 'react';
import ProfileEdit from '../components/profile/ProfileEdit';

const ProfileEditPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <ProfileEdit />
      </div>
    </div>
  );
};

export default ProfileEditPage;