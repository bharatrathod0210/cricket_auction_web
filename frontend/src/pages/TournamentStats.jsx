import { useState, useEffect } from 'react';
import { tournamentAPI } from '../services/api';
import { FiTarget, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { GiTrophyCup } from 'react-icons/gi';

const TournamentStats = () => {
    const [tournament, setTournament] = useState(null);
    const [playerStats, setPlayerStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchTournamentData();
    }, []);

    const fetchTournamentData = async () => {
        try {
            const [tournamentRes, playersRes] = await Promise.all([
                tournamentAPI.getStats(),
                tournamentAPI.getPlayerStats()
            ]);

            setTournament(tournamentRes.data.tournament);
            setPlayerStats(playersRes.data.players);
        } catch (error) {
            console.error('Error fetching tournament data:', error);
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

    const tabs = [
        { id: 'overview', label: 'Overview', icon: GiTrophyCup },
        { id: 'batting', label: 'Batting', icon: GiCricketBat },
        { id: 'bowling', label: 'Bowling', icon: FiTarget },
        { id: 'points', label: 'Points Table', icon: FiTrendingUp }
    ];

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Header */}
            <div className="page-hero">
                <div className="section-tag">TOURNAMENT</div>
                <h1>RPL 2026 Statistics</h1>
                <p>Complete tournament records, player statistics, and leaderboards</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: 4,
                        marginBottom: 32,
                        background: 'var(--bg-card)',
                        padding: 4,
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)'
                    }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        background: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                                        color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
                    {activeTab === 'batting' && <BattingTab playerStats={playerStats} tournament={tournament} />}
                    {activeTab === 'bowling' && <BowlingTab playerStats={playerStats} tournament={tournament} />}
                    {activeTab === 'points' && <PointsTableTab tournament={tournament} />}
                </div>
            </section>
        </div>
    );
};
// Overview Tab Component
const OverviewTab = ({ tournament }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Tournament Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard
                icon={GiTrophyCup}
                title="Matches Played"
                value={tournament?.completedMatches || 0}
                subtitle={`of ${tournament?.totalMatches || 0} total`}
            />
            <StatCard
                icon={FiUsers}
                title="Total Runs"
                value={tournament?.totalRuns || 0}
                subtitle="across all matches"
            />
            <StatCard
                icon={FiTarget}
                title="Total Wickets"
                value={tournament?.totalWickets || 0}
                subtitle="fallen so far"
            />
            <StatCard
                icon={FiAward}
                title="Boundaries"
                value={(tournament?.totalFours || 0) + (tournament?.totalSixes || 0)}
                subtitle={`${tournament?.totalFours || 0} fours, ${tournament?.totalSixes || 0} sixes`}
            />
        </div>

        {/* Records */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Batting Records */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 20
            }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                    <GiCricketBat style={{ marginRight: 8 }} />
                    Batting Records
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <RecordItem
                        label="Highest Score"
                        value={`${tournament?.highestScore?.runs || 0} runs`}
                        player={tournament?.highestScore?.player?.name}
                    />
                    <RecordItem
                        label="Most Runs"
                        value={`${tournament?.mostRuns?.runs || 0} runs`}
                        player={tournament?.mostRuns?.player?.name}
                    />
                    <RecordItem
                        label="Best Strike Rate"
                        value={`${tournament?.bestStrikeRate?.strikeRate?.toFixed(2) || 0}`}
                        player={tournament?.bestStrikeRate?.player?.name}
                    />
                </div>
            </div>

            {/* Bowling Records */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 20
            }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                    <FiTarget style={{ marginRight: 8 }} />
                    Bowling Records
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <RecordItem
                        label="Best Figures"
                        value={`${tournament?.bestBowlingFigures?.wickets || 0}/${tournament?.bestBowlingFigures?.runs || 0}`}
                        player={tournament?.bestBowlingFigures?.player?.name}
                    />
                    <RecordItem
                        label="Most Wickets"
                        value={`${tournament?.mostWickets?.wickets || 0} wickets`}
                        player={tournament?.mostWickets?.player?.name}
                    />
                    <RecordItem
                        label="Best Economy"
                        value={`${tournament?.bestEconomy?.economy?.toFixed(2) || 0}`}
                        player={tournament?.bestEconomy?.player?.name}
                    />
                </div>
            </div>
        </div>

        {/* Player of Tournament */}
        {tournament?.playerOfTournament && (
            <div style={{
                background: 'linear-gradient(135deg, var(--gold), #FFD700)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                textAlign: 'center',
                color: '#000'
            }}>
                <GiTrophyCup style={{ fontSize: '3rem', marginBottom: 12 }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Player of the Tournament</h2>
                <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>
                    {tournament.playerOfTournament.name}
                </h3>
                <p style={{ opacity: 0.8 }}>{tournament.playerOfTournament.team?.name}</p>
            </div>
        )}
    </div>
);

// Batting Tab Component
const BattingTab = ({ playerStats, tournament }) => {
    const battingStats = playerStats
        .filter(p => p.detailedStats.runs > 0)
        .sort((a, b) => b.detailedStats.runs - a.detailedStats.runs);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Scorers */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24
            }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Top Run Scorers</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {battingStats.slice(0, 10).map((player, index) => (
                        <div key={player._id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: index < 3 ? 'rgba(212,175,55,0.1)' : 'var(--bg-glass)',
                            borderRadius: 8,
                            border: index < 3 ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: index < 3 ? 'var(--gold)' : 'var(--bg-elevated)',
                                color: index < 3 ? '#000' : 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                marginRight: 16
                            }}>
                                {index + 1}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{player.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {player.team?.name} • {player.role}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                    {player.detailedStats.runs}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    SR: {player.detailedStats.strikeRate}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Bowling Tab Component  
const BowlingTab = ({ playerStats, tournament }) => {
    const bowlingStats = playerStats
        .filter(p => p.detailedStats.wickets > 0)
        .sort((a, b) => b.detailedStats.wickets - a.detailedStats.wickets);

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24
        }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Top Wicket Takers</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bowlingStats.slice(0, 10).map((player, index) => (
                    <div key={player._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: index < 3 ? 'rgba(212,175,55,0.1)' : 'var(--bg-glass)',
                        borderRadius: 8,
                        border: index < 3 ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)'
                    }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: index < 3 ? 'var(--gold)' : 'var(--bg-elevated)',
                            color: index < 3 ? '#000' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            marginRight: 16
                        }}>
                            {index + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{player.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {player.team?.name} • {player.role}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                {player.detailedStats.wickets}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Econ: {player.detailedStats.economy}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Points Table Tab Component
const PointsTableTab = ({ tournament }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24
    }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Points Table</h3>

        {tournament?.pointsTable?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Pos</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Team</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>M</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>W</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>L</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Pts</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>NRR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournament.pointsTable
                            .sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate)
                            .map((team, index) => (
                                <tr key={team.team._id} style={{
                                    borderBottom: '1px solid var(--border)',
                                    background: index < 4 ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>{index + 1}</td>
                                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{team.team.name}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{team.matches}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{team.wins}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{team.losses}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700 }}>{team.points}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                        {team.netRunRate > 0 ? '+' : ''}{team.netRunRate.toFixed(3)}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Points table will be updated as matches are completed
            </div>
        )}
    </div>
);

// Helper Components
const StatCard = ({ icon: Icon, title, value, subtitle }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        textAlign: 'center'
    }}>
        <Icon style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: 12 }} />
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>
            {value}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</div>
    </div>
);

const RecordItem = ({ label, value, player }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{player || 'N/A'}</div>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>
            {value}
        </div>
    </div>
);

export default TournamentStats;