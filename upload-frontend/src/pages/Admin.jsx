import { useState, useEffect } from 'react'
import { matchesAPI, playersAPI, adminAPI } from '../services/api'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Admin() {
  const { addToast } = useToast()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  // Match result state
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [resultTeam1Score, setResultTeam1Score] = useState(0)
  const [resultTeam2Score, setResultTeam2Score] = useState(0)
  const [resultSubmitting, setResultSubmitting] = useState(false)

  // Goal scorers state
  const [gsMatchId, setGsMatchId] = useState('')
  const [gsPlayerSearch, setGsPlayerSearch] = useState('')
  const [gsPlayerResults, setGsPlayerResults] = useState([])
  const [gsSelectedPlayers, setGsSelectedPlayers] = useState([])
  const [gsFirstScorerId, setGsFirstScorerId] = useState(null)
  const [gsSubmitting, setGsSubmitting] = useState(false)

  // Award state
  const [topScorerName, setTopScorerName] = useState('')
  const [goldenBallName, setGoldenBallName] = useState('')
  const [goldenGloveName, setGoldenGloveName] = useState('')
  const [awardSubmitting, setAwardSubmitting] = useState(false)

  // MOTM state
  const [motmMatchId, setMotmMatchId] = useState('')
  const [motmPlayerName, setMotmPlayerName] = useState('')
  const [motmSubmitting, setMotmSubmitting] = useState(false)

  // Invite code state
  const [inviteCodes, setInviteCodes] = useState([])
  const [newCodeLabel, setNewCodeLabel] = useState('')
  const [codeGenerating, setCodeGenerating] = useState(false)

  useEffect(() => {
    async function fetchMatches() {
      try {
        const [matchRes, codesRes] = await Promise.allSettled([
          matchesAPI.getAll(),
          adminAPI.getInviteCodes(),
        ])
        if (matchRes.status === 'fulfilled') {
          setMatches(matchRes.value.data.map(m => ({
            ...m,
            team1: m.team1Name,
            team2: m.team2Name,
          })))
        }
        if (codesRes.status === 'fulfilled') setInviteCodes(codesRes.value.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  useEffect(() => {
    if (gsPlayerSearch.length < 2) {
      setGsPlayerResults([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await playersAPI.search(gsPlayerSearch)
        setGsPlayerResults(res.data.slice(0, 10))
      } catch (err) {
        console.error(err)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [gsPlayerSearch])

  const handleSubmitResult = async () => {
    if (!selectedMatchId) return
    setResultSubmitting(true)
    try {
      await adminAPI.submitMatchResult(Number(selectedMatchId), resultTeam1Score, resultTeam2Score)
      addToast('Match result submitted and points calculated', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit result', 'error')
    } finally {
      setResultSubmitting(false)
    }
  }

  const handleSubmitGoalScorers = async () => {
    if (!gsMatchId || gsSelectedPlayers.length === 0) return
    setGsSubmitting(true)
    try {
      await adminAPI.submitGoalScorers(
        Number(gsMatchId),
        gsSelectedPlayers.map(p => p.id),
        gsFirstScorerId
      )
      addToast('Goal scorers submitted and points calculated', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit goal scorers', 'error')
    } finally {
      setGsSubmitting(false)
    }
  }

  const handleAwardTopScorer = async () => {
    if (!topScorerName.trim()) return
    setAwardSubmitting(true)
    try {
      await adminAPI.awardTopScorer(topScorerName.trim())
      addToast('Top scorer points awarded', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to award', 'error')
    } finally {
      setAwardSubmitting(false)
    }
  }

  const handleAwardGoldenBall = async () => {
    if (!goldenBallName.trim()) return
    setAwardSubmitting(true)
    try {
      await adminAPI.awardGoldenBall(goldenBallName.trim())
      addToast('Golden Ball points awarded', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to award', 'error')
    } finally {
      setAwardSubmitting(false)
    }
  }

  const handleAwardGoldenGlove = async () => {
    if (!goldenGloveName.trim()) return
    setAwardSubmitting(true)
    try {
      await adminAPI.awardGoldenGlove(goldenGloveName.trim())
      addToast('Golden Glove points awarded', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to award', 'error')
    } finally {
      setAwardSubmitting(false)
    }
  }

  const handleSubmitMotm = async () => {
    if (!motmMatchId || !motmPlayerName.trim()) return
    setMotmSubmitting(true)
    try {
      await adminAPI.submitMotm(Number(motmMatchId), motmPlayerName.trim())
      addToast('MOTM set and points awarded', 'success')
      setMotmPlayerName('')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to set MOTM', 'error')
    } finally {
      setMotmSubmitting(false)
    }
  }

  const handleGenerateCode = async () => {
    setCodeGenerating(true)
    try {
      const res = await adminAPI.generateInviteCode(newCodeLabel)
      setInviteCodes([res.data, ...inviteCodes])
      setNewCodeLabel('')
      addToast(`Invite code generated: ${res.data.code}`, 'success')
    } catch (err) {
      addToast('Failed to generate code', 'error')
    } finally {
      setCodeGenerating(false)
    }
  }

  const handleDeleteCode = async (id) => {
    try {
      await adminAPI.deleteInviteCode(id)
      setInviteCodes(inviteCodes.filter(c => c.id !== id))
      addToast('Invite code deleted', 'success')
    } catch (err) {
      addToast(err.response?.data || 'Failed to delete', 'error')
    }
  }

  const [pullLoading, setPullLoading] = useState(false)
  const [pullResult, setPullResult] = useState('')

  const handlePullAllResults = async () => {
    setPullLoading(true)
    setPullResult('')
    try {
      const res = await adminAPI.pullAllResults()
      setPullResult(res.data)
      addToast(res.data, 'success')
      // Refresh matches
      const matchRes = await matchesAPI.getAll()
      setMatches(matchRes.data)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to pull results'
      setPullResult(msg)
      addToast(msg, 'error')
    } finally {
      setPullLoading(false)
    }
  }

  const handlePullSingleResult = async (matchId) => {
    setPullLoading(true)
    try {
      const res = await adminAPI.pullSingleResult(matchId)
      addToast(res.data, 'success')
      const matchRes = await matchesAPI.getAll()
      setMatches(matchRes.data)
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to pull result', 'error')
    } finally {
      setPullLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading admin panel..." />

  const selectedMatch = matches.find(m => String(m.id) === String(selectedMatchId))
  const gsMatch = matches.find(m => String(m.id) === String(gsMatchId))

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-headline font-bold text-2xl neon-glow-primary">Admin Panel</h1>
        <p className="font-label text-sm text-on-surface-variant mt-1">Manage match results and awards</p>
      </div>

      {/* Pull Results from API */}
      <div className="bg-surface-container rounded-xl p-6 border border-secondary/30 shadow-[0_0_16px_rgba(0,255,204,0.1)]">
        <h3 className="font-headline font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">cloud_download</span>
          Pull Results from Football API
        </h3>
        <p className="text-xs text-on-surface-variant mb-4">
          Automatically fetch match results and goal scorers from football-data.org for all finished matches.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePullAllResults}
            disabled={pullLoading}
            className="flex-1 py-3 bg-secondary/10 border border-secondary/50 text-secondary font-headline font-bold text-xs tracking-widest hover:bg-secondary/20 transition-all rounded disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pullLoading ? (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : (
              <span className="material-symbols-outlined text-sm">cloud_sync</span>
            )}
            {pullLoading ? 'PULLING...' : 'PULL ALL FINISHED RESULTS'}
          </button>
        </div>
        {pullResult && (
          <p className="mt-3 font-label text-xs text-secondary bg-secondary/10 px-3 py-2 rounded border border-secondary/20">
            {pullResult}
          </p>
        )}

        {/* Individual match pull */}
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Or pull a specific match:</p>
          <div className="flex gap-2">
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="flex-1 bg-surface-dim border border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-label text-xs px-3 py-2 rounded"
            >
              <option value="">Select match...</option>
              {matches.filter(m => m.status !== 'COMPLETED').map((m) => (
                <option key={m.id} value={m.id}>{m.team1Name || m.team1} vs {m.team2Name || m.team2}</option>
              ))}
            </select>
            <button
              onClick={() => selectedMatchId && handlePullSingleResult(Number(selectedMatchId))}
              disabled={!selectedMatchId || pullLoading}
              className="px-4 py-2 bg-secondary/10 border border-secondary/40 text-secondary font-label text-xs rounded hover:bg-secondary/20 transition-all disabled:opacity-50"
            >
              Pull
            </button>
          </div>
        </div>
      </div>

      {/* Submit Match Result */}
      <div className="bg-surface-container rounded-xl p-6 primary-glow-border">
        <h3 className="font-headline font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">scoreboard</span>
          Submit Match Result (Manual)
        </h3>

        <div className="space-y-4">
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="w-full bg-surface-dim border border-outline-variant focus:border-primary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-3 rounded-lg"
          >
            <option value="">Select match...</option>
            {matches.filter(m => m.status !== 'COMPLETED').map((m) => (
              <option key={m.id} value={m.id}>{m.team1} vs {m.team2} ({m.group || m.stage})</option>
            ))}
          </select>

          {selectedMatch && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="font-label text-xs text-on-surface-variant mb-2">{selectedMatch.team1}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setResultTeam1Score(Math.max(0, resultTeam1Score - 1))} className="w-8 h-8 rounded bg-surface-variant border border-outline-variant flex items-center justify-center hover:border-primary text-sm">-</button>
                  <span className="text-2xl font-headline font-extrabold w-8 text-center">{resultTeam1Score}</span>
                  <button onClick={() => setResultTeam1Score(resultTeam1Score + 1)} className="w-8 h-8 rounded bg-surface-variant border border-outline-variant flex items-center justify-center hover:border-secondary text-sm">+</button>
                </div>
              </div>
              <span className="text-on-surface-variant">—</span>
              <div className="text-center">
                <p className="font-label text-xs text-on-surface-variant mb-2">{selectedMatch.team2}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setResultTeam2Score(Math.max(0, resultTeam2Score - 1))} className="w-8 h-8 rounded bg-surface-variant border border-outline-variant flex items-center justify-center hover:border-primary text-sm">-</button>
                  <span className="text-2xl font-headline font-extrabold w-8 text-center">{resultTeam2Score}</span>
                  <button onClick={() => setResultTeam2Score(resultTeam2Score + 1)} className="w-8 h-8 rounded bg-surface-variant border border-outline-variant flex items-center justify-center hover:border-secondary text-sm">+</button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitResult}
            disabled={!selectedMatchId || resultSubmitting}
            className="w-full py-3 btn-solid-primary rounded disabled:opacity-30"
          >
            {resultSubmitting ? 'SUBMITTING...' : 'SUBMIT RESULT'}
          </button>
        </div>
      </div>

      {/* Submit Goal Scorers */}
      <div className="bg-surface-container rounded-xl p-6 card-glow">
        <h3 className="font-headline font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">sports_soccer</span>
          Submit Goal Scorers
        </h3>

        <div className="space-y-4">
          <select
            value={gsMatchId}
            onChange={(e) => setGsMatchId(e.target.value)}
            className="w-full bg-surface-dim border border-outline-variant focus:border-secondary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-3 rounded-lg"
          >
            <option value="">Select match...</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>{m.team1} vs {m.team2}</option>
            ))}
          </select>

          {gsMatchId && (
            <>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">search</span>
                <input
                  type="text"
                  value={gsPlayerSearch}
                  onChange={(e) => setGsPlayerSearch(e.target.value)}
                  placeholder="Search player..."
                  className="w-full bg-surface-dim border border-outline-variant focus:border-secondary focus:ring-0 focus:outline-none text-on-surface font-label text-sm pl-10 pr-4 py-2.5 rounded-lg"
                />
              </div>

              {gsPlayerResults.length > 0 && (
                <div className="bg-surface-dim border border-outline-variant rounded-lg max-h-40 overflow-y-auto">
                  {gsPlayerResults.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => {
                        if (!gsSelectedPlayers.find(p => p.id === player.id)) {
                          setGsSelectedPlayers([...gsSelectedPlayers, player])
                          if (gsSelectedPlayers.length === 0) setGsFirstScorerId(player.id)
                        }
                        setGsPlayerSearch('')
                        setGsPlayerResults([])
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-variant transition-colors text-left border-b border-outline-variant last:border-b-0"
                    >
                      <span className="font-label text-sm">{player.name} ({player.teamName})</span>
                      <span className="material-symbols-outlined text-secondary text-sm">add_circle</span>
                    </button>
                  ))}
                </div>
              )}

              {gsSelectedPlayers.length > 0 && (
                <div className="space-y-2">
                  <p className="font-label text-[10px] text-on-surface-variant uppercase">Selected (star = first scorer)</p>
                  {gsSelectedPlayers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-surface-variant rounded-lg border border-outline-variant">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGsFirstScorerId(p.id)}
                          className={`material-symbols-outlined text-sm ${gsFirstScorerId === p.id ? 'text-tertiary' : 'text-on-surface-variant'}`}
                          style={{ fontVariationSettings: gsFirstScorerId === p.id ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </button>
                        <span className="font-label text-sm">{p.name}</span>
                      </div>
                      <button onClick={() => {
                        setGsSelectedPlayers(gsSelectedPlayers.filter(x => x.id !== p.id))
                        if (gsFirstScorerId === p.id) setGsFirstScorerId(null)
                      }} className="material-symbols-outlined text-error text-sm">close</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <button
            onClick={handleSubmitGoalScorers}
            disabled={!gsMatchId || gsSelectedPlayers.length === 0 || gsSubmitting}
            className="w-full py-3 btn-neon-secondary rounded disabled:opacity-30"
          >
            {gsSubmitting ? 'SUBMITTING...' : 'SUBMIT GOAL SCORERS'}
          </button>
        </div>
      </div>

      {/* MOTM Entry */}
      <div className="bg-surface-container rounded-xl p-6 border border-tertiary/30">
        <h3 className="font-headline font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          Submit Man of the Match
        </h3>
        <div className="space-y-4">
          <select
            value={motmMatchId}
            onChange={(e) => setMotmMatchId(e.target.value)}
            className="w-full bg-surface-dim border border-outline-variant focus:border-tertiary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-3 rounded-lg"
          >
            <option value="">Select completed match...</option>
            {matches.filter(m => m.status === 'COMPLETED').map((m) => (
              <option key={m.id} value={m.id}>{m.team1} vs {m.team2} ({m.team1Score}-{m.team2Score})</option>
            ))}
          </select>
          <div className="flex gap-3">
            <input
              type="text"
              value={motmPlayerName}
              onChange={(e) => setMotmPlayerName(e.target.value)}
              placeholder="MOTM player name..."
              className="flex-1 bg-surface-dim border border-outline-variant focus:border-tertiary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-2.5 rounded-lg"
            />
            <button
              onClick={handleSubmitMotm}
              disabled={!motmMatchId || !motmPlayerName.trim() || motmSubmitting}
              className="px-6 py-2.5 bg-tertiary/20 border border-tertiary/50 text-tertiary font-label font-bold text-xs tracking-widest rounded hover:bg-tertiary/30 transition-all disabled:opacity-30"
            >
              {motmSubmitting ? '...' : 'SET MOTM'}
            </button>
          </div>
        </div>
      </div>

      {/* Award Tournament Prizes */}
      <div className="bg-surface-container rounded-xl p-6 border border-tertiary/30">
        <h3 className="font-headline font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          Award Tournament Prizes
        </h3>

        <div className="space-y-6">
          {/* Top Scorer */}
          <div className="space-y-3">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Golden Boot (Top Scorer) — +4 pts</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={topScorerName}
                onChange={(e) => setTopScorerName(e.target.value)}
                placeholder="Player name..."
                className="flex-1 bg-surface-dim border border-outline-variant focus:border-tertiary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-2.5 rounded-lg"
              />
              <button
                onClick={handleAwardTopScorer}
                disabled={!topScorerName.trim() || awardSubmitting}
                className="px-6 py-2.5 bg-tertiary/20 border border-tertiary/50 text-tertiary font-label font-bold text-xs tracking-widest rounded hover:bg-tertiary/30 transition-all disabled:opacity-30"
              >
                AWARD
              </button>
            </div>
          </div>

          {/* Golden Ball */}
          <div className="space-y-3">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Golden Ball (Best Player) — +4 pts</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={goldenBallName}
                onChange={(e) => setGoldenBallName(e.target.value)}
                placeholder="Player name..."
                className="flex-1 bg-surface-dim border border-outline-variant focus:border-tertiary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-2.5 rounded-lg"
              />
              <button
                onClick={handleAwardGoldenBall}
                disabled={!goldenBallName.trim() || awardSubmitting}
                className="px-6 py-2.5 bg-tertiary/20 border border-tertiary/50 text-tertiary font-label font-bold text-xs tracking-widest rounded hover:bg-tertiary/30 transition-all disabled:opacity-30"
              >
                AWARD
              </button>
            </div>
          </div>

          {/* Golden Glove */}
          <div className="space-y-3">
            <label className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Golden Glove (Best GK) — +4 pts</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={goldenGloveName}
                onChange={(e) => setGoldenGloveName(e.target.value)}
                placeholder="Goalkeeper name..."
                className="flex-1 bg-surface-dim border border-outline-variant focus:border-tertiary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-2.5 rounded-lg"
              />
              <button
                onClick={handleAwardGoldenGlove}
                disabled={!goldenGloveName.trim() || awardSubmitting}
                className="px-6 py-2.5 bg-tertiary/20 border border-tertiary/50 text-tertiary font-label font-bold text-xs tracking-widest rounded hover:bg-tertiary/30 transition-all disabled:opacity-30"
              >
                AWARD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Code Management */}
      <div className="bg-surface-container rounded-xl p-6 border border-primary/30">
        <h3 className="font-headline font-bold text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">vpn_key</span>
          Invite Codes
        </h3>
        <p className="text-xs text-on-surface-variant mb-4">
          Generate unique codes and share them with friends. Each code can only be used once.
        </p>

        {/* Generate new code */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCodeLabel}
            onChange={(e) => setNewCodeLabel(e.target.value)}
            placeholder="Label (e.g., For Rahul)"
            className="flex-1 bg-surface-dim border border-outline-variant focus:border-primary focus:ring-0 focus:outline-none text-on-surface font-label text-sm px-4 py-2.5 rounded-lg"
          />
          <button
            onClick={handleGenerateCode}
            disabled={codeGenerating}
            className="px-5 py-2.5 bg-primary/10 border border-primary/50 text-primary font-label font-bold text-xs tracking-widest rounded hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {codeGenerating ? (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : (
              <span className="material-symbols-outlined text-sm">add</span>
            )}
            GENERATE
          </button>
        </div>

        {/* Code list */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {inviteCodes.length === 0 && (
            <p className="text-xs text-on-surface-variant text-center py-4">No invite codes generated yet</p>
          )}
          {inviteCodes.map((code) => (
            <div key={code.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
              code.used
                ? 'bg-surface-dim/50 border-outline-variant opacity-60'
                : 'bg-surface-dim border-secondary/30'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`font-label font-bold text-sm tracking-widest ${code.used ? 'text-on-surface-variant line-through' : 'text-secondary neon-glow-secondary'}`}>
                    {code.code}
                  </span>
                  {code.used && (
                    <span className="font-label text-[9px] bg-on-surface-variant/20 text-on-surface-variant px-2 py-0.5 rounded uppercase">Used</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {code.label && <span className="font-label text-[10px] text-on-surface-variant">{code.label}</span>}
                  {code.usedByUsername && (
                    <span className="font-label text-[10px] text-primary">→ {code.usedByUsername}</span>
                  )}
                </div>
              </div>
              {!code.used && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(code.code); addToast('Code copied!', 'info') }}
                    className="material-symbols-outlined text-on-surface-variant hover:text-secondary text-sm transition-colors"
                    title="Copy code"
                  >
                    content_copy
                  </button>
                  <button
                    onClick={() => handleDeleteCode(code.id)}
                    className="material-symbols-outlined text-on-surface-variant hover:text-error text-sm transition-colors"
                    title="Delete code"
                  >
                    delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
