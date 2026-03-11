import { useState, useEffect } from 'react';
import { auctionAPI, playersAPI, teamsAPI } from '../../services/api';
import { FiPlay, FiSkipForward, FiCheck, FiX, FiPlus, FiMinus, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.PROD ? 'https://rpl-sihor-backend.vercel.app' : 'http://localhost:5000';

const AdminAuction = () => {
    const [auction, setAuction] = useState(null);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [bidTeam, setBidTeam] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const fetchAll = async () => {
        try {
            const [a, p, t] = await Promise.all([
                auctionAPI.get(),
                playersAPI.getAll({ auctionStatus: 'upcoming' }),
                teamsAPI.getAll(),
            ]);
            setAuction(a.data.auction);
            setPlayers(p.data.players || []);
            setTeams(t.data.teams || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await auctionAPI.create({ name: 'RPL Auction 2026', timerDuration: 30 });
            toast.success('Auction created!');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        } finally {
            setCreating(false);
        }
    };

    const handleStart = async () => {
        try {
            await auctionAPI.start(auction._id);
            toast.success('Auction started!');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    const handleBid = async () => {
        if (!bidTeam || !bidAmount) { toast.error('Select team and enter bid'); return; }
        try {
            await auctionAPI.placeBid({ auctionId: auction._id, teamId: bidTeam, amount: Number(bidAmount) });
            toast.success('Bid placed!');
            setBidAmount('');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid bid');
        }
    };

    const handleSell = async () => {
        if (!auction.currentBidTeam) { toast.error('No bid placed yet'); return; }
        try {
            await auctionAPI.sell({ auctionId: auction._id });
            toast.success('Player sold!');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    const handleUnsold = async () => {
        try {
            await auctionAPI.markUnsold({ auctionId: auction._id });
            toast.success('Player marked unsold');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    const handleStopAuction = async () => {
        if (!window.confirm('Are you sure you want to stop the auction? All remaining players will be marked as unsold.')) {
            return;
        }
        try {
            await auctionAPI.stop(auction._id);
            toast.success('Auction stopped successfully!');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error stopping auction');
        }
    };

    const handleResetPlayers = async () => {
        if (!window.confirm('Reset all players to upcoming status? This will clear teams and sold prices.')) {
            return;
        }
        try {
            const res = await playersAPI.resetForAuction();
            toast.success(res.data.message);
            fetchAll();
        } catch (err) {
            toast.error('Error resetting players');
        }
    };

    const handleResetAuction = async () => {
        if (!window.confirm('Reset auction to restart? This will clear all logs and reset to scheduled status.')) {
            return;
        }
        try {
            const res = await auctionAPI.reset(auction._id);
            toast.success(res.data.message);
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error resetting auction');
        }
    };

    const handleStartNewAuction = async () => {
        if (!window.confirm('Start a new auction with all unsold and upcoming players?')) {
            return;
        }
        try {
            // Create new auction
            const createRes = await auctionAPI.create({ name: 'RPL Auction 2026', timerDuration: 30 });
            toast.success('New auction created!');
            
            // Start the auction immediately
            const newAuctionId = createRes.data.auction._id;
            await auctionAPI.start(newAuctionId);
            toast.success('Auction started with unsold and upcoming players!');
            
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error starting new auction');
        }
    };

    const handleMoveToNext = async (playerId) => {
        try {
            const res = await auctionAPI.moveToNext(auction._id, playerId);
            toast.success('Player moved to next position');
            setAuction(res.data.auction);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error moving player');
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        // Don't allow moving the current player (index 0)
        if (draggedIndex === 0 || dropIndex === 0) {
            toast.error('Cannot move the current player');
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        try {
            // Create new queue order
            const newQueue = [...auction.playerQueue];
            const [draggedPlayer] = newQueue.splice(draggedIndex, 1);
            newQueue.splice(dropIndex, 0, draggedPlayer);

            // Update backend
            const res = await auctionAPI.reorderQueue(auction._id, newQueue.map(p => p._id));
            toast.success('Queue reordered successfully');
            setAuction(res.data.auction);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error reordering queue');
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const currentPlayer = auction?.currentPlayer;
    const playerImg = currentPlayer?.image ? `${API_BASE}${currentPlayer.image}` : null;
    const bidTeamObj = teams.find(t => t._id === bidTeam);

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Auction Control</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage the live player auction</p>
            </div>

            {/* No Auction */}
            {!auction ? (
                <div style={{ maxWidth: 400 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏏</div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No Auction Created</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
                            Create an auction to begin. All approved players ({players.length}) will be added to the queue.
                        </p>
                        <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={handleCreate} disabled={creating} id="create-auction-btn">
                            {creating ? 'Creating...' : '🚀 Create Auction'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                    {/* Main */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Status */}
                        <div style={{
                            background: auction.status === 'live' ? 'rgba(239,68,68,0.08)' : 'var(--bg-card)',
                            border: `1px solid ${auction.status === 'live' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Auction Status</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {auction.status.toUpperCase()}
                                    {auction.status === 'live' && <span className="live-dot" />}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {auction.status === 'scheduled' && (
                                    <>
                                        <button className="btn btn-outline" onClick={handleResetPlayers} id="reset-players-btn">
                                            Reset Players
                                        </button>
                                        <button className="btn btn-primary" onClick={handleStart} id="start-auction-btn">
                                            <FiPlay /> Start Auction
                                        </button>
                                    </>
                                )}
                                {auction.status === 'live' && (
                                    <button className="btn btn-danger" onClick={handleStopAuction} id="stop-auction-btn">
                                        <FiX /> Stop Auction
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Current Player */}
                        {currentPlayer && auction.status === 'live' && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>On Auction Now</div>

                                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {playerImg ? (
                                        <img src={playerImg} alt={currentPlayer.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--border)' }} />
                                    ) : (
                                        <div style={{ width: 100, height: 100, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏏</div>
                                    )}
                                    <div>
                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: 3, marginBottom: 4 }}>
                                            {currentPlayer.name}
                                        </h2>
                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                            <span className="badge badge-white">{currentPlayer.role}</span>
                                            <span className="badge badge-gold">Base: ₹{(currentPlayer.basePrice / 1000).toFixed(0)}K</span>
                                            {currentPlayer.isIconPlayer && (
                                                <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    ⭐ ICON PLAYER
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Current Bid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Current Bid</div>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--green)' }}>
                                            ₹{((auction.currentBid || currentPlayer.basePrice) / 1000).toFixed(0)}K
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Leading Team</div>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                                            {auction.currentBidTeam?.name || '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Place Bid */}
                                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Place Bid</div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <select className="form-control" style={{ flex: '1 1 200px' }} value={bidTeam} onChange={e => setBidTeam(e.target.value)} id="bid-team-select">
                                            <option value="">Select Team</option>
                                            {teams.map(t => {
                                                const rem = t.purse - t.purseSpent;
                                                return <option key={t._id} value={t._id}>{t.name} (₹{(rem / 100000).toFixed(1)}L left)</option>;
                                            })}
                                        </select>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ flex: '0 1 160px' }}
                                            placeholder={`Min: ₹${((auction.currentBid || currentPlayer.basePrice) / 1000).toFixed(0)}K`}
                                            value={bidAmount}
                                            onChange={e => setBidAmount(e.target.value)}
                                            id="bid-amount-input"
                                        />
                                        <button className="btn btn-outline" onClick={() => setBidAmount(String((auction.currentBid || currentPlayer.basePrice) + 10000))} style={{ whiteSpace: 'nowrap' }}>
                                            +10K
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setBidAmount(String((auction.currentBid || currentPlayer.basePrice) + 25000))} style={{ whiteSpace: 'nowrap' }}>
                                            +25K
                                        </button>
                                        <button className="btn btn-primary" onClick={handleBid} id="place-bid-btn">Bid</button>
                                    </div>
                                </div>

                                {/* Sell / Unsold */}
                                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                    <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSell} id="sell-player-btn">
                                        <FiCheck /> Sell to {auction.currentBidTeam?.name || '...'}
                                    </button>
                                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleUnsold} id="unsold-btn">
                                        <FiX /> Mark Unsold
                                    </button>
                                </div>
                            </div>
                        )}

                        {auction.status === 'completed' && (
                            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--green)', marginBottom: 16 }}>Auction Completed!</h3>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                    <button className="btn btn-primary" onClick={handleResetAuction} id="reset-auction-btn">
                                        🔄 Reset & Restart
                                    </button>
                                    <button className="btn btn-success" onClick={handleStartNewAuction} id="start-new-auction-btn">
                                        ✨ Start New Auction
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Auction Logs */}
                        {auction.logs?.length > 0 && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Auction Log</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                                    {[...auction.logs].reverse().map((log, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: 6, fontSize: '0.825rem' }}>
                                            <span>
                                                <strong style={{ color: '#fff' }}>{log.playerName}</strong>
                                                {log.action === 'SOLD' && <span style={{ color: 'var(--text-muted)' }}> → {log.teamName}</span>}
                                            </span>
                                            <span className={`badge ${log.action === 'SOLD' ? 'badge-green' : 'badge-red'}`}>
                                                {log.action === 'SOLD' ? `₹${(log.amount / 1000).toFixed(0)}K` : 'UNSOLD'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Teams purse + Queue */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Teams */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Teams Purse</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {teams.map(t => {
                                    const rem = t.purse - t.purseSpent;
                                    const pct = ((rem / t.purse) * 100);
                                    return (
                                        <div key={t._id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>{t.shortName}</span>
                                                <span style={{ color: rem > 200000 ? 'var(--green)' : 'var(--red)' }}>₹{(rem / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2 }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: rem > 200000 ? 'var(--green)' : 'var(--red)', borderRadius: 2, transition: 'width 0.3s' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Player Queue */}
                        {auction.playerQueue?.length > 0 && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
                                    Queue ({auction.playerQueue.length})
                                </h3>
                                {auction.status === 'live' && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiMove /> Drag to reorder players
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                                    {auction.playerQueue.slice(0, 15).map((p, i) => (
                                        <div 
                                            key={p._id || i}
                                            draggable={i > 0 && auction.status === 'live'}
                                            onDragStart={(e) => handleDragStart(e, i)}
                                            onDragOver={(e) => handleDragOver(e, i)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, i)}
                                            onDragEnd={handleDragEnd}
                                            style={{ 
                                                padding: '8px 12px', 
                                                borderRadius: 6, 
                                                background: i === 0 ? 'rgba(212,175,55,0.1)' : dragOverIndex === i ? 'rgba(212,175,55,0.15)' : 'var(--bg-glass)', 
                                                fontSize: '0.8rem', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                border: i === 0 ? '2px solid rgba(212,175,55,0.4)' : dragOverIndex === i ? '2px dashed var(--gold)' : '1px solid transparent',
                                                cursor: i > 0 && auction.status === 'live' ? 'grab' : 'default',
                                                opacity: draggedIndex === i ? 0.5 : 1,
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                        >
                                            {i > 0 && auction.status === 'live' && (
                                                <FiMove style={{ 
                                                    color: 'var(--text-muted)', 
                                                    marginRight: 8,
                                                    fontSize: '0.9rem'
                                                }} />
                                            )}
                                            <span style={{ 
                                                color: i === 0 ? 'var(--gold)' : '#fff', 
                                                flex: 1,
                                                fontWeight: i === 0 ? 600 : 400
                                            }}>
                                                {i === 0 ? '⏳ ' : `${i}. `}{p.name}
                                            </span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                                ₹{(p.basePrice / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuction;
