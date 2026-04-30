
export default function EmptyState({ title="Nothing here yet", subtitle="Try changing the filters." }){
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-100 grid place-content-center text-3xl">✨</div>
      <h3 className="mt-4 text-brand-800 font-display text-xl">{title}</h3>
      <p className="text-brand-700/80">{subtitle}</p>
    </div>
  )
}
