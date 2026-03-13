import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { liveScoringAPI, matchesAPI, playersAPI, teamsAPI } from '../../services/api';
import { FiPlay, FiPause, FiPlus, FiEdit, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLiveScoring = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [scoring, setScoring] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Ball input state
    const [ballInput, setBallInput] = useState({
        batsman: '',
        bowler: '',
        runs: 0,
        extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 },
        isWicket: false,
        wicketType: '',
        fielder: '',
        commentary: ''
    });

    useEffect(() => {
        fetchData();
    }, [matchId]);

    const fetchData = async () => {
        try {
            const [matchRes, teamsRes, playersRes] = await Promise.all([
                matchesAPI.getOne(matchId),
                teamsAPI.getAll(),
                playersAPI.getAll()
            ]);
            
            setMatch(matchRes.data.match);
            setTeams(teamsRes.data.teams);
            setPlayers(playersRes.data.players);
            
            // Try to get existing scoring
            try {
                const scoringRes = await liveScoringAPI.getLiveScoring(matchId);
                setScoring(scoringRes.data.scoring);
            } catch (err) {
                // No scoring exists yet
                setScoring(null);
            }
        } catch (error) {
            toast.error('Failed to fetch match data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startLiveScoring = async () => {
        try {
            const team1 = teams.find(t => t._id === match.team1);
            const team2 = teams.find(t => t._id === match.team2);
            
            const data = {
                tossWinner: team1._id, // You can make this dynamic
                tossDecision: 'bat',
                battingTeam: team1._id,
                bowlingTeam: team2._id
            };
            
            const response = await liveScoringAPI.startLiveScoring(matchId, data);
            setScoring(response.data.scoring);
            toast.success('Live scoring started!');
        } catch (error) {
            toast.error('Failed to start live scoring');
            console.error(error);
        }
    };

    const addBall = async () => {
        try {
            const response = await liveScoringAPI.addBall(matchId, ballInput);
            setScoring(response.data.scoring);
            
            // Reset ball input
            setBallInput({
                batsman: ballInput.batsman,
                bowler: ballInput.bowler,
                runs: 0,
                extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 },
                isWicket: false,
                wicketType: '',
                fielder: '',
                commentary: ''
            });
            
            toast.success('Ball added successfully!');
        } catch (error) {
            toast.error('Failed to add ball');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!match) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <h3>Match not found</h3>
                <button onClick={() => navigate('/admin/matches')} className="btn btn-primary">
                    Back to Matches
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Live Scoring</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    {match.team1Name} vs {match.team2Name}
                </p>
            </div>

            {!scoring ? (
                // Start Scoring
                <div style={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 24,
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: 16 }}>Start Live Scoring</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                        Begin live scoring for this match
                    </p>
                    <button 
                        onClick={startLiveScoring}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
                    >
                        <FiPlay />
                        Start Live Scoring
                    </button>
                </div>
            ) : (
                // Live Scoring Interface
                <LiveScoringInterface 
                    scoring={scoring}
                    players={players}
                    ballInput={ballInput}
                    setBallInput={setBallInput}
                    addBall={addBall}
                />
            )}
        </div>
    );
};
// Live Scoring Interface Component
const LiveScoringInterface = ({ scoring, players, ballInput, setBallInput, addBall }) => {
    const currentInnings = scoring.currentInnings === 1 ? scoring.firstInnings : scoring.secondInnings;
    
    const battingTeamPlayers = players.filter(p => 
        p.team === currentInnings?.battingTeam?._id || p.team === currentInnings?.battingTeam
    );
    
    const bowlingTeamPlayers = players.filter(p => 
        p.team === currentInnings?.bowlingTeam?._id || p.team === currentInnings?.bowlingTeam
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Current Score Display */}
            <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)', 
                padding: 20 
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3>{currentInnings?.battingTeam?.name || 'Batting Team'}</h3>
                        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                            {currentInnings?.totalRuns || 0}/{currentInnings?.wickets || 0}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {Math.floor((currentInnings?.balls || 0) / 6)}.{(currentInnings?.balls || 0) % 6} overs
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>VS</div>
                    
                    <div style={{ textAlign: 'center' }}>
                        <h3>{currentInnings?.bowlingTeam?.name || 'Bowling Team'}</h3>
                        <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                            {scoring.isLive ? 'Bowling' : 'Waiting'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ball Input Form */}
            <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)', 
                padding: 24 
            }}>
                <h3 style={{ marginBottom: 20 }}>Add Ball</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                    {/* Batsman */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                            Batsman
                        </label>
                        <select
                            value={ballInput.batsman}
                            onChange={(e) => setBallInput({...ballInput, batsman: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">Select Batsman</option>
                            {battingTeamPlayers.map(player => (
                                <option key={player._id} value={player._id}>
                                    {player.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bowler */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                            Bowler
                        </label>
                        <select
                            value={ballInput.bowler}
                            onChange={(e) => setBallInput({...ballInput, bowler: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">Select Bowler</option>
                            {bowlingTeamPlayers.map(player => (
                                <option key={player._id} value={player._id}>
                                    {player.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Runs */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                            Runs
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="6"
                            value={ballInput.runs}
                            onChange={(e) => setBallInput({...ballInput, runs: parseInt(e.target.value) || 0})}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>

                {/* Quick Run Buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {[0, 1, 2, 3, 4, 6].map(runs => (
                        <button
                            key={runs}
                            onClick={() => setBallInput({...ballInput, runs})}
                            style={{
                                padding: '8px 16px',
                                background: ballInput.runs === runs ? 'var(--gold)' : 'var(--bg-elevated)',
                                color: ballInput.runs === runs ? '#000' : 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {runs}
                        </button>
                    ))}
                </div>

                {/* Extras */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontSize: '0.9rem', fontWeight: 600 }}>
                        Extras
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {['wide', 'noBall', 'bye', 'legBye'].map(extra => (
                            <div key={extra}>
                                <label style={{ fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>
                                    {extra.charAt(0).toUpperCase() + extra.slice(1)}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={ballInput.extras[extra]}
                                    onChange={(e) => setBallInput({
                                        ...ballInput, 
                                        extras: {
                                            ...ballInput.extras,
                                            [extra]: parseInt(e.target.value) || 0
                                        }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 4,
                                        color: 'var(--text-primary)',
                                        fontSize: '0.8rem'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wicket */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input
                            type="checkbox"
                            checked={ballInput.isWicket}
                            onChange={(e) => setBallInput({...ballInput, isWicket: e.target.checked})}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Wicket</span>
                    </label>
                    
                    {ballInput.isWicket && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <select
                                value={ballInput.wicketType}
                                onChange={(e) => setBallInput({...ballInput, wicketType: e.target.value})}
                                style={{
                                    padding: '8px 12px',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="">Wicket Type</option>
                                <option value="bowled">Bowled</option>
                                <option value="caught">Caught</option>
                                <option value="lbw">LBW</option>
                                <option value="stumped">Stumped</option>
                                <option value="runout">Run Out</option>
                                <option value="hitwicket">Hit Wicket</option>
                            </select>
                            
                            {(ballInput.wicketType === 'caught' || ballInput.wicketType === 'runout') && (
                                <select
                                    value={ballInput.fielder}
                                    onChange={(e) => setBallInput({...ballInput, fielder: e.target.value})}
                                    style={{
                                        padding: '8px 12px',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 6,
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="">Select Fielder</option>
                                    {bowlingTeamPlayers.map(player => (
                                        <option key={player._id} value={player._id}>
                                            {player.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>

                {/* Commentary */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                        Commentary
                    </label>
                    <textarea
                        value={ballInput.commentary}
                        onChange={(e) => setBallInput({...ballInput, commentary: e.target.value})}
                        placeholder="Add commentary for this ball..."
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            color: 'var(--text-primary)',
                            minHeight: 60,
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Add Ball Button */}
                <button
                    onClick={addBall}
                    disabled={!ballInput.batsman || !ballInput.bowler}
                    className="btn btn-primary"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        opacity: (!ballInput.batsman || !ballInput.bowler) ? 0.5 : 1
                    }}
                >
                    <FiPlus />
                    Add Ball
                </button>
            </div>

            {/* Recent Balls */}
            {currentInnings?.overs && currentInnings.overs.length > 0 && (
                <div style={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 20 
                }}>
                    <h3 style={{ marginBottom: 16 }}>Recent Balls</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {currentInnings.overs.slice(-3).reverse().map((over, overIndex) => (
                            <div key={overIndex}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>
                                    Over {over.overNumber}
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {over.balls.map((ball, ballIndex) => (
                                        <div
                                            key={ballIndex}
                                            style={{
                                                padding: '4px 8px',
                                                background: ball.isWicket ? 'var(--red)' : 
                                                           ball.runs === 4 ? 'var(--blue)' :
                                                           ball.runs === 6 ? 'var(--gold)' : 'var(--bg-elevated)',
                                                color: ball.isWicket || ball.runs === 4 || ball.runs === 6 ? '#fff' : 'var(--text-primary)',
                                                borderRadius: 4,
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {ball.isWicket ? 'W' : ball.runs}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLiveScoring;