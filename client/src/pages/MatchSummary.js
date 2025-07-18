import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MatchSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchDetails, result, playerStats, bowlerStats } = location.state || {};

  if (!matchDetails || !result) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Match Summary Available</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Get top performers
  const getTopPerformers = () => {
    const batsmen = Object.entries(playerStats || {})
      .map(([name, stats]) => ({
        name,
        runs: stats.runs || 0,
        balls: stats.balls || 0,
        fours: stats.fours || 0,
        sixes: stats.sixes || 0,
        sr: stats.balls ? ((stats.runs || 0) / stats.balls * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 3);

    const bowlers = Object.entries(bowlerStats || {})
      .map(([name, stats]) => ({
        name,
        wickets: stats.wickets || 0,
        runs: stats.runs || 0,
        overs: stats.overs || 0,
        balls: stats.balls || 0,
        economy: stats.balls ? ((stats.runs || 0) / (stats.balls / 6)).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
      .slice(0, 3);

    return { batsmen, bowlers };
  };

  const { batsmen, bowlers } = getTopPerformers();
  const winningTeam = result.winner ? 
    (result.winner === 'A' ? matchDetails.teamA.name : matchDetails.teamB.name) : '';

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
            Match Summary
          </h1>
          <div className="text-center text-lg text-gray-600 mb-6">
            {matchDetails.teamA.name} vs {matchDetails.teamB.name}
          </div>
          
          {/* Match Result */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-center text-blue-800 mb-2">
              {result.isTie ? 'Match Tied!' : `${winningTeam} won by ${result.margin}`}
            </h2>
            <p className="text-center text-gray-700">
              {matchDetails.overs} overs match • {matchDetails.playersPerTeam} players per side
            </p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Batsmen */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Top Batsmen
            </h2>
            <div className="space-y-4">
              {batsmen.length > 0 ? (
                batsmen.map((batsman, index) => (
                  <div key={batsman.name} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{batsman.name}</span>
                      <div className="text-sm text-gray-500">
                        {batsman.runs} runs ({batsman.balls} balls) • {batsman.sr} SR
                      </div>
                      <div className="text-xs text-gray-400">
                        {batsman.fours}x4 • {batsman.sixes}x6
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No batting data available</p>
              )}
            </div>
          </div>

          {/* Top Bowlers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Top Bowlers
            </h2>
            <div className="space-y-4">
              {bowlers.length > 0 ? (
                bowlers.map((bowler, index) => (
                  <div key={bowler.name} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{bowler.name}</span>
                      <div className="text-sm text-gray-500">
                        {bowler.wickets}/{bowler.runs} • {bowler.overs}.{bowler.balls % 6} overs • {bowler.economy} economy
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No bowling data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Full Scorecard Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSummary;
