import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('🔑 [SignIn] Google Sign In Successful!', credentialResponse);
    console.log('🔄 [SignIn] Navigating to /team');
    navigate('/team');
  };
  
  console.log('🔍 [SignIn] Component rendered');

  const handleGoogleError = () => {
    console.error('Google Sign In failed');
    setError('Google Sign In was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in with Google
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  auto_select
                  ux_mode="popup"
                  scope="openid profile email"
                  prompt="select_account"
                  cookiePolicy="single_host_origin"
                  responseType="code"
                  accessType="offline"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
