import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const AVATARS = [
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'eagle', emoji: '🦅', label: 'Eagle' },
  { id: 'wolf', emoji: '🐺', label: 'Wolf' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'shark', emoji: '🦈', label: 'Shark' },
  { id: 'panther', emoji: '🐆', label: 'Panther' },
  { id: 'phoenix', emoji: '🔥', label: 'Phoenix' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'alien', emoji: '👽', label: 'Alien' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'skull', emoji: '💀', label: 'Skull' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
]

export default function Login() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [avatar, setAvatar] = useState('lion')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password, inviteCode, avatar)
      }
      addToast('Access granted. Welcome.', 'success')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Connection failed'
      setError(typeof msg === 'string' ? msg : 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        <div className="absolute inset-0 scanline pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <img
                src="https://crests.football-data.org/wm26.png"
                alt="FIFA World Cup 2026"
                className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(255,224,74,0.3)]"
              />
            </div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-primary neon-glow-primary mb-1">
              WC26 PREDICTOR
            </h1>
            <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase opacity-70">
              FIFA World Cup 2026 Prediction Game
            </p>
          </div>

          {/* Auth Card */}
          <div className="w-full bg-surface-container/60 backdrop-blur-xl rounded-xl neon-border overflow-hidden transition-all duration-500">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant">
              <button
                onClick={() => { setMode('login'); setError('') }}
                className={`flex-1 py-4 font-label text-sm font-bold tracking-widest transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-surface-container-highest text-secondary border-b-2 border-secondary neon-glow-secondary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                LOGIN
              </button>
              <button
                onClick={() => { setMode('register'); setError('') }}
                className={`flex-1 py-4 font-label text-sm font-bold tracking-widest transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-surface-container-highest text-secondary border-b-2 border-secondary neon-glow-secondary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                REGISTER
              </button>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-3 bg-error-container/20 border border-error/30 rounded text-error text-xs font-label flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary opacity-80 ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-secondary transition-colors">person</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      className="w-full bg-surface-dim border-b border-outline-variant focus:border-secondary focus:ring-0 focus:outline-none text-on-surface font-label pl-10 py-3 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary opacity-80 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-secondary transition-colors">lock</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-surface-dim border-b border-outline-variant focus:border-secondary focus:ring-0 focus:outline-none text-on-surface font-label pl-10 py-3 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Invite Code (register only) */}
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="font-label text-[10px] uppercase tracking-widest text-primary opacity-80 ml-1">
                      Invite Code
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">vpn_key</span>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Enter invite code"
                        required
                        className="w-full bg-surface-dim border-b border-outline-variant focus:border-primary focus:ring-0 focus:outline-none text-on-surface font-label pl-10 py-3 transition-all duration-300"
                      />
                    </div>
                    <p className="font-label text-[9px] text-on-surface-variant ml-1 opacity-60">Ask the admin for the invite code</p>
                  </div>
                )}

                {/* Avatar Picker (register only) */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-tertiary opacity-80 ml-1">
                      Choose Your Avatar
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setAvatar(av.id)}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${
                            avatar === av.id
                              ? 'bg-tertiary/20 border-2 border-tertiary shadow-[0_0_12px_rgba(255,224,74,0.3)] scale-110'
                              : 'bg-surface-dim border border-outline-variant hover:border-on-surface-variant hover:scale-105'
                          }`}
                          title={av.label}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative flex items-center justify-center py-4 bg-transparent border border-secondary/50 overflow-hidden transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50"
                  >
                    <span className="absolute inset-0 w-0 bg-secondary transition-all duration-500 ease-out group-hover:w-full"></span>
                    <span className="relative z-10 font-label font-bold tracking-[0.2em] text-secondary group-hover:text-background transition-colors duration-300">
                      {loading ? 'CONNECTING...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
                    </span>
                    {!loading && (
                      <span className="relative z-10 material-symbols-outlined ml-2 text-secondary group-hover:text-background transition-colors duration-300">bolt</span>
                    )}
                    {loading && (
                      <div className="relative z-10 ml-2 w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
