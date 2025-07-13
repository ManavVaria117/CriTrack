import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const navigate = useNavigate();
  const [matchDetails, setMatchDetails] = useState({
    overs: '',
    playersPerTeam: '',
    teamA: {
      name: '',
      players: []
    },
    teamB: {
      name: '',
      players: []
    }
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTeam, setCurrentTeam] = useState('A');
  
  console.log('🔍 [Team] Component rendered with state:', {
    currentStep,
    currentTeam,
    matchDetails: {
      ...matchDetails,
      // Don't log full player arrays to keep console clean
      teamA: { ...matchDetails.teamA, players: `Array(${matchDetails.teamA.players.length})` },
      teamB: { ...matchDetails.teamB, players: `Array(${matchDetails.teamB.players.length})` }
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 [Team] Updating ${name}:`, value);
    setMatchDetails(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('🔄 [Team] Updated matchDetails:', {
        ...updated,
        teamA: { ...updated.teamA, players: `Array(${updated.teamA.players.length})` },
        teamB: { ...updated.teamB, players: `Array(${updated.teamB.players.length})` }
      });
      return updated;
    });
  };

  const handleTeamNameChange = (e, team) => {
    const { value } = e.target;
    console.log(`🏏 [Team] Updating ${team} name to:`, value);
    setMatchDetails(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        name: value
      }
    }));
  };

  const handlePlayerNameChange = (e, team, index) => {
    const { value } = e.target;
    console.log(`👤 [Team] Updating Team ${team} Player ${index + 1}:`, value);
    setMatchDetails(prev => {
      const updatedTeam = { ...prev[`team${team}`] };
      updatedTeam.players[index] = value;
      const updated = {
        ...prev,
        [`team${team}`]: updatedTeam
      };
      console.log(`🔄 [Team] Updated Team ${team} players:`, updatedTeam.players);
      return updated;
    });
  };

  const handleNext = () => {
    console.log(`➡️ [Team] Next button clicked on step ${currentStep}`);
    if (currentStep === 3) {
      console.log('🏁 [Team] All steps completed, navigating to /match with data:', {
        ...matchDetails,
        teamA: { ...matchDetails.teamA, players: `Array(${matchDetails.teamA.players.length})` },
        teamB: { ...matchDetails.teamB, players: `Array(${matchDetails.teamB.players.length})` }
      });
      navigate('/match', { state: { matchDetails } });
      return;
    }
    console.log(`🔄 [Team] Moving to step ${currentStep + 1}`);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    console.log(`⬅️ [Team] Back button clicked on step ${currentStep}`);
    if (currentStep === 1) {
      console.log('🔙 [Team] On first step, navigating back');
      navigate(-1);
    } else {
      console.log(`🔄 [Team] Moving back to step ${currentStep - 1}`);
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Match Setup</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Overs</label>
        <input
          type="number"
          name="overs"
          value={matchDetails.overs}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter number of overs"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Players per Team</label>
        <input
          type="number"
          name="playersPerTeam"
          value={matchDetails.playersPerTeam}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter number of players per team"
        />
      </div>
    </div>
  );

  const renderTeamInput = (team) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Team {team} Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Team {team} Name</label>
        <input
          type="text"
          value={matchDetails[`team${team}`].name}
          onChange={(e) => handleTeamNameChange(e, `team${team}`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={`Enter Team ${team} name`}
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Players</label>
        {Array.from({ length: parseInt(matchDetails.playersPerTeam) || 0 }).map((_, index) => (
          <input
            key={index}
            type="text"
            value={matchDetails[`team${team}`].players[index] || ''}
            onChange={(e) => handlePlayerNameChange(e, team, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Player ${index + 1} name`}
          />
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => renderTeamInput('A');
  const renderStep3 = () => renderTeamInput('B');

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center">
          <button 
            onClick={handleBack}
            className="text-white mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">
            {currentStep === 1 ? 'Match Setup' : 
             currentStep === 2 ? 'Team A' : 'Team B'}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'}`}>
                  {step}
                </div>
                <span className="text-xs mt-1">
                  {step === 1 ? 'Setup' : step === 2 ? 'Team A' : 'Team B'}
                </span>
              </div>
            ))}
          </div>
          
          {/* Form Content */}
          {getStepContent()}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!isStepComplete()}
            >
              {currentStep === 3 ? 'Start Match' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  function isStepComplete() {
    switch(currentStep) {
      case 1:
        return matchDetails.overs && matchDetails.playersPerTeam;
      case 2:
        return matchDetails.teamA.name && 
               matchDetails.teamA.players.length === parseInt(matchDetails.playersPerTeam) &&
               matchDetails.teamA.players.every(player => player.trim() !== '');
      case 3:
        return matchDetails.teamB.name && 
               matchDetails.teamB.players.length === parseInt(matchDetails.playersPerTeam) &&
               matchDetails.teamB.players.every(player => player.trim() !== '');
      default:
        return false;
    }
  }
};

export default Team;
