import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Match = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchDetails } = location.state || {};
  
  const handleStartMatch = () => {
    console.log('🚀 [Match] Starting match, navigating to /toss');
    console.log('📤 [Match] Sending match details to /toss:', {
      ...matchDetails,
      teamA: { ...matchDetails.teamA, players: `Array(${matchDetails.teamA.players.length})` },
      teamB: { ...matchDetails.teamB, players: `Array(${matchDetails.teamB.players.length})` }
    });
    navigate('/toss', { state: { matchDetails } });
  };
  
  console.log('🔍 [Match] Component rendered with location state:', location.state);
  console.log('📊 [Match] Match details:', matchDetails ? {
    ...matchDetails,
    teamA: { ...matchDetails.teamA, players: `Array(${matchDetails.teamA?.players?.length || 0})` },
    teamB: { ...matchDetails.teamB, players: `Array(${matchDetails.teamB?.players?.length || 0})` },
    toss: matchDetails.toss ? '✅ Set' : '❌ Not set'
  } : 'No match details');

  if (!matchDetails) {
    console.warn('⚠️ [Match] No match details found in location state');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No match data found</h2>
          <button
            onClick={() => navigate('/team')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const { overs, playersPerTeam, teamA, teamB } = matchDetails;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4">
          <h1 className="text-2xl font-bold text-white text-center">Match Details</h1>
        </div>
        
        <div className="p-6">
          {/* Match Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Match Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Overs</p>
                <p className="font-medium">{overs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Players per Team</p>
                <p className="font-medium">{playersPerTeam}</p>
              </div>
            </div>
          </div>
          
          {/* Teams */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">{teamA.name}</h2>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Players:</h3>
                <ul className="space-y-1">
                  {teamA.players.map((player, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        {index + 1}
                      </span>
                      {player}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Team B */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">{teamB.name}</h2>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Players:</h3>
                <ul className="space-y-1">
                  {teamB.players.map((player, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        {index + 1}
                      </span>
                      {player}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate('/team')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Setup
            </button>
            <button
              onClick={handleStartMatch}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Start Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Match;
