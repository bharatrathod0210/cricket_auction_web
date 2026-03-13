import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { liveScoringAPI } from '../services/api';
import { FiPlay, FiPause, FiTarget, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';

const LiveScoring = () => {
    const { matchId } = useParams();
    const [scoring, setScoring] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLiveScoring();
        const interval = setInterval(fetchLiveScoring, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [matchId]);

    const fetchLiveScoring = async () => {
        try {
            const response = await liveScoringAPI.getLiveScoring(matchId);
            setScoring(response.data.scoring);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch live scoring');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ paddingTop: 'var(--nav-height)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state">
                    <div className="empty-icon" style={{ fontSize: '4rem' }}>🏏</div>
                    <h3>Live Scoring Not Available</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!scoring) {
        return (
            <div style={{ paddingTop: 'var(--nav-height)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state">
                    <div className="empty-icon" style={{ fontSize: '4rem' }}>🏏</div>
                    <h3>Match Not Started</h3>
                    <p>Live scoring will begin when the match starts.</p>
                </div>
            </div>
        );
    }

    const currentInnings = scoring.currentInnings === 1 ? scoring.firstInnings : scoring.secondInnings;
    const isLive = scoring.isLive;

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Live Header */}
            <div className="page-hero" style={{ padding: '40px 0' }}>
                <div className="section-tag">
                    {isLive ? (
                        <>
                            <span className="live-dot" style={{ display: 'inline-block', marginRight: 6 }} />
                            LIVE
                        </>
                    ) : 'MATCH'}
                </div>
                <h1>Live Scoring</h1>
                <p>Real-time match updates and statistics</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <LiveScoringContent scoring={scoring} />
                </div>
            </section>
        </div>
    );
};
// Live Scoring Content Component
const LiveScoringContent = ({ scoring }) => {
    const currentInnings = scoring.currentInnings === 1 ? scoring.firstInnings : scoring.secondInnings;
    const previousInnings = scoring.currentInnings === 2 ? scoring.firstInnings : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Current Score */}
            <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)', 
                padding: 24 
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center' }}>
                    {/* Team 1 */}
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>
                            {currentInnings?.battingTeam?.name || 'Team 1'}
                        </h3>
                        <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                            {currentInnings?.totalRuns || 0}/{currentInnings?.wickets || 0}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {Math.floor((currentInnings?.balls || 0) / 6)}.{(currentInnings?.balls || 0) % 6} overs
                        </div>
                    </div>

                    {/* VS */}
                    <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700, 
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <GiCricketBat />
                        VS
                    </div>

                    {/* Team 2 */}
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>
                            {currentInnings?.bowlingTeam?.name || 'Team 2'}
                        </h3>
                        {previousInnings ? (
                            <>
                                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                                    {previousInnings.totalRuns}/{previousInnings.wickets}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {Math.floor(previousInnings.balls / 6)}.{previousInnings.balls % 6} overs
                                </div>
                            </>
                        ) : (
                            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                                Yet to bat
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Status */}
                {scoring.isLive && (
                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: 16, 
                        padding: '8px 16px', 
                        background: 'rgba(34, 197, 94, 0.1)', 
                        border: '1px solid rgba(34, 197, 94, 0.2)', 
                        borderRadius: 8,
                        color: 'var(--green)'
                    }}>
                        🔴 LIVE - {scoring.currentInnings === 1 ? 'First' : 'Second'} Innings
                    </div>
                )}
            </div>

            {/* Current Batsmen & Bowler */}
            {currentInnings && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    {/* Batsmen */}
                    <div style={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: 20 
                    }}>
                        <h4 style={{ 
                            fontSize: '1rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: 2, 
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FiUsers style={{ marginRight: 8 }} />
                            Current Batsmen
                        </h4>
                        
                        {currentInnings.currentBatsmen?.map((batsman, index) => (
                            <div key={index} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '12px 0',
                                borderBottom: index < currentInnings.currentBatsmen.length - 1 ? '1px solid var(--border)' : 'none'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        {batsman.player?.name || 'Unknown'}
                                        {batsman.isOnStrike && <span style={{ color: 'var(--gold)', marginLeft: 8 }}>*</span>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {batsman.balls} balls • {batsman.fours} fours • {batsman.sixes} sixes
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{batsman.runs}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        SR: {batsman.strikeRate?.toFixed(1) || '0.0'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Current Bowler */}
                    <div style={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: 20 
                    }}>
                        <h4 style={{ 
                            fontSize: '1rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: 2, 
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FiTarget style={{ marginRight: 8 }} />
                            Current Bowler
                        </h4>
                        
                        {currentInnings.currentBowler && (
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>
                                    {currentInnings.currentBowler.player?.name || 'Unknown'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Overs:</span>
                                        <div style={{ fontWeight: 600 }}>{currentInnings.currentBowler.overs?.toFixed(1) || '0.0'}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Runs:</span>
                                        <div style={{ fontWeight: 600 }}>{currentInnings.currentBowler.runs || 0}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Wickets:</span>
                                        <div style={{ fontWeight: 600 }}>{currentInnings.currentBowler.wickets || 0}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Economy:</span>
                                        <div style={{ fontWeight: 600 }}>{currentInnings.currentBowler.economy?.toFixed(2) || '0.00'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Commentary */}
            {scoring.commentary && scoring.commentary.length > 0 && (
                <div style={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 20 
                }}>
                    <h4 style={{ 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: 2, 
                        marginBottom: 16 
                    }}>
                        Recent Commentary
                    </h4>
                    
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {scoring.commentary.slice(-10).reverse().map((comment, index) => (
                            <div key={index} style={{ 
                                padding: '8px 0', 
                                borderBottom: index < 9 ? '1px solid var(--border)' : 'none' 
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                    {comment.over}.{comment.ball}
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>{comment.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveScoring;