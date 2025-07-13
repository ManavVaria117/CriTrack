import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LiveMatch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchDetails } = location.state || {};
  
  // Match state
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [score, setScore] = useState({ runs: 0, wickets: 0, balls: 0 });
  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const [isSecondInnings, setIsSecondInnings] = useState(false);
  const [target, setTarget] = useState(null);
  
  // Player statistics
  const [playerStats, setPlayerStats] = useState({});
  const [bowlerStats, setBowlerStats] = useState({});
  
  // Match commentary
  const [commentary, setCommentary] = useState([]);

  // Initialize component
  useEffect(() => {
    console.log('🏏 [LiveMatch] Match details:', matchDetails);
    if (!matchDetails) {
      console.error('❌ [LiveMatch] No match details found');
      navigate('/');
    }
  }, [matchDetails, navigate]);

  // Add a comment to the commentary
  const addCommentary = (message) => {
    console.log(`[Commentary] ${message}`);
    const newComment = { 
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message, 
      timestamp: new Date().toLocaleTimeString() 
    };
    setCommentary(prev => [newComment, ...prev].slice(0, 10)); // Keep only last 10 comments
  };
  
  // Log detailed match state for debugging
  const logMatchState = (context = '') => {
    console.group(`📊 Match State - ${context} (Over ${currentOver}.${currentBall})`);
    
    // Match score
    console.log('🏏 Score:', `${score.runs}/${score.wickets} in ${currentOver}.${currentBall} overs`);
    console.log('🎯 Target:', target || 'N/A');
    console.log('📈 Run Rate:', currentRR());
    if (target) console.log('🎯 Required Run Rate:', calculateRR());
    
    // Batsmen stats
    console.group('🧑‍🏏 Batsmen:');
    console.log(`Striker: ${striker} - ${playerStats[striker]?.runs || 0}* (${playerStats[striker]?.balls || 0})`);
    console.log(`Non-Striker: ${nonStriker} - ${playerStats[nonStriker]?.runs || 0} (${playerStats[nonStriker]?.balls || 0})`);
    
    // Calculate and log striker's strike rate
    const strikerSR = playerStats[striker]?.balls > 0 
      ? ((playerStats[striker]?.runs || 0) / playerStats[striker]?.balls * 100).toFixed(2)
      : '0.00';
    console.log(`Striker's Strike Rate: ${strikerSR}%`);
    
    // Log fours and sixes for current batsmen
    console.log(`Fours: ${playerStats[striker]?.fours || 0}, Sixes: ${playerStats[striker]?.sixes || 0}`);
    console.groupEnd();
    
    // Bowler stats
    console.group('🎯 Bowler:');
    console.log(`${bowler} - ${bowlerStats[bowler]?.overs || 0}.${(bowlerStats[bowler]?.balls || 0) % 6} - ${bowlerStats[bowler]?.runs || 0}/${bowlerStats[bowler]?.wickets || 0}`);
    const bowlerEcon = bowlerStats[bowler]?.overs > 0 
      ? (bowlerStats[bowler]?.runs / bowlerStats[bowler]?.overs).toFixed(2)
      : '0.00';
    console.log(`Economy: ${bowlerEcon}, Maidens: ${bowlerStats[bowler]?.maidens || 0}`);
    console.groupEnd();
    
    // Match status
    console.log('🏟️ Match Status:', isMatchComplete ? 'Completed' : isMatchStarted ? 'In Progress' : 'Not Started');
    console.log('Innings:', isSecondInnings ? '2nd Innings' : '1st Innings');
    
    // Top performers
    const { batsmen: topBatsmen, bowlers: topBowlers } = getTopPerformers();
    console.group('🏆 Top Performers');
    console.group('Top Batsmen:');
    topBatsmen.forEach((b, i) => 
      console.log(`${i + 1}. ${b.name}: ${b.runs} (${b.balls}) SR: ${b.sr}%`)
    );
    console.groupEnd();
    
    console.group('Top Bowlers:');
    topBowlers.forEach((b, i) => 
      console.log(`${i + 1}. ${b.name}: ${b.wickets}/${b.runs} (${b.overs}.${b.balls % 6})`)
    );
    console.groupEnd();
    console.groupEnd(); // End Top Performers
    
    console.groupEnd(); // End Match State
  };

  // Start the match
  const startMatch = () => {
    if (!matchDetails) return;
    
    console.log('🏁 [LiveMatch] Starting match');
    
    // Determine batting and bowling teams based on toss
    const battingTeam = matchDetails.toss.choice === 'bat' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
      
    const bowlingTeam = matchDetails.toss.choice === 'bowl' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
    
    console.log('🏏 [LiveMatch] Batting Team:', battingTeam, 'Bowling Team:', bowlingTeam);
    
    // Set initial batsmen and bowler
    const newStriker = matchDetails[battingTeam]?.players?.[0] || 'Batsman 1';
    const newNonStriker = matchDetails[battingTeam]?.players?.[1] || 'Batsman 2';
    const newBowler = matchDetails[bowlingTeam]?.players?.[0] || 'Bowler 1';
    
    // Initialize player stats
    const initialPlayerStats = {};
    matchDetails[battingTeam]?.players?.forEach(player => {
      initialPlayerStats[player] = { 
        runs: 0, 
        balls: 0, 
        fours: 0, 
        sixes: 0, 
        out: false 
      };
    });
    
    // Initialize bowler stats
    const initialBowlerStats = {};
    matchDetails[bowlingTeam]?.players?.forEach(player => {
      initialBowlerStats[player] = { 
        runs: 0, 
        balls: 0, 
        wickets: 0, 
        maidens: 0, 
        overs: 0 
      };
    });
    
    // Update state
    setStriker(newStriker);
    setNonStriker(newNonStriker);
    setBowler(newBowler);
    setPlayerStats(initialPlayerStats);
    setBowlerStats(initialBowlerStats);
    setIsMatchStarted(true);
    
    // Add initial commentary
    addCommentary(`Match started! ${matchDetails[battingTeam]?.name || 'Team'} are batting first.`);
    addCommentary(`${newStriker} and ${newNonStriker} are opening the batting.`);
    addCommentary(`${newBowler} to bowl the first over.`);
    
    // Log initial match state
    logMatchState('Match Started');
  };

  // Add runs to the score
  const addRun = (runs) => {
    if (isMatchComplete || !matchDetails) return;
    
    console.group(` Adding ${runs} run(s) to score`);
    
    // Update team score
    setScore(prev => ({
      ...prev,
      runs: prev.runs + runs,
      balls: prev.balls + 1
    }));
    
    // Update batsman stats - only for the striker
    setPlayerStats(prev => {
      const updatedStats = { ...prev };
      
      // Only update the striker's stats
      updatedStats[striker] = {
        ...(updatedStats[striker] || {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          out: false
        }),
        runs: (updatedStats[striker]?.runs || 0) + runs,
        balls: (updatedStats[striker]?.balls || 0) + 1,
        fours: runs === 4 ? (updatedStats[striker]?.fours || 0) + 1 : (updatedStats[striker]?.fours || 0),
        sixes: runs === 6 ? (updatedStats[striker]?.sixes || 0) + 1 : (updatedStats[striker]?.sixes || 0)
      };
      
      return updatedStats;
    });
    
    // Update bowler stats
    setBowlerStats(prev => ({
      ...prev,
      [bowler]: {
        ...(prev[bowler] || {
          runs: 0,
          balls: 0,
          wickets: 0,
          maidens: 0,
          overs: 0
        }),
        runs: (prev[bowler]?.runs || 0) + runs,
        balls: (prev[bowler]?.balls || 0) + 1
      }
    }));
    
    // Add commentary
    const runText = runs === 0 ? 'Dot ball' : `${runs} run${runs > 1 ? 's' : ''}`;
    addCommentary(`${bowler} to ${striker}, ${runText}.`);
    
    // Handle strike rotation
    const shouldRotateStrike = (runs % 2 === 1) || (runs === 3);
    
    // Only rotate strike if it's not the last ball of the over and runs are odd or 3
    if (shouldRotateStrike && currentBall < 5) {
      setStriker(prevStriker => {
        setNonStriker(prevStriker);
        addCommentary(`${prevStriker} takes a single, strike rotates.`);
        return nonStriker;
      });
    } else if (runs === 4) {
      addCommentary('FOUR! Great shot!');
    } else if (runs === 6) {
      addCommentary('SIX! What a hit!');
    }
    
    nextBall();
    
    // Log updated state after adding runs
    logMatchState(`Added ${runs} run(s)`);
    console.groupEnd();
  };

  // Add a wicket
  const addWicket = () => {
    console.group(' Wicket!');
    if (isMatchComplete || !matchDetails || score.wickets >= parseInt(matchDetails.playersPerTeam) - 1) return;
    
    // Update team score
    setScore(prev => ({
      ...prev,
      wickets: prev.wickets + 1,
      balls: prev.balls + 1
    }));
    
    // Update batsman stats
    setPlayerStats(prev => ({
      ...prev,
      [striker]: {
        ...(prev[striker] || {}),
        out: true,
        balls: (prev[striker]?.balls || 0) + 1
      }
    }));
    
    // Update bowler stats
    setBowlerStats(prev => ({
      ...prev,
      [bowler]: {
        ...(prev[bowler] || {}),
        wickets: (prev[bowler]?.wickets || 0) + 1,
        balls: (prev[bowler]?.balls || 0) + 1
      }
    }));
    
    // Add commentary
    addCommentary(`OUT! ${striker} is out! ${bowler} gets the wicket!`);
    
    // Get next batsman
    const battingTeam = matchDetails.toss.choice === 'bat' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
      
    const nextBatsman = matchDetails[battingTeam]?.players?.find(
      player => !playerStats[player]?.out && player !== striker && player !== nonStriker
    );
    
    if (nextBatsman) {
      setStriker(nextBatsman);
      addCommentary(`${nextBatsman} is the new batsman.`);
    } else {
      // All out or match over
      addCommentary('That\'s the end of the innings!');
      endInnings();
      return;
    }
    
    nextBall();
  };

  // Move to the next ball
  const nextBall = () => {
    if (isMatchComplete || !matchDetails) return;
    
    console.group('⏭️ Next Ball');
    
    setCurrentBall(prev => {
      const newBall = prev + 1;
      const totalWickets = score.wickets;
      const maxWickets = parseInt(matchDetails.playersPerTeam) - 1;
      
      // Check if all wickets have fallen
      if (totalWickets >= maxWickets) {
        console.log('🏁 [LiveMatch] All out!');
        endInnings();
        console.groupEnd();
        return prev;
      }
      
      // Handle end of over
      if (newBall >= 6) {
        // Update bowler's stats
        setBowlerStats(prev => {
          const currentBowlerStats = prev[bowler] || { runs: 0, balls: 0, wickets: 0, maidens: 0, overs: 0 };
          const isMaiden = currentBowlerStats.runs === 0;
          
          return {
            ...prev,
            [bowler]: {
              ...currentBowlerStats,
              overs: Math.floor((currentBowlerStats.balls + 1) / 6),
              maidens: isMaiden ? (currentBowlerStats.maidens || 0) + 1 : (currentBowlerStats.maidens || 0)
            }
          };
        });
        
        // Update over count
        setCurrentOver(prevOver => {
          const newOver = prevOver + 1;
          
          // Check if all overs are completed
          if (newOver >= parseInt(matchDetails.overs)) {
            console.log('🏁 [LiveMatch] All overs completed!');
            endInnings();
            console.groupEnd();
            return prevOver;
          }
          
          // Get next bowler (simple rotation)
          const bowlingTeam = matchDetails.toss.choice === 'bowl' 
            ? 'team' + matchDetails.toss.winner 
            : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
            
          const currentBowlerIndex = matchDetails[bowlingTeam]?.players?.indexOf(bowler) || 0;
          const nextBowlerIndex = (currentBowlerIndex + 1) % (matchDetails[bowlingTeam]?.players?.length || 1);
          const nextBowler = matchDetails[bowlingTeam]?.players?.[nextBowlerIndex] || 'Bowler';
          
          // Update bowler for the new over
          setBowler(nextBowler);
          addCommentary(`End of over ${newOver}. ${nextBowler} comes into the attack.`);
          
          // Switch striker and non-striker at the end of the over
          setStriker(prevStriker => {
            setNonStriker(prevStriker);
            addCommentary('Batsmen cross for the new over.');
            return nonStriker;
          });
          
          console.log(`🔄 [LiveMatch] Over ${newOver}.0 started`);
          return newOver;
        });
        
        return 0; // Reset ball counter
      }
      
      console.log(`🎯 Ball ${newBall} of over ${currentOver + 1}`);
      logMatchState(`Ball ${newBall} of over ${currentOver + 1}`);
      console.groupEnd();
      return newBall;
    });
  };
  
  // Handle end of innings
  const endInnings = () => {
    if (!matchDetails) return;
    
    setIsMatchComplete(true);
    const battingTeam = matchDetails.toss.choice === 'bat' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
      
    addCommentary(`Innings break! ${matchDetails[battingTeam]?.name || 'Team'} finish with ${score.runs}/${score.wickets} in ${currentOver}.${currentBall} overs.`);
    
    // If first innings, set target and start second innings
    if (!isSecondInnings) {
      const targetScore = score.runs + 1;
      setTarget(targetScore);
      setIsSecondInnings(true);
      
      // Reset for second innings
      setTimeout(() => {
        const bowlingTeam = matchDetails.toss.choice === 'bowl' 
          ? 'team' + matchDetails.toss.winner 
          : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
          
        const newBattingTeam = battingTeam === 'teamA' ? 'teamB' : 'teamA';
        
        // Reset match state for second innings
        setStriker(matchDetails[newBattingTeam]?.players?.[0] || 'Batsman 1');
        setNonStriker(matchDetails[newBattingTeam]?.players?.[1] || 'Batsman 2');
        setBowler(matchDetails[bowlingTeam]?.players?.[0] || 'Bowler 1');
        
        // Reset score but keep target
        setScore({ runs: 0, wickets: 0, balls: 0 });
        setCurrentOver(0);
        setCurrentBall(0);
        
        // Initialize player stats for second innings
        const secondInningsStats = {};
        matchDetails[newBattingTeam]?.players?.forEach(player => {
          secondInningsStats[player] = { 
            runs: 0, 
            balls: 0, 
            fours: 0, 
            sixes: 0, 
            out: false 
          };
        });
        setPlayerStats(secondInningsStats);
        
        // Initialize bowler stats for second innings
        const secondInningsBowlerStats = {};
        matchDetails[bowlingTeam]?.players?.forEach(player => {
          secondInningsBowlerStats[player] = { 
            runs: 0, 
            balls: 0, 
            wickets: 0, 
            maidens: 0, 
            overs: 0 
          };
        });
        setBowlerStats(secondInningsBowlerStats);
        
        setIsMatchComplete(false);
        addCommentary(`\n${matchDetails[newBattingTeam]?.name || 'Team 2'} need ${targetScore} runs to win.`);
        addCommentary(`${matchDetails[newBattingTeam]?.players?.[0] || 'Batsman 1'} and ${matchDetails[newBattingTeam]?.players?.[1] || 'Batsman 2'} are opening the batting.`);
        addCommentary(`${matchDetails[bowlingTeam]?.players?.[0] || 'Bowler 1'} to bowl the first over.`);
      }, 2000);
    } else {
      // Match complete
      const bowlingTeam = matchDetails.toss.choice === 'bowl' 
        ? 'team' + matchDetails.toss.winner 
        : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
        
      const winningTeam = score.runs >= target ? battingTeam : bowlingTeam;
      const margin = winningTeam === battingTeam 
        ? `${target - score.runs - 1} wickets`
        : `${score.runs} runs`;
      
      addCommentary(`\n🏆 ${matchDetails[winningTeam]?.name || 'Winning Team'} win by ${margin}!`);
    }
  };

  // Calculate required run rate
  const calculateRR = () => {
    if (!matchDetails) return 'N/A';
    const ballsRemaining = (matchDetails.overs * 6) - (currentOver * 6 + currentBall);
    const runsNeeded = target ? target - score.runs - 1 : 0;
    return ballsRemaining > 0 ? (runsNeeded / ballsRemaining * 6).toFixed(2) : 'N/A';
  };

  // Calculate current run rate
  const currentRR = () => {
    const totalBalls = currentOver * 6 + currentBall;
    return totalBalls > 0 ? (score.runs / totalBalls * 6).toFixed(2) : '0.00';
  };

  // Get top performers
  const getTopPerformers = () => {
    const batsmen = Object.entries(playerStats)
      .filter(([_, stats]) => (stats.runs > 0 || stats.balls > 0) && stats)
      .map(([name, stats]) => ({
        id: `batsman-${name}-${stats.runs}-${stats.balls}`,
        name,
        ...stats,
        sr: stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.runs - a.runs || b.sr - a.sr);

    const bowlers = Object.entries(bowlerStats)
      .filter(([_, stats]) => (stats.overs > 0 || stats.wickets > 0) && stats)
      .map(([name, stats]) => ({
        id: `bowler-${name}-${stats.wickets}-${stats.runs}`,
        name,
        ...stats,
        economy: stats.overs > 0 ? (stats.runs / stats.overs).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

    return { 
      batsmen: batsmen.slice(0, 3), 
      bowlers: bowlers.slice(0, 3) 
    };
  };

  const { batsmen: topBatsmen, bowlers: topBowlers } = getTopPerformers();

  // Render the component
  if (!matchDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No Match Details Found</h2>
          <p className="text-gray-600 mb-4">Please start a new match from the dashboard.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Match Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 text-white">
            <h1 className="text-xl md:text-2xl font-bold text-center">
              {matchDetails.teamA.name} vs {matchDetails.teamB.name}
            </h1>
            <p className="text-center text-blue-100 text-sm">
              {matchDetails.overs} overs match • {matchDetails.playersPerTeam} players per side
            </p>
          </div>
          
          {/* Scorecard */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  {matchDetails[`team${matchDetails.toss.winner}`].name} {matchDetails.toss.choice === 'bat' ? 'batting first' : 'bowling first'}
                </h2>
                {target && (
                  <p className="text-sm text-gray-600">
                    Target: {target} • RRR: {calculateRR()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {score.runs}<span className="text-gray-500">/{score.wickets}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {currentOver}.{currentBall} overs • RR: {currentRR()}
                </div>
              </div>
            </div>

            {/* Batsmen and Bowler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Batting</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span>{striker || 'Batsman 1'}</span>
                    </div>
                    <span className="font-mono">
                      {playerStats[striker]?.runs || 0}* ({playerStats[striker]?.balls || 0})
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                      <span>{nonStriker || 'Batsman 2'}</span>
                    </div>
                    <span className="font-mono">
                      {playerStats[nonStriker]?.runs || 0} ({playerStats[nonStriker]?.balls || 0})
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Bowling</h3>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span>{bowler || 'Bowler'}</span>
                  <span className="font-mono">
                    {Math.floor((bowlerStats[bowler]?.balls || 0) / 6)}.{(bowlerStats[bowler]?.balls || 0) % 6} - {bowlerStats[bowler]?.runs || 0} - {bowlerStats[bowler]?.wickets || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isMatchStarted ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ready to start the match?</h2>
            <button
              onClick={startMatch}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Start Match
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Match Controls */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Match Controls</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6].map((run) => (
                  <button
                    key={run}
                    onClick={() => addRun(run)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded-lg transition-colors text-sm sm:text-base"
                    disabled={isMatchComplete}
                  >
                    {run} Run{run > 1 ? 's' : ''}
                  </button>
                ))}
                <button
                  onClick={addWicket}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-2 rounded-lg transition-colors text-sm sm:text-base col-span-2"
                  disabled={isMatchComplete || score.wickets >= parseInt(matchDetails.playersPerTeam) - 1}
                >
                  Wicket
                </button>
                <button
                  onClick={nextBall}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-2 rounded-lg transition-colors text-sm sm:text-base col-span-3"
                  disabled={isMatchComplete}
                >
                  Dot Ball
                </button>
              </div>
              
              {/* Match Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Match Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Overs: {matchDetails.overs}</div>
                  <div>Players: {matchDetails.playersPerTeam} per side</div>
                  <div>Current: {currentOver}.{currentBall}</div>
                  <div>Target: {target || 'N/A'}</div>
                  <div>RR: {currentRR()}</div>
                  <div>RRR: {target ? calculateRR() : 'N/A'}</div>
                </div>
              </div>
            </div>
            
            {/* Commentary */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Live Commentary</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {commentary.length > 0 ? (
                  commentary.map((item, index) => (
                    <div 
                      key={`comment-${item.id}-${index}`} 
                      className="text-sm border-b border-gray-100 pb-2"
                    >
                      <span className="text-gray-500 text-xs">[{item.timestamp}]</span>{' '}
                      {item.message}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No commentary yet. Start the match to see live updates.</p>
                )}
              </div>
            </div>
            
            {/* Top Performers */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Top Performers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Top Batsmen</h3>
                  {topBatsmen.length > 0 ? (
                    <div className="space-y-2">
                      {topBatsmen.map((batsman, index) => (
                        <div 
                          key={`batsman-${batsman.name}-${index}-${batsman.runs}-${batsman.balls}`}
                          className="flex justify-between text-sm"
                        >
                          <span>{batsman.name}</span>
                          <span className="font-mono">{batsman.runs} ({batsman.balls}) • SR: {batsman.sr}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No batting stats yet</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Top Bowlers</h3>
                  {topBowlers.length > 0 ? (
                    <div className="space-y-2">
                      {topBowlers.map((bowler, index) => (
                        <div 
                          key={`bowler-${bowler.name}-${index}-${bowler.wickets}-${bowler.runs}`}
                          className="flex justify-between text-sm"
                        >
                          <span>{bowler.name}</span>
                          <span className="font-mono">{bowler.wickets}/{bowler.runs} • {bowler.economy}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No bowling stats yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatch;
