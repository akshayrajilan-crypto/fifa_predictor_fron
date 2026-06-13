import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { matchesAPI, predictionsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MatchResults() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [goalScorerPredictions, setGoalScorerPredictions] = useState([])
  const [actualScorers, setActualScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchRes, predsRes, gsRes] = await Promise.allSettled([
          matchesAPI.getById(matchId),
          predictionsAPI.getForMatch(matchId),
          predictionsAPI.getAllGoalScorerPredictions(matchId),
        ])
        if (matchRes.status === 'fulfilled') {
          const m = matchRes.value.data
          setMatch({
            ...m,
            team1: m.team1Name,
            team2: m.team2Name,
          })
        }
        if (predsRes.status === 'fulfilled') setPredictions(predsRes.value.data)
        if (gsRes.status === 'fulfilled') setGoalScorerPredictions(gsRes.value.data)

        // Fetch actual goal scorers
        try {
          const scorersRes = await matchesAPI.getScorers(matchId)
          setActualScorers(scorersRes.data)
        } catch (e) { /* no scorers yet */ }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [matchId])

  if (loading) return <LoadingSpinner text="Loading results..." />
  if (!match) return <div className="text-center py-12 text-on-surface-variant">Match not found</div>

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors font-label text-sm">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back
      </button>

      {/* Match Result */}
      <div className="bg-surface-container rounded-xl p-8 primary-glow-border text-center">
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
          {match.group ? `Group ${match.group}` : match.stage?.replace(/_/g, ' ')} • FINAL RESULT
        </p>
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center border border-outline mb-2 mx-auto overflow-hidden">
              {match.team1Flag ? (
                <img src={match.team1Flag} alt={match.team1} className="w-10 h-10 object-cover" />
              ) : (
                <span className="font-headline font-bold text-sm">{match.team1?.substring(0, 3).toUpperCase()}</span>
              )}
            </div>
            <span className="font-headline font-bold text-sm">{match.team1}</span>
          </div>
          <div className="text-center">
            <span className="text-4xl font-headline font-extrabold text-primary neon-glow-primary">
              {match.team1Score} - {match.team2Score}
            </span>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center border border-outline mb-2 mx-auto overflow-hidden">
              {match.team2Flag ? (
                <img src={match.team2Flag} alt={match.team2} className="w-10 h-10 object-cover" />
              ) : (
                <span className="font-headline font-bold text-sm">{match.team2?.substring(0, 3).toUpperCase()}</span>
              )}
            </div>
            <span className="font-headline font-bold text-sm">{match.team2}</span>
          </div>
        </div>
        {match.venue && (
          <p className="font-label text-[10px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[10px] align-middle mr-1">location_on</span>
            {match.venue}
          </p>
        )}

        {/* Actual Goal Scorers */}
        {actualScorers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Goal Scorers</p>
            <div className="flex flex-wrap justify-center gap-2">
              {actualScorers.map((scorer, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded text-xs font-label text-secondary">
                  <span className="material-symbols-outlined text-xs">sports_soccer</span>
                  {scorer.playerName} {scorer.minute > 0 && `(${scorer.minute}')`}
                  {scorer.isPenalty && ' (P)'}
                  {scorer.isOwnGoal && ' (OG)'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Predictions */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">group</span>
          All Predictions ({predictions.length})
        </h3>
        {predictions.length === 0 ? (
          <p className="text-on-surface-variant font-label text-sm text-center py-8">No predictions for this match</p>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  pred.pointsEarned >= 5
                    ? 'bg-primary/10 border border-primary/30'
                    : pred.pointsEarned > 0
                    ? 'bg-secondary/10 border border-secondary/20'
                    : 'bg-surface-container border border-outline-variant'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center border border-outline">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                  <div>
                    <span className="font-label text-sm font-bold">{pred.username}</span>
                    <p className="font-label text-[10px] text-on-surface-variant">
                      Predicted: {pred.team1Score} - {pred.team2Score}
                    </p>
                  </div>
                </div>
                <span className={`font-headline font-extrabold text-sm ${
                  pred.pointsEarned >= 5 ? 'text-primary neon-glow-primary' :
                  pred.pointsEarned > 0 ? 'text-secondary' : 'text-on-surface-variant'
                }`}>
                  {pred.pointsEarned} PTS
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Scorer Predictions */}
      {goalScorerPredictions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-headline font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">sports_soccer</span>
            Goal Scorer Predictions
          </h3>
          <div className="space-y-3">
            {goalScorerPredictions.map((gs, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="font-label text-xs text-on-surface-variant">{gs.username}</span>
                  <span className="font-label text-sm font-bold text-on-surface">{gs.playerName}</span>
                  {gs.firstGoalScorer && (
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  )}
                </div>
                <span className={`font-label text-xs ${gs.correct ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {gs.correct ? '✓ Correct' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
