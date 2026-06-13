export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="neon-spinner"></div>
      <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{text}</p>
    </div>
  )
}
