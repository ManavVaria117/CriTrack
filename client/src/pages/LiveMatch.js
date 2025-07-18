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
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  
  // UI State
  const [showResult, setShowResult] = useState(false);
  const [showBatsmanSelection, setShowBatsmanSelection] = useState(false);
  const [showBowlerSelection, setShowBowlerSelection] = useState(false);
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  
  // Team and player selection
  const [availableBatsmen, setAvailableBatsmen] = useState([]);
  const [availableBowlers, setAvailableBowlers] = useState([]);
  const [selectedBatsmen, setSelectedBatsmen] = useState([]);
  const [selectedBowler, setSelectedBowler] = useState('');
  const [battingTeam, setBattingTeam] = useState('');
  const [bowlingTeam, setBowlingTeam] = useState('');
  
  // Match progress
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [isSecondInnings, setIsSecondInnings] = useState(false);
  const [target, setTarget] = useState(null);
  
  // Match result
  const [matchResult, setMatchResult] = useState({ winner: '', margin: '', isTie: false });
  
  // Innings data
  const [inningsBreakData, setInningsBreakData] = useState({ score: null, target: 0 });

  // Player statistics
  const [playerStats, setPlayerStats] = useState({});
  const [bowlerStats, setBowlerStats] = useState({});

  // Match commentary
  const [commentary, setCommentary] = useState([]);

  // Initialize component
  useEffect(() => {
    console.log(' [LiveMatch] Match details:', matchDetails);
    if (!matchDetails) {
      console.error(' [LiveMatch] No match details found');
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
  
  // Format over display (e.g., 1.3 for 1 over and 3 balls)
  const formatOverDisplay = (balls) => {
    const overs = Math.floor(balls / 6);
    const ballsInOver = balls % 6;
    return `${overs}.${ballsInOver}`;
  };

  // Log detailed match state for debugging
  const logMatchState = (context = '') => {
    const overDisplay = formatOverDisplay(score.balls);
    const runRate = score.balls > 0 ? (score.runs / (score.balls / 6)).toFixed(2) : '0.00';
    
    console.group(`📊 Match State - ${context} (Over ${overDisplay})`);
    
    // Match score
    console.log('🏏 Score:', `${score.runs}/${score.wickets} in ${overDisplay} overs`);
    console.log('🎯 Target:', target || 'N/A');
    console.log('📈 Run Rate:', runRate);
    
    // Calculate required run rate for second innings
    if (isSecondInnings && target) {
      const ballsRemaining = (matchDetails.overs * 6) - score.balls;
      const runsNeeded = target - score.runs - 1;
      const requiredRR = ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : '0.00';
      console.log('🎯 Required Run Rate:', requiredRR);
    }
    
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

  // Initialize available players when component mounts
  useEffect(() => {
    if (matchDetails) {
      const battingTeam = matchDetails.toss.choice === 'bat' 
        ? matchDetails[`team${matchDetails.toss.winner}`] 
        : matchDetails[`team${matchDetails.toss.winner === 'A' ? 'B' : 'A'}`];
      
      const bowlingTeam = matchDetails.toss.choice === 'bowl' 
        ? matchDetails[`team${matchDetails.toss.winner}`]
        : matchDetails[`team${matchDetails.toss.winner === 'A' ? 'B' : 'A'}`];
      
      setAvailableBatsmen(battingTeam.players || []);
      setAvailableBowlers(bowlingTeam.players || []);
    }
  }, [matchDetails]);

  // Handle batsman selection
  const handleBatsmanSelect = (player) => {
    if (selectedBatsmen.length < 2 && !selectedBatsmen.includes(player)) {
      setSelectedBatsmen([...selectedBatsmen, player]);
    } else if (selectedBatsmen.includes(player)) {
      setSelectedBatsmen(selectedBatsmen.filter(p => p !== player));
    }
  };

  // Handle bowler selection
  const handleBowlerSelect = (player) => {
    setSelectedBowler(player);
  };

  // Start the match after player selection
  const confirmSelections = () => {
    if (selectedBatsmen.length === 2 && selectedBowler) {
      setStriker(selectedBatsmen[0]);
      setNonStriker(selectedBatsmen[1]);
      setBowler(selectedBowler);
      setShowBatsmanSelection(false);
      setShowBowlerSelection(false);
      setIsMatchStarted(true);
      setCommentary([{ 
        id: 1, 
        message: `The match has started! ${selectedBatsmen[0]} and ${selectedBatsmen[1]} to open the batting. ${selectedBowler} to bowl the first over.`,
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // Initialize the match
  const startMatch = () => {
    setShowBatsmanSelection(true);
    const battingTeam = matchDetails.toss.choice === 'bat' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
    const bowlingTeam = matchDetails.toss.choice === 'bowl' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
    
    console.log(' [LiveMatch] Batting Team:', battingTeam, 'Bowling Team:', bowlingTeam);
    
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
    
    // Log the run addition
    console.log(` [LiveMatch] ${striker} scored ${runs} run${runs !== 1 ? 's' : ''}`);
    
    // Update team score and ball count
    setScore(prev => {
      const newBalls = prev.balls + 1;
      const newScore = {
        ...prev,
        runs: prev.runs + runs,
        balls: newBalls
      };
      
      // Check if target is achieved in second innings
      if (isSecondInnings && newScore.runs >= target) {
        const bowlingTeam = matchDetails.toss.choice === 'bowl' 
          ? 'team' + matchDetails.toss.winner 
          : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
        
        const result = {
          winner: 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A'), // Opposite of bowling team
          margin: `${newScore.runs - (target - 1)} wickets with ${matchDetails.overs * 6 - newBalls} ball${matchDetails.overs * 6 - newBalls !== 1 ? 's' : ''} remaining`,
          isTie: false
        };
        
        setMatchResult(result);
        setShowResult(true);
        setIsMatchComplete(true);
        
        // Add commentary and navigate to summary
        addCommentary(`\n🏆 ${matchDetails[result.winner]?.name || result.winner} wins by ${result.margin}!`);
        
        // Navigate to match summary after 3 seconds
        setTimeout(() => {
          const { batsmen: topBatsmen, bowlers: topBowlers } = getTopPerformers();
          navigate('/match-summary', {
            state: {
              matchDetails: {
                ...matchDetails,
                toss: { ...matchDetails.toss, winner: result.winner }
              },
              result,
              playerStats: {
                ...playerStats,
                [striker]: {
                  ...(playerStats[striker] || {}),
                  runs: (playerStats[striker]?.runs || 0) + runs,
                  balls: (playerStats[striker]?.balls || 0) + 1,
                  fours: runs === 4 ? (playerStats[striker]?.fours || 0) + 1 : (playerStats[striker]?.fours || 0),
                  sixes: runs === 6 ? (playerStats[striker]?.sixes || 0) + 1 : (playerStats[striker]?.sixes || 0)
                }
              },
              bowlerStats: {
                ...bowlerStats,
                [bowler]: {
                  ...(bowlerStats[bowler] || {}),
                  runs: (bowlerStats[bowler]?.runs || 0) + runs,
                  balls: (bowlerStats[bowler]?.balls || 0) + 1
                }
              },
              topBatsmen: topBatsmen.slice(0, 3),
              topBowlers: topBowlers.slice(0, 3),
              score: newScore,
              target,
              isTie: false
            }
          });
        }, 3000);
        
        return newScore;
      }
      
      // Check if all overs are completed (4 overs match = 24 balls)
      const totalBalls = matchDetails.overs * 6;
      if (newBalls >= totalBalls) {
        console.log(`[LiveMatch] All overs completed (${newBalls} balls)`);
        endInnings();
        return newScore;
      }
      
      return newScore;
    });
    
    // Update batsman stats
    setPlayerStats(prev => {
      const newStats = {
        ...prev,
        [striker]: {
          ...(prev[striker] || {
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            out: false
          }),
          runs: (prev[striker]?.runs || 0) + runs,
          balls: (prev[striker]?.balls || 0) + 1,
          fours: runs === 4 ? (prev[striker]?.fours || 0) + 1 : (prev[striker]?.fours || 0),
          sixes: runs === 6 ? (prev[striker]?.sixes || 0) + 1 : (prev[striker]?.sixes || 0)
        }
      };
      console.log(`👤 [LiveMatch] ${striker}'s stats: ${newStats[striker].runs} (${newStats[striker].balls}), ${newStats[striker].fours}x4, ${newStats[striker].sixes}x6`);
      return newStats;
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
    
    // Handle strike rotation for odd runs
    if (runs % 2 === 1 && !isMatchComplete) {
      setStriker(prevStriker => {
        // Only add commentary if we're actually changing strikers
        if (prevStriker !== nonStriker) {
          addCommentary(`${prevStriker} takes a single, strike rotates.`);
          setNonStriker(prevStriker);
        }
        return nonStriker;
      });
    } else if (runs === 4) {
      addCommentary('FOUR! Great shot!');
    } else if (runs === 6) {
      addCommentary('SIX! What a hit!');
    }
    
    // Update ball count and check for over completion
    setCurrentBall(prevBall => {
      const newBall = prevBall + 1;
      
      // If over is complete (6 balls), handle over completion
      if (newBall >= 6) {
        setCurrentBall(0);
        setCurrentOver(prevOver => {
          const newOver = prevOver + 1;
          const isInningsComplete = newOver >= matchDetails.overs;
          
          // Only add commentary if match is still in progress
          if (!isMatchComplete) {
            addCommentary(`Over ${newOver} completed.${isInningsComplete ? ' Innings complete!' : ''}`);
          }
          
          // If this was the last over, end the innings
          if (isInningsComplete && !isMatchComplete) {
            setTimeout(() => endInnings(), 500);
          }
          
          return newOver;
        });
        
        // Only rotate strike if match is still in progress
        if (!isMatchComplete) {
          setStriker(prevStriker => {
            setNonStriker(prevStriker);
            return nonStriker;
          });
          
          // Show bowler selection for next over if not the last over
          if ((currentOver + 1) < matchDetails.overs) {
            setShowBowlerSelection(true);
          }
        }
        
        return 0;
      }
      
      return newBall;
    });
    
    // Log updated state after adding runs
    logMatchState(`Added ${runs} run(s)`);
  };

  // Handle dot ball (no runs)
  const nextBall = () => {
    if (isMatchComplete || !matchDetails) return;
    
    // Update total balls first to ensure we have the latest count
    setScore(prev => {
      const newBalls = prev.balls + 1;
      const totalBalls = matchDetails.overs * 6;
      
      // Check if all overs are completed (4 overs = 24 balls)
      if (newBalls >= totalBalls) {
        console.log(`[LiveMatch] All overs completed (${newBalls} balls)`);
        endInnings();
        return { ...prev, balls: newBalls };
      }
      
      return { ...prev, balls: newBalls };
    });
    
    // Update balls faced by striker
    setPlayerStats(prevStats => ({
      ...prevStats,
      [striker]: {
        ...(prevStats[striker] || {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          out: false
        }),
        balls: (prevStats[striker]?.balls || 0) + 1
      }
    }));
    
    // Update balls bowled by bowler
    setBowlerStats(prevStats => ({
      ...prevStats,
      [bowler]: {
        ...(prevStats[bowler] || {
          runs: 0,
          balls: 0,
          wickets: 0,
          maidens: 0,
          overs: 0
        }),
        balls: (prevStats[bowler]?.balls || 0) + 1
      }
    }));
    
    // Add to commentary
    addCommentary(`${bowler} to ${striker}, no run.`);
    
    // Update ball count and check for over completion
    setCurrentBall(prevBall => {
      const newBall = prevBall + 1;
      
      // If over is complete (6 balls), handle over completion
      if (newBall >= 6) {
        setCurrentBall(0);
        setCurrentOver(prevOver => {
          const newOver = prevOver + 1;
          const isInningsComplete = newOver >= matchDetails.overs;
          
          // Only add commentary if match is still in progress
          if (!isMatchComplete) {
            addCommentary(`Over ${newOver} completed.${isInningsComplete ? ' Innings complete!' : ''}`);
          }
          
          // If this was the last over, end the innings
          if (isInningsComplete && !isMatchComplete) {
            setTimeout(() => endInnings(), 500);
          }
          
          return newOver;
        });
        
        // Only rotate strike if match is still in progress
        if (!isMatchComplete) {
          setStriker(prevStriker => {
            setNonStriker(prevStriker);
            return nonStriker;
          });
          
          // Show bowler selection for next over if not the last over
          if ((currentOver + 1) < matchDetails.overs) {
            setShowBowlerSelection(true);
          }
        }
        
        return 0;
      }
      
      return newBall;
    });
  };
  
  // Add a wicket
  const addWicket = () => {
    if (isMatchComplete) return;
    
    const newPlayerStats = { ...playerStats };
    const newBowlerStats = { ...bowlerStats };
    
    // Update bowler's wicket count
    newBowlerStats[bowler] = {
      ...newBowlerStats[bowler],
      wickets: (newBowlerStats[bowler]?.wickets || 0) + 1,
      balls: (newBowlerStats[bowler]?.balls || 0) + 1
    };
    
    // Update batsman's stats
    newPlayerStats[striker] = {
      ...newPlayerStats[striker],
      out: true,
      howOut: 'b ' + bowler,
      balls: (newPlayerStats[striker]?.balls || 0) + 1
    };
    
    // Add to commentary
    const newCommentary = [...commentary, {
      id: Date.now(),
      message: `Wicket! ${striker} is out! ${bowler} takes the wicket.`,
      timestamp: new Date().toLocaleTimeString()
    }];
    
    // Update score
    const newScore = {
      ...score,
      wickets: score.wickets + 1,
      balls: score.balls + 1
    };
    
    // Check if all out or target achieved
    if (newScore.wickets >= parseInt(matchDetails.playersPerTeam) - 1) {
      endInnings();
      return;
    }
    
    // Find next batsman
    const nextBatsman = availableBatsmen.find(
      player => player !== striker && 
               player !== nonStriker && 
               !newPlayerStats[player]?.out
    );
    
    if (nextBatsman) {
      setStriker(nextBatsman);
      newPlayerStats[nextBatsman] = newPlayerStats[nextBatsman] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
      
      // Add to commentary
      newCommentary.push({
        id: Date.now() + 1,
        message: `${nextBatsman} is the new batsman.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    setPlayerStats(newPlayerStats);
    setBowlerStats(newBowlerStats);
    setScore(newScore);
    setCommentary(newCommentary);
    
    // Check for end of over
    if ((score.balls + 1) % 6 === 0) {
      handleOverCompletion();
    }
  };
  
  // Handle over completion
  const handleOverCompletion = () => {
    console.log('[LiveMatch] handleOverCompletion called');
    
    // Update current over and ball
    setCurrentBall(0);
    setCurrentOver(prevOver => {
      const newOver = prevOver + 1;
      const isInningsComplete = newOver >= matchDetails.overs;
      
      addCommentary(`Over ${newOver} completed.${isInningsComplete ? ' Innings complete!' : ''}`);
      
      // If this was the last over, end the innings
      if (isInningsComplete) {
        setTimeout(() => endInnings(), 500);
      }
      
      return newOver;
    });
    
    // Only rotate strike if the match is still in progress
    if (!isMatchComplete) {
      setStriker(prevStriker => {
        setNonStriker(prevStriker);
        return nonStriker;
      });
    }
    
    // Show bowler selection for next over if match is not complete
    if (!isMatchComplete && (currentOver + 1) < matchDetails.overs) {
      setShowBowlerSelection(true);
    }
  };
  
  // Handle new bowler selection after over
  const selectNewBowler = (newBowler) => {
    if (!newBowler) return;
    
    setBowler(newBowler);
    setShowBowlerSelection(false);
    
    // Add to commentary
    setCommentary(prev => [...prev, {
      id: Date.now(),
      message: `${newBowler} will bowl the next over.`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };
  
  // Handle end of innings
  const endInnings = () => {
    if (!matchDetails || isMatchComplete) return;
    
    const battingTeam = matchDetails.toss.choice === 'bat' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
    
    const bowlingTeam = matchDetails.toss.choice === 'bowl' 
      ? 'team' + matchDetails.toss.winner 
      : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
    
    console.log(`[LiveMatch] endInnings called - isSecondInnings: ${isSecondInnings}, score:`, score);
      
    // Determine if this is the end of the match
    const maxWickets = parseInt(matchDetails.playersPerTeam) - 1;
    const isMatchOver = isSecondInnings || score.wickets >= maxWickets || score.balls >= matchDetails.overs * 6;
    
    // If first innings is complete, show innings break
    if (!isSecondInnings && !isMatchOver) {
      const targetScore = score.runs + 1;
      setTarget(targetScore);
      setInningsBreakData({
        score: score.runs,
        target: targetScore,
        battingTeam: matchDetails[battingTeam]?.name || `Team ${battingTeam.slice(-1)}`,
        bowlingTeam: matchDetails[bowlingTeam]?.name || `Team ${bowlingTeam.slice(-1)}`
      });
      setShowInningsBreak(true);
      return;
    }
    
    if (isMatchOver) {
      setIsMatchComplete(true);
      
      // Determine match result
      let result = { winner: '', margin: '', isTie: false };
      
      if (isSecondInnings) {
        // Second innings complete - determine winner based on runs
        const runsNeeded = target - score.runs - 1;
        
        if (runsNeeded < 0) {
          // Batting team wins
          result.winner = battingTeam;
          const ballsRemaining = matchDetails.overs * 6 - score.balls;
          result.margin = `${Math.abs(runsNeeded)} wicket${Math.abs(runsNeeded) !== 1 ? 's' : ''} with ${ballsRemaining} ball${ballsRemaining !== 1 ? 's' : ''} remaining`;
        } else if (runsNeeded === 0) {
          // Match tied
          result.isTie = true;
          result.winner = '';
        } else {
          // Bowling team wins
          result.winner = bowlingTeam;
          result.margin = `${runsNeeded} run${runsNeeded !== 1 ? 's' : ''}`;
        }
      } else {
        // First innings complete - set target and prepare for second innings
        const targetScore = score.runs + 1;
        setTarget(targetScore);
        setIsSecondInnings(true);
        
        // Reset match state for second innings
        setCurrentOver(0);
        setCurrentBall(0);
        setScore({ runs: 0, wickets: 0, balls: 0 });
        
        // Switch batting and bowling teams for second innings
        const newBowlingTeam = matchDetails.toss.choice === 'bowl' 
          ? 'team' + matchDetails.toss.winner 
          : 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A');
          
        const newBattingTeam = matchDetails.toss.choice === 'bat' 
          ? 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A')
          : 'team' + matchDetails.toss.winner;
        
        // Set new batsmen and bowlers
        const newStriker = matchDetails[newBattingTeam]?.players?.[0] || 'Batsman 1';
        const newNonStriker = matchDetails[newBattingTeam]?.players?.[1] || 'Batsman 2';
        const newBowler = matchDetails[newBowlingTeam]?.players?.[0] || 'Bowler 1';
        
        setStriker(newStriker);
        setNonStriker(newNonStriker);
        setBowler(newBowler);
        
        // Reset player stats for second innings
        const initialPlayerStats = {};
        matchDetails[newBattingTeam]?.players?.forEach(player => {
          initialPlayerStats[player] = { 
            runs: 0, 
            balls: 0, 
            fours: 0, 
            sixes: 0, 
            out: false 
          };
        });
        
        setPlayerStats(initialPlayerStats);
        
        // Reset bowler stats for second innings
        const initialBowlerStats = {};
        matchDetails[newBowlingTeam]?.players?.forEach(player => {
          initialBowlerStats[player] = { 
            runs: 0, 
            balls: 0, 
            wickets: 0, 
            maidens: 0, 
            overs: 0 
          };
        });
        
        setBowlerStats(initialBowlerStats);
        
        // Add commentary
        addCommentary(`\n🏏 End of first innings! ${matchDetails[newBattingTeam]?.name || 'The batting team'} need ${targetScore} runs to win.`);
        addCommentary(`${newStriker} and ${newNonStriker} are opening the batting.`);
        addCommentary(`${newBowler} to bowl the first over.`);
        
        setIsMatchComplete(false); // Reset match complete flag for second innings
        return; // Exit early as we're starting second innings
      }
      
      // If we get here, the match is truly complete
      setMatchResult(result);
      setShowResult(true);
      
      // Add appropriate commentary only if we haven't already shown the result
      if (!commentary.some(c => c.message.includes('🏆'))) {
        if (result.isTie) {
          addCommentary(`\n🏆 Match Tied!`);
        } else if (result.winner) {
          const teamName = matchDetails[result.winner]?.name || `Team ${result.winner.slice(-1)}`;
          addCommentary(`\n🏆 ${teamName} wins by ${result.margin}!`);
        } else {
          addCommentary(`\n🏏 Match completed.`);
        }
      }
      
      // After showing the result, navigate to match summary after 3 seconds
      const { batsmen: topBatsmen, bowlers: topBowlers } = getTopPerformers();
      setTimeout(() => {
        navigate('/match-summary', {
          state: {
            matchDetails,
            result: result,
            playerStats,
            bowlerStats,
            topBatsmen: topBatsmen.slice(0, 3),
            topBowlers: topBowlers.slice(0, 3),
            score,
            target: isSecondInnings ? target : null,
            isTie: result.isTie
          }
        });
      }, 3000);
    }
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

  // Start second innings
  const startSecondInnings = () => {
    if (!matchDetails) return;
    
    const newBattingTeam = matchDetails.toss.choice === 'bat' 
      ? 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A')
      : 'team' + matchDetails.toss.winner;
      
    const newBowlingTeam = matchDetails.toss.choice === 'bowl' 
      ? 'team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A')
      : 'team' + matchDetails.toss.winner;
    
    console.log('Starting second innings:', { newBattingTeam, newBowlingTeam });
    
    // Reset match state for second innings
    setCurrentOver(0);
    setCurrentBall(0);
    setScore({ runs: 0, wickets: 0, balls: 0 });
    setIsSecondInnings(true);
    setShowInningsBreak(false);
    
    // Get the new batting and bowling teams' players
    const newBattingTeamPlayers = [...(matchDetails[newBattingTeam]?.players || [])];
    const newBowlingTeamPlayers = [...(matchDetails[newBowlingTeam]?.players || [])];
    
    console.log('New batting team players:', newBattingTeamPlayers);
    console.log('New bowling team players:', newBowlingTeamPlayers);
    
    // Set available batsmen and bowlers
    setAvailableBatsmen(newBattingTeamPlayers);
    setAvailableBowlers(newBowlingTeamPlayers);
    
    // Reset selected players
    setSelectedBatsmen([]);
    setSelectedBowler('');
    setStriker('');
    setNonStriker('');
    setBowler('');
    
    // Reset player stats for second innings
    const initialPlayerStats = {};
    newBattingTeamPlayers.forEach(player => {
      initialPlayerStats[player] = { 
        runs: 0, 
        balls: 0, 
        fours: 0, 
        sixes: 0, 
        out: false 
      };
    });
    
    // Reset bowler stats for second innings
    const initialBowlerStats = {};
    newBowlingTeamPlayers.forEach(player => {
      initialBowlerStats[player] = { 
        runs: 0, 
        balls: 0, 
        wickets: 0, 
        maidens: 0, 
        overs: 0 
      };
    });
    
    setPlayerStats(initialPlayerStats);
    setBowlerStats(initialBowlerStats);
    
    // Set the batting and bowling teams for the second innings
    setBattingTeam(newBattingTeam);
    setBowlingTeam(newBowlingTeam);
    
    // Show batsman selection modal
    setShowBatsmanSelection(true);
    
    // Add commentary
    addCommentary(`\n🏏 Second Innings! ${matchDetails[newBattingTeam]?.name || 'The batting team'} need ${target} runs to win.`);
  };

  // Innings Break Screen
  if (showInningsBreak) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full">
          <div className="text-4xl font-bold mb-6 text-yellow-400 animate-bounce">
            INNINGS BREAK
          </div>
          
          <div className="mb-8 p-6 bg-gray-700 rounded-lg">
            <div className="text-2xl font-semibold mb-4">First Innings Complete</div>
            <div className="text-4xl font-bold text-green-400 mb-2">{inningsBreakData.score} / {score.wickets}</div>
            <div className="text-gray-300 mb-6">in {formatOverDisplay(score.balls)} overs</div>
            
            <div className="text-xl mb-4">
              <span className="font-semibold">{inningsBreakData.battingTeam}</span> set a target of 
              <span className="font-bold text-2xl text-yellow-300"> {inningsBreakData.target}</span>
            </div>
            
            <div className="text-lg text-gray-300 mb-6">
              {inningsBreakData.bowlingTeam} need {inningsBreakData.target} runs to win
            </div>
          </div>
          
          <button
            onClick={startSecondInnings}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105"
          >
            Start Second Innings
          </button>
        </div>
      </div>
    );
  }

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

  // Result Modal Component
  const ResultModal = ({ show, onClose, result, matchDetails }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {result.isTie ? '🏆 Match Tied! 🏆' : `🏆 ${matchDetails[result.winner]?.name || 'Winning Team'} Wins!`}
          </h2>
          
          {!result.isTie && (
            <p className="text-center text-lg mb-4">
              Won by {result.margin}
            </p>
          )}
          
          <div className="mt-6 flex justify-center">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Calculate current run rate (runs per over)
  const currentRR = () => {
    const totalBalls = currentOver * 6 + currentBall;
    if (totalBalls === 0) return '0.00';
    const overs = totalBalls / 6;
    const runRate = score.runs / overs;
    return runRate.toFixed(2);
  };
  
  // Calculate required run rate for second innings
  const calculateRR = () => {
    if (!isSecondInnings || !target) return '0.00';
    const runsNeeded = target - score.runs - 1; // -1 because target is score+1 to win
    const ballsRemaining = (matchDetails.overs * 6) - (currentOver * 6 + currentBall);
    
    if (ballsRemaining <= 0) return '0.00';
    if (runsNeeded <= 0) return '0.00';
    
    const oversRemaining = ballsRemaining / 6;
    const requiredRR = runsNeeded / oversRemaining;
    return requiredRR.toFixed(2);
  };
  
  // Calculate striker's strike rate (runs per 100 balls)
  const getStrikeRate = (player) => {
    if (!player || !playerStats[player] || !playerStats[player].balls) return '0.00';
    const sr = (playerStats[player].runs / playerStats[player].balls) * 100;
    return sr.toFixed(2);
  };
  
  // Calculate bowler's economy rate (runs per over)
  const getEconomyRate = (bowler) => {
    if (!bowler || !bowlerStats[bowler] || !bowlerStats[bowler].balls) return '0.00';
    const overs = bowlerStats[bowler].balls / 6;
    const economy = bowlerStats[bowler].runs / overs;
    return economy.toFixed(2);
  };

  return (
    <div className="p-4 relative">
      {/* Result Modal */}
      <ResultModal 
        show={showResult} 
        onClose={() => setShowResult(false)} 
        result={matchResult}
        matchDetails={matchDetails}
      />
      
      {/* Batsman Selection Modal */}
      {showBatsmanSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select Opening Batsmen</h2>
            <p className="text-sm text-gray-600 mb-4">Select 2 batsmen to open the innings</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {availableBatsmen.map((player, index) => (
                <div 
                  key={`batsman-${index}`}
                  onClick={() => handleBatsmanSelect(player)}
                  className={`p-3 border rounded cursor-pointer ${selectedBatsmen.includes(player) ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  {player}
                  {selectedBatsmen.includes(player) && ' ✓'}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => setShowBatsmanSelection(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (selectedBatsmen.length === 2) {
                    setShowBatsmanSelection(false);
                    setShowBowlerSelection(true);
                  }
                }}
                disabled={selectedBatsmen.length !== 2}
                className={`px-4 py-2 rounded text-white ${selectedBatsmen.length === 2 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Next: Select Bowler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bowler Selection Modal */}
      {showBowlerSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select Opening Bowler</h2>
            <p className="text-sm text-gray-600 mb-4">Select the bowler for the first over</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {availableBowlers.map((player, index) => (
                <div 
                  key={`bowler-${index}`}
                  onClick={() => handleBowlerSelect(player)}
                  className={`p-3 border rounded cursor-pointer ${selectedBowler === player ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  {player}
                  {selectedBowler === player && ' ✓'}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => {
                  setShowBowlerSelection(false);
                  setShowBatsmanSelection(true);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Back
              </button>
              <button 
                onClick={confirmSelections}
                disabled={!selectedBowler}
                className={`px-4 py-2 rounded text-white ${selectedBowler ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Start Match
              </button>
            </div>
          </div>
        </div>
      )}
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
            
            {!isMatchStarted ? (
              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Ready to start the match?</h2>
                <button
                  onClick={startMatch}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
                >
                  Start Match
                </button>
              </div>
            ) : (
              <div className="p-4">
                {/* Scorecard */}
                <div className="mb-6">
                  <div className="bg-white rounded-lg p-4 shadow mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {matchDetails.toss.choice === 'bat' 
                            ? matchDetails['team' + matchDetails.toss.winner]?.name || `Team ${matchDetails.toss.winner}`
                            : matchDetails['team' + (matchDetails.toss.winner === 'A' ? 'B' : 'A')]?.name || `Team ${matchDetails.toss.winner === 'A' ? 'B' : 'A'}`
                          }
                        </h3>
                        <p className="text-3xl font-bold my-1">
                          {score.runs}/{score.wickets} <span className="text-lg text-gray-600">({currentOver}.{currentBall})</span>
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">CRR: </span>
                            <span className="text-gray-700">{currentRR()}</span>
                          </div>
                          {isSecondInnings && (
                            <>
                              <div>
                                <span className="font-medium">Target: </span>
                                <span className="text-gray-700">{target}</span>
                              </div>
                              <div>
                                <span className="font-medium">Req. RR: </span>
                                <span className="text-gray-700">{calculateRR()}</span>
                              </div>
                              <div>
                                <span className="font-medium">Overs Left: </span>
                                <span className="text-gray-700">
                                  {matchDetails.overs - currentOver - 1}.{6 - currentBall}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Overs: {matchDetails.overs}</p>
                      </div>
                    </div>
                  </div>

                  {/* Batsmen and Bowler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">Batting</h3>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 pb-1 border-b">
                            <div className="col-span-6">Batsman</div>
                            <div className="col-span-2 text-right">Runs</div>
                            <div className="col-span-2 text-right">Balls</div>
                            <div className="col-span-2 text-right">SR</div>
                          </div>
                          <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 items-center bg-blue-50 p-2 rounded">
                              <div className="col-span-6 font-medium">
                                {striker || 'Batsman 1'}*
                                {playerStats[striker]?.fours > 0 && ` (${playerStats[striker].fours}x4)`}
                                {playerStats[striker]?.sixes > 0 && ` (${playerStats[striker].sixes}x6)`}
                              </div>
                              <div className="col-span-2 text-right">{playerStats[striker]?.runs || 0}</div>
                              <div className="col-span-2 text-right">{playerStats[striker]?.balls || 0}</div>
                              <div className="col-span-2 text-right">{getStrikeRate(striker)}</div>
                            </div>
                            <div className="grid grid-cols-12 gap-2 items-center p-2">
                              <div className="col-span-6">
                                {nonStriker || 'Batsman 2'}
                                {playerStats[nonStriker]?.fours > 0 && ` (${playerStats[nonStriker].fours}x4)`}
                                {playerStats[nonStriker]?.sixes > 0 && ` (${playerStats[nonStriker].sixes}x6)`}
                              </div>
                              <div className="col-span-2 text-right">{playerStats[nonStriker]?.runs || 0}</div>
                              <div className="col-span-2 text-right">{playerStats[nonStriker]?.balls || 0}</div>
                              <div className="col-span-2 text-right">{getStrikeRate(nonStriker)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">Bowling</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 pb-1 border-b">
                          <div className="col-span-6">Bowler</div>
                          <div className="col-span-2 text-right">Overs</div>
                          <div className="col-span-2 text-right">Runs</div>
                          <div className="col-span-2 text-right">Wkts</div>
                        </div>
                        {bowler && (
                          <div className="grid grid-cols-12 gap-2 items-center bg-blue-50 p-2 rounded">
                            <div className="col-span-6 font-medium">
                              {bowler}
                            </div>
                            <div className="col-span-2 text-right">
                              {Math.floor((bowlerStats[bowler]?.balls || 0) / 6)}.{(bowlerStats[bowler]?.balls || 0) % 6}
                            </div>
                            <div className="col-span-2 text-right">
                              {bowlerStats[bowler]?.runs || 0}
                            </div>
                            <div className="col-span-2 text-right">
                              {bowlerStats[bowler]?.wickets || 0}
                            </div>
                            <div className="col-span-12 text-right text-xs text-gray-600 mt-1">
                              Econ: {getEconomyRate(bowler)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match Controls and Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Match Controls</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6].map((run) => (
                <button
                  key={run}
                  onClick={() => addRun(run)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded-lg transition-colors text-sm sm:text-base"
                  disabled={isMatchComplete || !isMatchStarted}
                >
                  {run} Run{run > 1 ? 's' : ''}
                </button>
              ))}
              <button
                onClick={addWicket}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-2 rounded-lg transition-colors text-sm sm:text-base col-span-2"
                disabled={isMatchComplete || !isMatchStarted || score.wickets >= parseInt(matchDetails.playersPerTeam) - 1}
              >
                Wicket
              </button>
              <button
                onClick={nextBall}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-2 rounded-lg transition-colors text-sm sm:text-base col-span-3"
                disabled={isMatchComplete || !isMatchStarted}
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
        </div>
        
        {/* Top Performers */}
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
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
    </div>
  );
};

export default LiveMatch;
