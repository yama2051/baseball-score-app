const sections = [
  { id: 'game-registration', label: '試合登録' },
  { id: 'game-results', label: '試合結果' },
  { id: 'players', label: '選手一覧' },
  { id: 'player-stats', label: '選手成績' },
  { id: 'game-lineups', label: 'ラインアップ' },
]

function SectionNavigation() {
  return (
    <nav className="section-navigation" aria-label="ページ内ナビゲーション">
      {sections.map(section => (
        <a href={`#${section.id}`} key={section.id}>{section.label}</a>
      ))}
    </nav>
  )
}

export default SectionNavigation
