import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Toss = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchDetails } = location.state || {};
  const [tossOutcome, setTossOutcome] = useState(null);
  const [showChoice, setShowChoice] = useState(false);
  const [tossMethod, setTossMethod] = useState('');
  const [tossWinner, setTossWinner] = useState('');

  const handleManualToss = (winner) => {
    console.log(`🎯 [Toss] Manual toss selected: Team ${winner} wins`);
    setTossWinner(winner);
    setTossOutcome(winner);
    setShowChoice(true);
    setTossMethod('manual');
    console.log(`🔄 [Toss] State updated:`, { tossWinner: winner, tossMethod: 'manual', showChoice: true });
  };

  const handleAutoToss = () => {
    console.log('🎲 [Toss] Starting automatic toss...');
    const winner = Math.random() < 0.5 ? 'A' : 'B';
    console.log(`🏆 [Toss] Automatic toss result: Team ${winner} wins`);
    setTossWinner(winner);
    setTossOutcome(winner);
    setShowChoice(true);
    setTossMethod('auto');
    console.log(`🔄 [Toss] State updated:`, { tossWinner: winner, tossMethod: 'auto', showChoice: true });
  };

  const handleTeamChoice = (choice) => {
    const tossData = {
      winner: tossWinner,
      choice,
      method: tossMethod
    };
    console.log(`✅ [Toss] Team ${tossWinner} chose to ${choice} first`);
    console.log('📤 [Toss] Navigating to /match with toss data:', tossData);
    
    navigate('/match', {
      state: { 
        matchDetails: {
          ...matchDetails,
          toss: tossData
        }
      }
    });
  };

  console.log('🔍 [Toss] Component rendered with props:', { 
    hasMatchDetails: !!matchDetails,
    tossOutcome,
    showChoice,
    tossMethod,
    tossWinner
  });

  if (!matchDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No match data found</h2>
          <button
            onClick={() => navigate('/team')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Team Setup
          </button>
        </div>
      </div>
    );
  }

  const { teamA, teamB } = matchDetails;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4">
          <h1 className="text-2xl font-bold text-white text-center">Toss Time!</h1>
        </div>
        
        <div className="p-6">
          {!tossOutcome ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Toss Method</h2>
                <p className="text-gray-600">Choose how to decide the toss</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleManualToss('A')}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                >
                  {teamA.name} (Team A) Won Toss
                </button>
                
                <button
                  onClick={() => handleManualToss('B')}
                  className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 font-medium hover:bg-green-100 transition-colors"
                >
                  {teamB.name} (Team B) Won Toss
                </button>
                
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                <button
                  onClick={handleAutoToss}
                  className="w-full p-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  🎲 Let's Toss Automatically
                </button>
              </div>
            </div>
          ) : showChoice ? (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-yellow-700">
                  {tossMethod === 'auto' ? '🎲 Toss Result: ' : ''}
                  <span className="font-bold">Team {tossWinner} ({tossWinner === 'A' ? teamA.name : teamB.name})</span> won the toss!
                </p>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800">What will you choose?</h2>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => handleTeamChoice('bat')}
                  className="p-4 bg-green-100 border-2 border-green-200 rounded-lg text-green-700 font-medium hover:bg-green-50 transition-colors"
                >
                  🏏 Bat First
                </button>
                
                <button
                  onClick={() => handleTeamChoice('bowl')}
                  className="p-4 bg-blue-100 border-2 border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors"
                >
                  🏏 Bowl First
                </button>
              </div>
            </div>
          ) : null}
          
          <div className="mt-8">
            <button
              onClick={() => tossOutcome ? setShowChoice(false) : navigate(-1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {tossOutcome ? 'Back' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toss;
