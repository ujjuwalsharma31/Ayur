import { useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Compass,
  Copy,
  Droplets,
  Eye,
  Flame,
  Flower2,
  Heart,
  History,
  Info,
  Leaf,
  LoaderCircle,
  Menu,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Timer,
  Utensils,
  Video,
  Volume2,
  VolumeX,
  Wind,
  X,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { getApiStatus, getRemedy } from './services/api'

const languages = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['bn', 'বাংলা'],
  ['te', 'తెలుగు'],
  ['ta', 'தமிழ்'],
  ['mr', 'मराठी'],
  ['gu', 'ગુજરાતી'],
  ['kn', 'ಕನ್ನಡ'],
  ['ml', 'മലയാളം'],
  ['pa', 'ਪੰਜਾਬੀ'],
  ['or', 'ଓଡ଼ିଆ'],
  ['ur', 'اردو'],
  ['as', 'অসমীয়া'],
  ['sa', 'संस्कृतम्'],
]

const popular = [
  { name: 'Cold & cough', icon: '⌁', tag: 'Respiratory' },
  { name: 'Stress & Anxiety', icon: '✺', tag: 'Mind' },
  { name: 'Headache & Migraine', icon: '☼', tag: 'Ease' },
  { name: 'Better sleep & Insomnia', icon: '☾', tag: 'Sleep' },
  { name: 'Acidity & Digestion', icon: '🌿', tag: 'Gut' },
  { name: 'Joint pain & Stiffness', icon: '⚡', tag: 'Vitality' },
]

const SUGGESTIONS_DATABASE = [
  { query: 'Cold & cough', category: 'Respiratory', icon: '🍃' },
  { query: 'Sore throat & Hoarseness', category: 'Respiratory', icon: '🍵' },
  { query: 'Sinus congestion', category: 'Respiratory', icon: '💨' },
  { query: 'Stress & Anxiety', category: 'Mind & Mood', icon: '✺' },
  { query: 'Headache & Migraine', category: 'Mind & Mood', icon: '☼' },
  { query: 'Better sleep & Insomnia', category: 'Rest', icon: '☾' },
  { query: 'Acidity & Heartburn', category: 'Digestion', icon: '🔥' },
  { query: 'Bloating & Gas', category: 'Digestion', icon: '🌾' },
  { query: 'Indigestion & Sluggish Metabolism', category: 'Digestion', icon: '🌱' },
  { query: 'Constipation & Irregular Bowel', category: 'Digestion', icon: '🌿' },
  { query: 'Joint pain & Arthritis', category: 'Musculoskeletal', icon: '🦴' },
  { query: 'Back pain & Muscle tension', category: 'Musculoskeletal', icon: '🧘' },
  { query: 'Skin glow & Natural radiance', category: 'Skin & Beauty', icon: '✨' },
  { query: 'Acne & Skin breakouts', category: 'Skin & Beauty', icon: '🌸' },
  { query: 'Hair fall & Thinning hair', category: 'Hair Care', icon: '🌿' },
  { query: 'Fatigue & Low energy', category: 'Vitality', icon: '☀️' },
  { query: 'Immunity booster & Ojas', category: 'Immunity', icon: '🛡️' },
  { query: 'Weight management & Detox', category: 'Metabolism', icon: '⚖️' },
]

const REMEDY_IMAGES = [
  { keywords: ['ginger', 'tea', 'infusion', 'decoction', 'kadha', 'boil'], url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['turmeric', 'milk', 'golden', 'haldi'], url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['tulsi', 'basil', 'herbal', 'leaves', 'mint'], url: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['honey', 'lemon', 'citrus', 'sweet'], url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['clove', 'pepper', 'cinnamon', 'spice', 'spices'], url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['steam', 'inhalation', 'oil', 'massage'], url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['water', 'hydration', 'detox'], url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=700&q=80' },
]

function getRemedyThumbnail(remedy, index = 0) {
  const text = `${remedy.remedyName || ''} ${remedy.title || ''} ${(remedy.ingredients || []).map((i) => (typeof i === 'object' ? i.name : i)).join(' ')}`.toLowerCase()
  for (const item of REMEDY_IMAGES) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.url
    }
  }
  const fallbackList = [
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=700&q=80',
  ]
  return fallbackList[index % fallbackList.length]
}

const YOGA_IMAGES = [
  { keywords: ['shavasana', 'corpse', 'rest', 'sleep'], url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['pranayama', 'breathing', 'breath', 'anulom', 'nadi', 'bhramari', 'vilom'], url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['child', 'balasana', 'fold'], url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['cobra', 'bhujangasana', 'back'], url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80' },
  { keywords: ['meditation', 'sukhasana', 'sit', 'mindful'], url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80' },
]

function getYogaThumbnail(pose, index = 0) {
  const text = `${pose.asanaName || ''} ${pose.title || ''} ${pose.imageKeyword || ''}`.toLowerCase()
  for (const item of YOGA_IMAGES) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.url
    }
  }
  const fallbackList = [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80',
  ]
  return fallbackList[index % fallbackList.length]
}

function scaleIngredient(ing, multiplier) {
  if (multiplier === 1) {
    return typeof ing === 'object' && ing ? `${ing.amount || ''} ${ing.name || ''}`.trim() : String(ing)
  }
  const raw = typeof ing === 'object' && ing ? `${ing.amount || ''} ${ing.name || ''}`.trim() : String(ing)
  return raw.replace(/^(\d+(?:\.\d+)?|\d+\/\d+)/, (match) => {
    if (match.includes('/')) {
      const [num, den] = match.split('/').map(Number)
      const val = (num / den) * multiplier
      return val % 1 === 0 ? String(val) : val.toFixed(1)
    }
    const val = parseFloat(match) * multiplier
    return val % 1 === 0 ? String(val) : val.toFixed(1)
  })
}

// ----------------- FAVORITES LOCAL STORAGE UTILS -----------------
function getSavedFavorites() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ayursaathi_bookmarks') || '[]'
    const parsed = JSON.parse(raw)
    // Normalize if array of strings or objects
    return parsed.map((item) => (typeof item === 'string' ? { name: item, disease: item } : item))
  } catch {
    return []
  }
}

function saveFavoriteItem(item) {
  if (typeof window === 'undefined') return
  try {
    const current = getSavedFavorites()
    const name = typeof item === 'string' ? item : item.name
    const exists = current.some((f) => f.name.toLowerCase() === name.toLowerCase())
    let next
    if (exists) {
      next = current.filter((f) => f.name.toLowerCase() !== name.toLowerCase())
    } else {
      const record = typeof item === 'string' ? { name: item, disease: item, date: Date.now() } : { ...item, date: Date.now() }
      next = [record, ...current]
    }
    localStorage.setItem('ayursaathi_bookmarks', JSON.stringify(next))
    window.dispatchEvent(new Event('ayursaathi_bookmarks_updated'))
  } catch {}
}

function removeFavoriteByName(name) {
  if (typeof window === 'undefined') return
  try {
    const current = getSavedFavorites()
    const next = current.filter((f) => f.name.toLowerCase() !== name.toLowerCase())
    localStorage.setItem('ayursaathi_bookmarks', JSON.stringify(next))
    window.dispatchEvent(new Event('ayursaathi_bookmarks_updated'))
  } catch {}
}

// ----------------- RECENT SEARCHES -----------------
function saveRecentSearch(term) {
  if (!term || typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('ayursaathi_recent') || '[]'
    const list = JSON.parse(raw).filter((item) => item.toLowerCase() !== term.toLowerCase())
    list.unshift(term)
    localStorage.setItem('ayursaathi_recent', JSON.stringify(list.slice(0, 6)))
  } catch {}
}

function getRecentSearches() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ayursaathi_recent') || '[]'
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// ----------------- DOSHA GUIDE MODAL -----------------
function DoshaModal({ isOpen, onClose, onSelectTopic }) {
  const [activeDosha, setActiveDosha] = useState('vata')
  if (!isOpen) return null

  const doshas = {
    vata: {
      name: 'Vata Dosha',
      subtitle: 'The Energy of Movement & Space',
      icon: <Wind size={24} className="dosha-icon-wind" />,
      elements: 'Air (Vayu) + Ether (Akasha)',
      color: '#4a7282',
      qualities: 'Dry, light, cold, rough, subtle, mobile',
      balanced: 'Creative, energetic, adaptable, enthusiastic, quick thinker',
      imbalanced: 'Anxiety, restlessness, insomnia, dry skin, constipation, bloating, racing thoughts',
      balanceTips: [
        'Favor warm, freshly cooked, grounding foods like soups, stews, and healthy fats (ghee, sesame oil).',
        'Maintain a steady daily routine with consistent sleep and meal times.',
        'Practice calming pranayama like Nadi Shodhana (alternate nostril breathing).',
        'Keep warm and stay away from cold, drafty environments.',
      ],
      queries: ['Better sleep & Insomnia', 'Stress & Anxiety', 'Joint pain & Stiffness', 'Constipation'],
    },
    pitta: {
      name: 'Pitta Dosha',
      subtitle: 'The Energy of Transformation & Fire',
      icon: <Flame size={24} className="dosha-icon-flame" />,
      elements: 'Fire (Agni) + Water (Jala)',
      color: '#bd5338',
      qualities: 'Hot, sharp, light, liquid, oily, spreading',
      balanced: 'Strong digestion, focused intellect, confident, articulate leader',
      imbalanced: 'Acid reflux, heartburn, skin rashes, inflammation, irritability, anger',
      balanceTips: [
        'Favor cooling, mildly spiced foods like cucumber, coconut, coriander, and sweet fruits.',
        'Avoid excessive spicy, salty, or deeply fried foods, alcohol, and caffeine.',
        'Practice Sheetali (cooling breath) and gentle restorative yoga.',
        'Spend time near calming bodies of water and take cooling evening strolls.',
      ],
      queries: ['Acidity & Heartburn', 'Skin glow & Acne', 'Headache & Migraine', 'Indigestion'],
    },
    kapha: {
      name: 'Kapha Dosha',
      subtitle: 'The Energy of Structure & Fluidity',
      icon: <Droplets size={24} className="dosha-icon-droplets" />,
      elements: 'Earth (Prithvi) + Water (Jala)',
      color: '#3d7051',
      qualities: 'Heavy, slow, cool, oily, smooth, stable',
      balanced: 'Calm, patient, loving, loyal, robust immunity, strong endurance',
      imbalanced: 'Sluggish digestion, congestion, excess mucus, lethargy, fluid retention, weight gain',
      balanceTips: [
        'Favor warming, pungent, bitter, and light foods with black pepper, ginger, and garlic.',
        'Engage in brisk daily exercise like sun salutations (Surya Namaskar) to stimulate circulation.',
        'Practice Kapalabhati (shining skull breath) to awaken sluggish energy.',
        'Avoid daytime naps and heavy, sugary, or cold dairy foods.',
      ],
      queries: ['Cold & cough', 'Sinus congestion', 'Weight management & Detox', 'Fatigue & Low energy'],
    },
  }

  const current = doshas[activeDosha]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="dosha-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="modal-icon-badge">
              <Compass size={20} />
            </span>
            <div>
              <h3>Ayurvedic Dosha Wisdom</h3>
              <p>Discover your governing energies: Vata, Pitta & Kapha</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="dosha-tabs">
          <button
            className={`dosha-tab-btn ${activeDosha === 'vata' ? 'active vata' : ''}`}
            onClick={() => setActiveDosha('vata')}
          >
            <Wind size={15} /> Vata (Air)
          </button>
          <button
            className={`dosha-tab-btn ${activeDosha === 'pitta' ? 'active pitta' : ''}`}
            onClick={() => setActiveDosha('pitta')}
          >
            <Flame size={15} /> Pitta (Fire)
          </button>
          <button
            className={`dosha-tab-btn ${activeDosha === 'kapha' ? 'active kapha' : ''}`}
            onClick={() => setActiveDosha('kapha')}
          >
            <Droplets size={15} /> Kapha (Earth)
          </button>
        </div>

        <div className="dosha-modal-body">
          <div className="dosha-badge-banner" style={{ borderColor: `${current.color}40`, background: `${current.color}10` }}>
            <div className="dosha-banner-icon" style={{ color: current.color }}>
              {current.icon}
            </div>
            <div>
              <h4>{current.name}</h4>
              <span className="dosha-elements">{current.elements}</span>
              <p className="dosha-subtext">{current.subtitle}</p>
            </div>
          </div>

          <div className="dosha-split-grid">
            <div className="dosha-info-card">
              <h5>
                <Sparkles size={14} /> When in Balance
              </h5>
              <p>{current.balanced}</p>
            </div>
            <div className="dosha-info-card warn">
              <h5>
                <CircleAlert size={14} /> Signs of Imbalance
              </h5>
              <p>{current.imbalanced}</p>
            </div>
          </div>

          <div className="dosha-tips-card">
            <h5>
              <Leaf size={14} /> Ayurvedic Ways to Restore Balance
            </h5>
            <ul>
              {current.balanceTips.map((tip, idx) => (
                <li key={idx}>
                  <Check size={14} style={{ flex: 'none', color: current.color, marginTop: 2 }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dosha-topics-suggest">
            <span>Explore remedies for {current.name}:</span>
            <div className="suggest-chips">
              {current.queries.map((q, idx) => (
                <button
                  key={idx}
                  className="dosha-query-chip"
                  onClick={() => {
                    onClose()
                    onSelectTopic(q)
                  }}
                >
                  {q} <ArrowRight size={11} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ----------------- FAVORITES DRAWER -----------------
function FavoritesDrawer({ isOpen, onClose, onSelectRemedy }) {
  const [favorites, setFavorites] = useState([])

  const loadFavorites = () => {
    setFavorites(getSavedFavorites())
  }

  useEffect(() => {
    loadFavorites()
    window.addEventListener('ayursaathi_bookmarks_updated', loadFavorites)
    return () => window.removeEventListener('ayursaathi_bookmarks_updated', loadFavorites)
  }, [])

  if (!isOpen) return null

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <motion.aside
        className="favorites-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="drawer-heart-icon">
              <Heart size={18} fill="#e63946" color="#e63946" />
            </span>
            <div>
              <h3>Saved Favorites</h3>
              <p>{favorites.length} saved Ayurvedic recipes & wellness notes</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          {favorites.length === 0 ? (
            <div className="drawer-empty-state">
              <Heart size={42} strokeWidth={1.2} style={{ color: '#b5c0ad', marginBottom: 12 }} />
              <h4>No favorites saved yet</h4>
              <p>When you discover recipes or yoga poses you love, click the heart icon to save them here for quick access anytime!</p>
              <div className="drawer-popular-links">
                <span>Start with these:</span>
                <button
                  className="recent-chip"
                  onClick={() => {
                    onClose()
                    onSelectRemedy('Cold & cough')
                  }}
                >
                  Cold & cough
                </button>
                <button
                  className="recent-chip"
                  onClick={() => {
                    onClose()
                    onSelectRemedy('Stress & Anxiety')
                  }}
                >
                  Stress & Anxiety
                </button>
              </div>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map((fav, i) => (
                <div key={i} className="favorite-item-card">
                  <div className="favorite-info">
                    <span className="fav-badge">
                      <Leaf size={10} /> Saved Recipe
                    </span>
                    <h4>{fav.name}</h4>
                    {fav.disease && <span className="fav-disease">Concern: {fav.disease}</span>}
                  </div>
                  <div className="favorite-actions">
                    <button
                      className="fav-view-btn"
                      onClick={() => {
                        onClose()
                        onSelectRemedy(fav.disease || fav.name)
                      }}
                      title="View guidance"
                    >
                      View <ArrowRight size={12} />
                    </button>
                    <button
                      className="fav-remove-btn"
                      onClick={() => {
                        removeFavoriteByName(fav.name)
                        toast('Removed from favorites', { icon: '🗑️' })
                      }}
                      title="Remove from favorites"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="drawer-footer">
            <button
              className="drawer-clear-btn"
              onClick={() => {
                if (window.confirm('Clear all saved favorites?')) {
                  localStorage.removeItem('ayursaathi_bookmarks')
                  window.dispatchEvent(new Event('ayursaathi_bookmarks_updated'))
                  toast.success('Favorites cleared')
                }
              }}
            >
              Clear all favorites
            </button>
          </div>
        )}
      </motion.aside>
    </div>
  )
}

// ----------------- HEADER COMPONENT -----------------
function Header({ onOpenDosha, onOpenFavorites, favoritesCount }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link to="/" className="brand" aria-label="AyurSaathi Homepage">
          <span className="brand-mark">
            <Leaf size={19} strokeWidth={2.2} />
          </span>
          <span>
            ayursaathi<span className="brand-period">.</span>
          </span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>
            Our approach
          </a>
          <a href="/#about" onClick={() => setMenuOpen(false)}>
            About Ayurveda
          </a>
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => {
              setMenuOpen(false)
              onOpenDosha()
            }}
          >
            <Compass size={13} /> Dosha Guide
          </button>
          <button
            type="button"
            className="nav-link-btn nav-favorites-pill"
            onClick={() => {
              setMenuOpen(false)
              onOpenFavorites()
            }}
          >
            <Heart size={13} fill={favoritesCount > 0 ? '#e63946' : 'none'} color={favoritesCount > 0 ? '#e63946' : 'currentColor'} />
            <span>Saved {favoritesCount > 0 ? `(${favoritesCount})` : ''}</span>
          </button>
        </nav>

        <div className="header-right-actions">
          <button
            type="button"
            className="header-fav-shortcut"
            onClick={onOpenFavorites}
            title={`View saved favorites (${favoritesCount})`}
            aria-label="Saved favorites"
          >
            <Heart size={16} fill={favoritesCount > 0 ? '#e63946' : 'none'} color={favoritesCount > 0 ? '#e63946' : 'currentColor'} />
            {favoritesCount > 0 && <span className="fav-count-bubble">{favoritesCount}</span>}
          </button>
          <a className="nav-cta" href="/#search">
            Find balance <ArrowUpRight size={14} />
          </a>
          <button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

// ----------------- SEARCH BOX WITH LIVE AUTOCOMPLETE -----------------
function SearchBox({ initial = '', onSearch, compact = false }) {
  const [value, setValue] = useState(initial)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => setValue(initial), [initial])

  const filtered = value.trim()
    ? SUGGESTIONS_DATABASE.filter(
        (item) =>
          item.query.toLowerCase().includes(value.toLowerCase()) ||
          item.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 7)
    : SUGGESTIONS_DATABASE.slice(0, 6)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (query) => {
    setValue(query)
    setIsOpen(false)
    onSearch(query)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        setSelectedIndex(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < filtered.length) {
        e.preventDefault()
        handleSelect(filtered[selectedIndex].query)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={`search-container-wrap ${compact ? 'search-container-compact' : ''}`}>
      <form
        className={`search-box ${compact ? 'search-compact' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) {
            setIsOpen(false)
            onSearch(value.trim())
          }
        }}
      >
        <Search size={19} className="search-icon" />
        <input
          ref={inputRef}
          aria-label="Describe a health concern"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="What would you like support with? (e.g. stress, headache, cold, acidity)"
          maxLength={100}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
            className="search-clear-btn"
            aria-label="Clear search input"
            title="Clear"
          >
            <X size={15} />
          </button>
        )}
        <button type="submit" className="search-submit" aria-label="Get guidance">
          <ArrowRight size={18} />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="search-autocomplete-dropdown"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="autocomplete-head">
              <span>{value.trim() ? 'SUGGESTED TOPICS' : 'TRENDING AYURVEDIC TOPICS'}</span>
              <small>Press Enter to choose</small>
            </div>
            <div className="autocomplete-list">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  className={`autocomplete-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(item.query)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="item-icon">{item.icon}</span>
                  <div className="item-text">
                    <strong>{item.query}</strong>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <ArrowRight size={13} className="item-arrow" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ----------------- YOGA PRACTICE TIMER COMPONENT -----------------
function YogaPracticeTimer({ defaultMinutes = 5, asanaName = 'Yoga Pose' }) {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60)
  const [remaining, setRemaining] = useState(defaultMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setTotalSeconds(defaultMinutes * 60)
    setRemaining(defaultMinutes * 60)
    setIsRunning(false)
  }, [defaultMinutes])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsRunning(false)
            toast.success(`Namaste! You completed ${asanaName} practice.`, {
              icon: '🙏',
              duration: 5000,
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, asanaName])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progressPercent = ((totalSeconds - remaining) / totalSeconds) * 100

  const setPreset = (m) => {
    setIsRunning(false)
    setTotalSeconds(m * 60)
    setRemaining(m * 60)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setRemaining(totalSeconds)
  }

  return (
    <div className="yoga-timer-panel">
      <div className="timer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Timer size={15} style={{ color: '#274d35' }} />
          <strong>Mindful Practice Timer</strong>
        </div>
        <div className="timer-presets">
          {[3, 5, 10].map((m) => (
            <button
              key={m}
              className={`preset-btn ${totalSeconds === m * 60 ? 'active' : ''}`}
              onClick={() => setPreset(m)}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="timer-clock-wrap">
        <div className="timer-ring-container">
          <svg className="timer-ring-svg" viewBox="0 0 100 100">
            <circle className="ring-bg" cx="50" cy="50" r="42" />
            <circle
              className="ring-progress"
              cx="50"
              cy="50"
              r="42"
              style={{
                strokeDasharray: 264,
                strokeDashoffset: 264 - (264 * progressPercent) / 100,
              }}
            />
          </svg>
          <div className="timer-digits">
            <span>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <small>{isRunning ? 'Breathe gently...' : remaining === 0 ? 'Completed' : 'Ready'}</small>
          </div>
        </div>

        <div className="timer-controls">
          <button
            type="button"
            className={`timer-play-btn ${isRunning ? 'running' : ''}`}
            onClick={() => setIsRunning(!isRunning)}
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? <Pause size={17} /> : <Play size={17} />}
            <span>{isRunning ? 'Pause' : remaining === 0 ? 'Restart' : 'Begin'}</span>
          </button>
          <button
            type="button"
            className="timer-reset-btn"
            onClick={resetTimer}
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ----------------- REMEDY CARD COMPONENT -----------------
function RemedyCard({ remedy, index, isForceOpen, onToggle, diseaseContext = '' }) {
  const [internalOpen, setInternalOpen] = useState(index === 0)
  const open = isForceOpen !== undefined ? isForceOpen : internalOpen

  const [saved, setSaved] = useState(false)
  const [portion, setPortion] = useState(1)
  const [checkedIngredients, setCheckedIngredients] = useState({})

  const name = remedy.remedyName || remedy.title || 'Ayurvedic Remedy'
  const ingredients = remedy.ingredients || []
  const steps = remedy.preparationSteps || remedy.steps || []
  const summary = remedy.summary || 'A natural Ayurvedic preparation to restore inner harmony and comfort.'
  const usage = remedy.usage
  const precautions = remedy.precautions || []
  const thumbUrl = getRemedyThumbnail(remedy, index)

  useEffect(() => {
    const favs = getSavedFavorites()
    setSaved(favs.some((f) => f.name.toLowerCase() === name.toLowerCase()))
  }, [name])

  const toggleBookmark = (e) => {
    e.stopPropagation()
    saveFavoriteItem({ name, disease: diseaseContext || name })
    const isNowSaved = !saved
    setSaved(isNowSaved)
    if (isNowSaved) {
      toast.success(`Saved "${name}" to your favorites!`)
    } else {
      toast('Removed from favorites', { icon: '🤍' })
    }
  }

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  const shareRecipe = (e) => {
    e.stopPropagation()
    const shareText = `🌿 AyurSaathi Recipe: ${name}\n\n${summary}\n\nIngredients:\n${ingredients
      .map((ing) => `• ${scaleIngredient(ing, portion)}`)
      .join('\n')}\n\nExplore Ayurvedic wellness on AyurSaathi!`

    if (navigator.share) {
      navigator
        .share({
          title: name,
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => toast.success('Recipe details copied to clipboard!'))
        .catch(() => toast.error('Could not copy recipe.'))
    }
  }

  const handleToggle = () => {
    if (onToggle) onToggle()
    else setInternalOpen(!internalOpen)
  }

  const videoQuery = `${name} ayurvedic recipe tutorial preparation`
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`
  const bingImgUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(name + ' ayurvedic remedy ingredients recipe')}`

  return (
    <article className="remedy-card-modern">
      <div className="remedy-media-banner">
        <img
          src={thumbUrl}
          alt={name}
          className="remedy-media-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=80'
          }}
        />
        <div className="remedy-media-overlay">
          <div className="remedy-top-badges">
            <span className="remedy-badge-pill">
              <Leaf size={12} /> 100% Natural Recipe
            </span>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <button
                type="button"
                className={`bookmark-btn ${saved ? 'saved' : ''}`}
                onClick={toggleBookmark}
                title={saved ? 'Remove from favorites' : 'Save recipe to favorites'}
                aria-label="Save recipe"
              >
                <Heart size={15} fill={saved ? '#e63946' : 'none'} />
              </button>
              <button
                type="button"
                className="bookmark-btn"
                onClick={shareRecipe}
                title="Share this recipe"
                aria-label="Share recipe"
              >
                <Share2 size={14} />
              </button>
              <a
                href={bingImgUrl}
                target="_blank"
                rel="noreferrer"
                className="bing-pill-btn"
                title="Browse images of this recipe on Bing"
              >
                <Eye size={12} /> Bing Photos
              </a>
            </div>
          </div>
          <div className="remedy-actions-bar">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="video-pill-btn"
              title="Watch video tutorial on YouTube"
            >
              <Video size={13} fill="currentColor" /> Watch Video Tutorial <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>

      <div className="remedy-content-area">
        <div className="remedy-header-row">
          <span className="remedy-num-pill">{String(index + 1).padStart(2, '0')}</span>
          <div className="remedy-title-wrap">
            <h3>{name}</h3>
            <p className="remedy-summary-text">{summary}</p>
          </div>
        </div>

        {ingredients.length > 0 && (
          <div className="remedy-tag-preview">
            {ingredients.slice(0, 4).map((ing, i) => (
              <span key={i} className="remedy-tag-pill">
                • {typeof ing === 'object' && ing !== null ? `${ing.amount ? ing.amount + ' ' : ''}${ing.name}`.trim() : String(ing)}
              </span>
            ))}
            {ingredients.length > 4 && (
              <span className="remedy-tag-pill">+{ingredients.length - 4} more</span>
            )}
          </div>
        )}

        <button
          type="button"
          className="read-more-btn"
          onClick={handleToggle}
          aria-expanded={open}
        >
          <span>{open ? 'Hide Recipe Details' : `Read Full Recipe (${ingredients.length} Ingredients, ${steps.length} Steps)`}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="remedy-expanded-details"
            >
              {/* Serving Portions Adjuster */}
              <div className="portion-selector-bar">
                <span className="portion-label">
                  <Utensils size={13} /> Adjust Recipe Servings:
                </span>
                <div className="portion-buttons">
                  {[1, 2, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`portion-btn ${portion === val ? 'active' : ''}`}
                      onClick={() => setPortion(val)}
                    >
                      {val}x {val === 1 ? 'Single' : val === 2 ? 'Double' : 'Family'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="expanded-grid">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 className="expanded-section-title" style={{ margin: 0 }}>
                      <CheckCircle2 size={13} /> Ingredients Checklist ({ingredients.length})
                    </h4>
                    <small style={{ fontSize: 9, color: '#889083' }}>Click to check what you have</small>
                  </div>
                  <ul className="ingredient-list">
                    {ingredients.map((item, i) => {
                      const isChecked = Boolean(checkedIngredients[i])
                      return (
                        <li
                          key={i}
                          className={`ingredient-check-item ${isChecked ? 'checked' : ''}`}
                          onClick={() => toggleIngredientCheck(i)}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                        >
                          <span className={`check-box-indicator ${isChecked ? 'active' : ''}`}>
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span className="ing-text">{scaleIngredient(item, portion)}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div>
                  <h4 className="expanded-section-title">
                    <Sparkles size={13} /> Step-by-Step Preparation ({steps.length})
                  </h4>
                  <div className="steps-list">
                    {steps.map((step, i) => (
                      <div key={i} className="step-item">
                        <span className="step-bubble">{String(i + 1).padStart(2, '0')}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {usage && (
                  <div className="usage-box">
                    <Clock3 size={16} style={{ flex: 'none', marginTop: 2, color: '#274d35' }} />
                    <div>
                      <strong>How & When to Consume:</strong>
                      <p>{usage}</p>
                    </div>
                  </div>
                )}

                {precautions.length > 0 && (
                  <div className="precautions-box">
                    <ShieldCheck size={16} style={{ flex: 'none', marginTop: 2, color: '#875439' }} />
                    <div>
                      <strong>Ayurvedic Precautions:</strong>
                      <p>{precautions.join(' • ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}

// ----------------- YOGA CARD COMPONENT -----------------
function YogaCard({ pose, index, isForceOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(index === 0)
  const [showTimer, setShowTimer] = useState(false)
  const open = isForceOpen !== undefined ? isForceOpen : internalOpen

  const asanaName = pose.asanaName || pose.title || 'Mindful Movement'
  const duration = pose.duration || (pose.durationMinutes ? `${pose.durationMinutes} min` : '5-10 min')
  const durationMinNumber = pose.durationMinutes || (duration.includes('10') ? 10 : 5)
  const steps = pose.howToDo || pose.steps || []
  const summary = pose.summary || `Practice ${asanaName} to calm nervous tension and harmonize vital bio-energies.`
  const precautions = pose.precautions || []
  const thumbUrl = getYogaThumbnail(pose, index)

  const handleToggle = () => {
    if (onToggle) onToggle()
    else setInternalOpen(!internalOpen)
  }

  const videoQuery = pose.youtubeSearchQuery || `${asanaName} yoga tutorial step by step`
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`
  const bingImgUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(asanaName + ' yoga posture alignment guide')}`

  return (
    <article className="yoga-card-modern">
      <div className="yoga-media-banner">
        <img
          src={thumbUrl}
          alt={asanaName}
          className="yoga-media-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80'
          }}
        />
        <div className="yoga-media-overlay">
          <div className="remedy-top-badges">
            <span className="remedy-badge-pill">
              <Clock3 size={12} /> {duration}
            </span>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <button
                type="button"
                className="bing-pill-btn"
                onClick={() => setShowTimer(!showTimer)}
                title="Open practice timer"
              >
                <Timer size={12} /> {showTimer ? 'Hide Timer' : 'Practice Timer'}
              </button>
              <a
                href={bingImgUrl}
                target="_blank"
                rel="noreferrer"
                className="bing-pill-btn"
                title="Search posture images on Bing"
              >
                <Eye size={12} /> Posture Photos
              </a>
            </div>
          </div>
          <div className="remedy-actions-bar">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="yoga-video-btn"
              title="Watch guided yoga video tutorial"
            >
              <Play size={12} fill="currentColor" /> Watch Video Tutorial <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>

      <div className="remedy-content-area">
        <div className="remedy-header-row">
          <span className="remedy-num-pill">{String(index + 1).padStart(2, '0')}</span>
          <div className="remedy-title-wrap">
            <h3>{asanaName}</h3>
            <p className="remedy-summary-text">{summary}</p>
          </div>
        </div>

        {/* Practice Timer Drawer */}
        <AnimatePresence>
          {showTimer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <YogaPracticeTimer defaultMinutes={durationMinNumber} asanaName={asanaName} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="read-more-btn"
          onClick={handleToggle}
          aria-expanded={open}
        >
          <span>{open ? 'Hide Instructions' : `Read More & ${steps.length} Guided Steps`}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="remedy-expanded-details"
            >
              <h4 className="expanded-section-title">
                <Activity size={13} /> How to Practice ({steps.length} Steps)
              </h4>
              <div className="steps-list" style={{ marginBottom: 14 }}>
                {steps.map((step, i) => (
                  <div key={i} className="step-item">
                    <span className="step-bubble">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {precautions.length > 0 && (
                <div className="precautions-box">
                  <ShieldCheck size={16} style={{ flex: 'none', marginTop: 2, color: '#875439' }} />
                  <div>
                    <strong>Precautions & Awareness:</strong>
                    <p>{precautions.join(' • ')}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}

// ----------------- HOME COMPONENT -----------------
function Home({ onOpenDosha, onOpenFavorites }) {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('en')
  const [langOpen, setLangOpen] = useState(false)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    setRecent(getRecentSearches())
  }, [])

  const search = (value) => {
    const query = value.trim()
    if (!query) {
      toast.error('Tell us what you’d like support with.')
      return
    }
    saveRecentSearch(query)
    navigate(`/remedy/${encodeURIComponent(query)}?lang=${language}`)
  }

  const clearRecent = () => {
    try {
      localStorage.removeItem('ayursaathi_recent')
      setRecent([])
      toast.success('Recent searches cleared')
    } catch {}
  }

  return (
    <main>
      <section className="hero wrap" id="search">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> YOUR EVERYDAY AYURVEDIC COMPANION
          </div>
          <h1>
            A gentler way<br />
            to <em>feel well.</em>
          </h1>
          <p className="hero-lede">
            Thoughtful Ayurvedic guidance, kitchen remedies, and mindful movement for everyday vitality. Start with what’s on your mind.
          </p>

          <div className="search-area">
            <SearchBox onSearch={search} />
            <div className="search-meta">
              <span>
                <ShieldCheck size={14} /> Private, personal guidance
              </span>
              <div className="language-wrap">
                <button className="language-button" onClick={() => setLangOpen(!langOpen)}>
                  {languages.find((l) => l[0] === language)?.[1]} <ChevronDown size={13} />
                </button>
                {langOpen && (
                  <div className="language-menu">
                    {languages.map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code)
                          setLangOpen(false)
                        }}
                      >
                        {label}
                        {code === language && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {recent.length > 0 && (
              <div className="recent-searches">
                <span>
                  <History size={11} style={{ display: 'inline', marginRight: 4 }} /> RECENT:
                </span>
                {recent.map((term, i) => (
                  <button key={i} className="recent-chip" onClick={() => search(term)}>
                    {term}
                  </button>
                ))}
                <button
                  onClick={clearRecent}
                  className="recent-clear-link"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="quick-search">
            <span>POPULAR TOPICS</span>
            {popular.map((p) => (
              <button key={p.name} onClick={() => search(p.name)}>
                <span>{p.icon}</span> {p.name}
                <ArrowUpRight size={12} />
              </button>
            ))}
          </div>
        </div>

        <div className="hero-art" aria-label="Calm illustration of a person practicing mindful breathing">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="sun-disc">
            <Sun size={27} />
          </div>
          <div className="art-leaf leaf-a">
            <Leaf />
          </div>
          <div className="art-leaf leaf-b">
            <Leaf />
          </div>
          <div className="person-illustration">
            <div className="person-hair" />
            <div className="person-face" />
            <div className="person-neck" />
            <div className="person-body" />
            <div className="person-arm arm-left" />
            <div className="person-arm arm-right" />
            <div className="person-leg leg-left" />
            <div className="person-leg leg-right" />
          </div>
          <div className="floating-note">
            <span className="note-icon">
              <Sprout size={17} />
            </span>
            <div>
              <strong>Small steps,</strong>
              <small>more grounded days</small>
            </div>
            <span className="note-spark">✳</span>
          </div>
          <div className="image-credit">
            A MOMENT FOR YOURSELF <span>✳</span>
          </div>
        </div>

        <div className="hero-bottom">
          <span>
            ROOTED IN TRADITION <i /> MADE FOR TODAY
          </span>
          <a href="#how-it-works">
            Explore our approach <ArrowDown size={14} />
          </a>
        </div>
      </section>

      <section className="trust-strip">
        <div className="trust-inner">
          <span>ANCIENT WISDOM, MADE ACCESSIBLE</span>
          <div>
            <span onClick={onOpenDosha} style={{ cursor: 'pointer' }}>
              <Flower2 /> 3 Doshas Explained
            </span>
            <span>
              <Activity /> Personal Kitchen Guidance
            </span>
            <span>
              <ShieldCheck /> Safe Wellness Education
            </span>
          </div>
        </div>
      </section>

      <section className="how-section wrap" id="how-it-works">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A SIMPLE PLACE TO BEGIN</div>
            <h2>
              Wellness starts<br />
              <em>with a conversation.</em>
            </h2>
          </div>
          <p>
            No complicated rituals or one-size-fits-all answers. Tell us what’s going on, and explore practical ideas grounded in Ayurvedic tradition.
          </p>
        </div>
        <div className="steps-grid">
          <article>
            <span className="step-num">01</span>
            <span className="step-icon icon-sage">
              <Search />
            </span>
            <h3>Start where you are</h3>
            <p>Share a concern in your own words. There’s no perfect way to ask.</p>
          </article>
          <article>
            <span className="step-num">02</span>
            <span className="step-icon icon-peach">
              <Sparkles />
            </span>
            <h3>Explore a personal plan</h3>
            <p>Discover kitchen remedies, movement ideas and doshic context for your wellbeing.</p>
          </article>
          <article>
            <span className="step-num">03</span>
            <span className="step-icon icon-gold">
              <Sun />
            </span>
            <h3>Take what feels useful</h3>
            <p>Small, thoughtful practices can be a gentle addition to everyday care.</p>
          </article>
        </div>
      </section>

      <section className="quote-section" id="about">
        <div className="quote-inner">
          <span className="quote-mark">“</span>
          <div>
            <div className="eyebrow">A TIMELESS WAY OF SEEING WELLNESS</div>
            <blockquote>
              Care for the whole person.<br />
              <em>Come back to balance.</em>
            </blockquote>
            <p>
              Ayurveda is a tradition of holistic wellbeing that looks at how daily rhythms, food, rest and movement work together.
            </p>
          </div>
          <div className="quote-stamp">
            <Flower2 />
            <span>
              ANCIENT<br />
              WISDOM<br />
              <i>✳</i><br />
              MODERN<br />
              LIVING
            </span>
          </div>
        </div>
      </section>

      <section className="closing-cta wrap">
        <div>
          <span className="eyebrow">YOUR NEXT SMALL STEP</span>
          <h2>
            Let’s begin with<br />
            <em>what you need.</em>
          </h2>
        </div>
        <a href="#search" className="cta-button">
          Find your balance <ArrowRight size={17} />
        </a>
        <span className="cta-decoration">✳</span>
      </section>
      <Footer />
    </main>
  )
}

// ----------------- FOOTER COMPONENT -----------------
function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Leaf size={18} />
          </span>
          <span>
            ayursaathi<span className="brand-period">.</span>
          </span>
        </Link>
        <span className="footer-note">A little more balance, one day at a time.</span>
        <span className="footer-credit">
          Made with care by <strong>Ujjwal Sharma</strong>
        </span>
        <span className="footer-copy">© {new Date().getFullYear()} AyurSaathi</span>
      </div>
      <p className="footer-disclaimer">
        AyurSaathi shares general wellness information and is not a substitute for professional medical advice, diagnosis or treatment.
      </p>
    </footer>
  )
}

// ----------------- LOADING STATE COMPONENT -----------------
function LoadingPlan({ topic = '' }) {
  return (
    <div className="loading-panel">
      <div className="loading-orb">
        <LoaderCircle className="spin" size={28} />
      </div>
      <span className="eyebrow">PREPARING AYURVEDIC WISDOM</span>
      <h2>
        Gathering balance for<br />
        <em>{topic || 'your vitality'}.</em>
      </h2>
      <p>Consulting classical Ayurvedic principles, kitchen recipes, and restoring movement. Just a few moments...</p>
      <div className="loading-bars">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

// ----------------- REMEDY PAGE (RESULTS VIEW) -----------------
function RemedyPage() {
  const { disease = '' } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const language = params.get('lang') || 'en'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // UX Features: Filter tab ('all', 'remedies', 'yoga')
  const [activeTab, setActiveTab] = useState('all')
  // UX Features: Expand all toggle
  const [expandAll, setExpandAll] = useState(false)
  // UX Features: Text-to-speech audio state
  const [isSpeaking, setIsSpeaking] = useState(false)
  // UX Features: Back to top button visibility
  const [showTopBtn, setShowTopBtn] = useState(false)

  const decodedDisease = decodeURIComponent(disease)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setData(null)

    getRemedy(disease, language)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err.response?.data?.error ||
            'We couldn’t reach your wellness guide right now. Please try again in a moment.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [disease, language])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowTopBtn(true)
      else setShowTopBtn(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const copyPlan = () => {
    if (!data) return
    const remedyItems = (data.homeRemedies || data.remedies || []).map((r, i) => {
      const ingList = (r.ingredients || [])
        .map((ing) => (typeof ing === 'object' && ing ? `${ing.amount || ''} ${ing.name || ''}`.trim() : String(ing)))
        .join(', ')
      return `${i + 1}. ${r.remedyName || r.title}: ${ingList}`
    }).join('\n')

    const yogaItems = (data.yoga || []).map((y, i) => {
      return `${i + 1}. ${y.asanaName || y.title} (${y.duration || '5-10 min'})`
    }).join('\n')

    const text =
      `🌿 AyurSaathi Wellness Plan: ${decodedDisease}\n\n` +
      `Ayurvedic Insight:\n${data.ayurvedicAnalysis || data.summary || data.healthTip}\n\n` +
      `Daily Care Tip:\n${data.healthTip || data.summary}\n\n` +
      `Home Kitchen Remedies:\n${remedyItems}\n\n` +
      `Mindful Movement & Yoga:\n${yogaItems}\n\n` +
      `Doctor Advice:\n${data.doctorAdvice || data.safetyNote || 'Consult a healthcare professional if symptoms persist.'}`

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Ayurvedic guidance copied to clipboard!')
      })
      .catch(() => {
        toast.error('Could not copy to clipboard.')
      })
  }

  const sharePlan = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `AyurSaathi Wellness Plan: ${decodedDisease}`,
          text: `Holistic Ayurvedic remedies and yoga practices for ${decodedDisease}.`,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      copyPlan()
    }
  }

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported by your browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    if (!data) return

    const speechText = `Ayurvedic guidance for ${decodedDisease}. ${data.ayurvedicAnalysis || data.summary || ''}. Daily care tip: ${data.healthTip || ''}.`
    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
    toast.success('Playing audio guidance...')
  }

  const printPlan = () => {
    window.print()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remediesList = data?.homeRemedies || data?.remedies || []
  const yogaList = data?.yoga || []

  // Detect dominant dosha mentioned in response for visual badge
  const analysisText = `${data?.ayurvedicAnalysis || ''} ${data?.summary || ''}`.toLowerCase()
  const hasVata = analysisText.includes('vata')
  const hasPitta = analysisText.includes('pitta')
  const hasKapha = analysisText.includes('kapha')

  return (
    <main className="results-page">
      <div className="results-top">
        <div className="results-wrap">
          <Link to="/" className="back-link">
            <ArrowLeft size={15} /> All topics
          </Link>
          <div className="results-title">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" /> YOUR WELLNESS NOTES
              </div>
              <h1>
                A little support for<br />
                <em>{decodedDisease}.</em>
              </h1>
            </div>
            <div className="result-language">
              <span>PLAN LANGUAGE</span>
              <select
                aria-label="Plan language"
                value={language}
                onChange={(e) =>
                  navigate(`/remedy/${encodeURIComponent(disease)}?lang=${e.target.value}`)
                }
              >
                {languages.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SearchBox
            compact
            initial={decodedDisease}
            onSearch={(v) => {
              if (v.trim()) navigate(`/remedy/${encodeURIComponent(v.trim())}?lang=${language}`)
            }}
          />
        </div>
      </div>

      <div className="results-wrap results-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LoadingPlan topic={decodedDisease} />
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="error-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CircleAlert size={28} />
              <h2>We hit a small pause.</h2>
              <p>{error}</p>
              <button className="cta-button" onClick={() => navigate(0)}>
                Try again <ArrowRight size={16} />
              </button>
              <small>The API returns this message when generation fails or its AI key is unavailable.</small>
            </motion.div>
          ) : data ? (
            <motion.div
              key={disease + language}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Action Toolbar */}
              <div className="plan-action-bar">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {hasKapha && (
                    <span className="dosha-indicator-chip kapha">
                      <Droplets size={12} /> Kapha Balance
                    </span>
                  )}
                  {hasPitta && (
                    <span className="dosha-indicator-chip pitta">
                      <Flame size={12} /> Pitta Balance
                    </span>
                  )}
                  {hasVata && (
                    <span className="dosha-indicator-chip vata">
                      <Wind size={12} /> Vata Balance
                    </span>
                  )}
                  <button
                    type="button"
                    className={`tts-audio-btn ${isSpeaking ? 'speaking' : ''}`}
                    onClick={toggleSpeech}
                    title={isSpeaking ? 'Stop audio' : 'Listen to guidance'}
                  >
                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen Audio'}</span>
                  </button>
                </div>

                <div className="control-actions">
                  <button type="button" className="btn-secondary" onClick={sharePlan} title="Share plan link">
                    <Share2 size={13} /> Share
                  </button>
                  <button type="button" className="btn-secondary" onClick={printPlan} title="Print or save as PDF">
                    <Printer size={13} /> Print
                  </button>
                  <button type="button" className="copy-plan-btn" onClick={copyPlan} title="Copy plan to clipboard">
                    <Copy size={13} /> Copy Plan
                  </button>
                </div>
              </div>

              {/* Ayurvedic Dosha Perspective */}
              <div className="wellness-note">
                <span className="wellness-sparkle-orb">
                  <Sparkles size={18} />
                </span>
                <div>
                  <strong>Ayurvedic Perspective & Dosha Insights</strong>
                  <p>{data.ayurvedicAnalysis || data.summary || data.healthTip}</p>
                </div>
                <span className="note-side">A GENTLE PLACE TO START</span>
              </div>

              {/* UX Filter & View Control Bar */}
              <div className="section-filter-bar">
                <div className="filter-tabs">
                  <button
                    type="button"
                    className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Guidance ({remediesList.length + yogaList.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab ${activeTab === 'remedies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('remedies')}
                  >
                    <Utensils size={13} /> Kitchen Recipes ({remediesList.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab ${activeTab === 'yoga' ? 'active' : ''}`}
                    onClick={() => setActiveTab('yoga')}
                  >
                    <Activity size={13} /> Yoga & Movement ({yogaList.length})
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setExpandAll(!expandAll)}
                  title="Expand or collapse all cards"
                >
                  {expandAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{expandAll ? 'Collapse All Cards' : 'Expand All Details'}</span>
                </button>
              </div>

              <div className="results-columns">
                <div className="main-results">
                  {/* Daily Care Tip */}
                  {(activeTab === 'all' || activeTab === 'remedies') && (
                    <section className="result-section">
                      <div className="result-section-head">
                        <div>
                          <span className="eyebrow">01 · DAILY CARE</span>
                          <h2>A small thing to try today</h2>
                        </div>
                        <span className="round-section-icon">
                          <Sun size={18} />
                        </span>
                      </div>
                      <div className="tip-card">
                        <span className="tip-line" />
                        <p>{data.healthTip || data.summary || 'Take a moment to rest, hydrate and notice what your body needs today.'}</p>
                      </div>
                    </section>
                  )}

                  {/* Kitchen Remedies Section */}
                  {(activeTab === 'all' || activeTab === 'remedies') && (
                    <section className="result-section" id="remedies-section">
                      <div className="result-section-head">
                        <div>
                          <span className="eyebrow">02 · FROM THE AYURVEDIC KITCHEN</span>
                          <h2>Home Remedies & Recipes</h2>
                        </div>
                        <span className="count-label">{remediesList.length} RECIPES</span>
                      </div>
                      <div className="remedy-list">
                        {remediesList.map((remedy, i) => (
                          <RemedyCard
                            key={i}
                            remedy={remedy}
                            index={i}
                            isForceOpen={expandAll ? true : undefined}
                            diseaseContext={decodedDisease}
                          />
                        ))}
                      </div>
                      {!remediesList.length && (
                        <p className="empty-note">No home remedies were included in this plan.</p>
                      )}
                    </section>
                  )}

                  {/* Yoga Section */}
                  {(activeTab === 'all' || activeTab === 'yoga') && (
                    <section className="result-section" id="yoga-section">
                      <div className="result-section-head">
                        <div>
                          <span className="eyebrow">03 · MINDFUL MOVEMENT & PRANAYAMA</span>
                          <h2>Move, Breathe & Restore</h2>
                        </div>
                        <span className="round-section-icon icon-sage">
                          <Activity size={18} />
                        </span>
                      </div>
                      <div className="yoga-list">
                        {yogaList.map((pose, i) => (
                          <YogaCard
                            key={i}
                            pose={pose}
                            index={i}
                            isForceOpen={expandAll ? true : undefined}
                          />
                        ))}
                      </div>
                      {!yogaList.length && (
                        <p className="empty-note">No movement ideas were included in this plan.</p>
                      )}
                    </section>
                  )}
                </div>

                <aside className="side-results">
                  <div className="doctor-card">
                    <div className="doctor-icon">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="eyebrow">WHEN TO SEEK CARE</span>
                    <h3>Listen to your body.</h3>
                    <p>{data.doctorAdvice || data.safetyNote || 'If your symptoms persist or concern you, speak with a qualified healthcare professional.'}</p>
                    <div className="doctor-rule" />
                    <small>Professional clinical care is always the right next step when you need it.</small>
                  </div>
                  <div className="side-reminder">
                    <span>✳</span>
                    <p>These ideas are here to support your everyday wellbeing, alongside guidance from your healthcare professional.</p>
                  </div>
                </aside>
              </div>

              <div className="results-end">
                <Flower2 size={17} /> WISHING YOU EASE AND VITALITY
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Floating Back to Top Button */}
      {showTopBtn && (
        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          title="Scroll back to top"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      <Footer />
    </main>
  )
}

// ----------------- ROOT APP COMPONENT -----------------
export default function App() {
  const [apiState, setApiState] = useState('checking')
  const [isDoshaOpen, setIsDoshaOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const navigate = useNavigate()

  const refreshCount = () => {
    const list = getSavedFavorites()
    setFavoritesCount(list.length)
  }

  useEffect(() => {
    getApiStatus()
      .then((res) => setApiState(res.status === 'ok' ? 'online' : 'offline'))
      .catch(() => setApiState('offline'))

    refreshCount()
    window.addEventListener('ayursaathi_bookmarks_updated', refreshCount)
    return () => window.removeEventListener('ayursaathi_bookmarks_updated', refreshCount)
  }, [])

  const handleSelectTopic = (topic) => {
    saveRecentSearch(topic)
    navigate(`/remedy/${encodeURIComponent(topic)}`)
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: 13 } }} />
      <Header
        onOpenDosha={() => setIsDoshaOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoritesCount={favoritesCount}
      />
      <div className="api-indicator">
        <span className={apiState === 'online' ? 'status-online' : ''} />
        {apiState === 'checking'
          ? 'Connecting'
          : apiState === 'online'
          ? 'Guide connected'
          : 'Guide offline'}
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <Home
              onOpenDosha={() => setIsDoshaOpen(true)}
              onOpenFavorites={() => setIsFavoritesOpen(true)}
            />
          }
        />
        <Route path="/remedy/:disease" element={<RemedyPage />} />
        <Route
          path="*"
          element={
            <Home
              onOpenDosha={() => setIsDoshaOpen(true)}
              onOpenFavorites={() => setIsFavoritesOpen(true)}
            />
          }
        />
      </Routes>

      {/* Global Modals & Drawers */}
      <DoshaModal
        isOpen={isDoshaOpen}
        onClose={() => setIsDoshaOpen(false)}
        onSelectTopic={handleSelectTopic}
      />
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectRemedy={handleSelectTopic}
      />
    </>
  )
}
