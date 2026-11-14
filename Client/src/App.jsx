import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleAlert, Clock3, Flower2, Leaf, LoaderCircle, Menu, Play, Search, ShieldCheck, Sparkles, Sprout, Sun, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiStatus, getRemedy } from './services/api'

const languages = [
  ['en','English'],['hi','हिन्दी'],['bn','বাংলা'],['te','తెలుగు'],['ta','தமிழ்'],['mr','मराठी'],['gu','ગુજરાતી'],['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['pa','ਪੰਜਾਬੀ'],['or','ଓଡ଼ିଆ'],['ur','اردو'],['as','অসমীয়া'],['sa','संस्कृतम्'],
]
const popular = [{name:'Stress',icon:'✺',tone:'peach'},{name:'Headache',icon:'☼',tone:'gold'},{name:'Cold & cough',icon:'⌁',tone:'blue'},{name:'Better sleep',icon:'☾',tone:'lilac'}]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="site-header"><div className="nav-wrap">
    <Link to="/" className="brand"><span className="brand-mark"><Leaf size={19} strokeWidth={2.2}/></span><span>ayursaathi<span className="brand-period">.</span></span></Link>
    <nav className={`nav-links ${menuOpen?'nav-open':''}`}><a href="/#how-it-works" onClick={()=>setMenuOpen(false)}>Our approach</a><a href="/#about" onClick={()=>setMenuOpen(false)}>About Ayurveda</a><a href="/#footer" onClick={()=>setMenuOpen(false)}>About</a></nav>
    <a className="nav-cta" href="/#search">Find your balance <ArrowUpRight size={15}/></a>
    <button className="menu-button" aria-label="Toggle navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
  </div></header>
}

function SearchBox({ initial = '', onSearch, compact = false }) {
  const [value, setValue] = useState(initial)
  useEffect(()=>setValue(initial),[initial])
  return <form className={`search-box ${compact?'search-compact':''}`} onSubmit={e=>{e.preventDefault();onSearch(value)}}>
    <Search size={19} className="search-icon"/><input aria-label="Describe a health concern" value={value} onChange={e=>setValue(e.target.value)} placeholder="What would you like support with?" maxLength={100}/>
    <button type="submit" className="search-submit" aria-label="Get guidance"><ArrowRight size={18}/></button>
  </form>
}

function Home() {
  const navigate = useNavigate()
  const [language,setLanguage] = useState('en')
  const [langOpen,setLangOpen] = useState(false)
  const search = value => { const query=value.trim(); if(!query){toast.error('Tell us what you’d like support with.');return} navigate(`/remedy/${encodeURIComponent(query)}?lang=${language}`) }
  return <main>
    <section className="hero wrap" id="search">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> YOUR EVERYDAY WELLNESS COMPANION</div>
        <h1>A gentler way<br/>to <em>feel well.</em></h1>
        <p className="hero-lede">Thoughtful Ayurvedic guidance for the little things that make a big difference. Start with what’s on your mind.</p>
        <div className="search-area"><SearchBox onSearch={search}/><div className="search-meta"><span><ShieldCheck size={14}/> Private, personal guidance</span><div className="language-wrap"><button className="language-button" onClick={()=>setLangOpen(!langOpen)}>{languages.find(l=>l[0]===language)?.[1]} <ChevronDown size={13}/></button>{langOpen&&<div className="language-menu">{languages.map(([code,label])=><button key={code} onClick={()=>{setLanguage(code);setLangOpen(false)}}>{label}{code===language&&<Check size={14}/>}</button>)}</div>}</div></div></div>
        <div className="quick-search"><span>TRY A TOPIC</span>{popular.map(p=><button key={p.name} onClick={()=>search(p.name)}>{p.name}<ArrowUpRight size={12}/></button>)}</div>
      </div>
      <div className="hero-art" aria-label="Calm illustration of a person practicing mindful breathing">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
        <div className="sun-disc"><Sun size={27}/></div><div className="art-leaf leaf-a"><Leaf/></div><div className="art-leaf leaf-b"><Leaf/></div>
        <div className="person-illustration"><div className="person-hair"/><div className="person-face"/><div className="person-neck"/><div className="person-body"/><div className="person-arm arm-left"/><div className="person-arm arm-right"/><div className="person-leg leg-left"/><div className="person-leg leg-right"/></div>
        <div className="floating-note"><span className="note-icon"><Sprout size={17}/></span><div><strong>Small steps,</strong><small>more grounded days</small></div><span className="note-spark">✳</span></div>
        <div className="image-credit">A MOMENT FOR YOURSELF <span>✳</span></div>
      </div>
      <div className="hero-bottom"><span>ROOTED IN TRADITION <i/> MADE FOR TODAY</span><a href="#how-it-works">Explore our approach <ArrowDown size={14}/></a></div>
    </section>
    <section className="trust-strip"><div className="trust-inner"><span>ANCIENT WISDOM, MADE PERSONAL</span><div><span><Flower2/> Ayurveda, thoughtfully shared</span><span><Activity/> Guidance that meets you here</span><span><ShieldCheck/> A companion, not a diagnosis</span></div></div></section>
    <section className="how-section wrap" id="how-it-works"><div className="section-heading"><div><div className="eyebrow">A SIMPLE PLACE TO BEGIN</div><h2>Wellness starts<br/><em>with a conversation.</em></h2></div><p>No complicated rituals or one-size-fits-all answers. Tell us what’s going on, and explore practical ideas grounded in Ayurvedic tradition.</p></div>
      <div className="steps-grid"><article><span className="step-num">01</span><span className="step-icon icon-sage"><Search/></span><h3>Start where you are</h3><p>Share a concern in your own words. There’s no perfect way to ask.</p></article><article><span className="step-num">02</span><span className="step-icon icon-peach"><Sparkles/></span><h3>Explore a personal plan</h3><p>Discover remedies, movement ideas and a little context for your wellbeing.</p></article><article><span className="step-num">03</span><span className="step-icon icon-gold"><Sun/></span><h3>Take what feels useful</h3><p>Small, thoughtful practices can be a gentle addition to everyday care.</p></article></div>
    </section>
    <section className="quote-section" id="about"><div className="quote-inner"><span className="quote-mark">“</span><div><div className="eyebrow">A TIMELESS WAY OF SEEING WELLNESS</div><blockquote>Care for the whole person.<br/><em>Come back to balance.</em></blockquote><p>Ayurveda is a tradition of holistic wellbeing that looks at how daily rhythms, food, rest and movement work together.</p></div><div className="quote-stamp"><Flower2/><span>ANCIENT<br/>WISDOM<br/><i>✳</i><br/>MODERN<br/>LIVING</span></div></div></section>
    <section className="closing-cta wrap"><div><span className="eyebrow">YOUR NEXT SMALL STEP</span><h2>Let’s begin with<br/><em>what you need.</em></h2></div><a href="#search" className="cta-button">Find your balance <ArrowRight size={17}/></a><span className="cta-decoration">✳</span></section>
    <Footer/>
  </main>
}

function Footer(){return <footer className="site-footer" id="footer"><div className="footer-inner"><Link to="/" className="brand"><span className="brand-mark"><Leaf size={18}/></span><span>ayursaathi<span className="brand-period">.</span></span></Link><span className="footer-note">A little more balance, one day at a time.</span><span className="footer-credit">Made with care by <strong>Ujjwal Sharma</strong></span><span className="footer-copy">© {new Date().getFullYear()} AyurSaathi</span></div><p className="footer-disclaimer">AyurSaathi shares general wellness information and is not a substitute for professional medical advice, diagnosis or treatment.</p></footer>}

function LoadingPlan(){return <div className="loading-panel"><div className="loading-orb"><LoaderCircle className="spin" size={25}/></div><span className="eyebrow">GATHERING THOUGHTFUL GUIDANCE</span><h2>Making space for<br/><em>a little more balance.</em></h2><p>We’re preparing ideas for you. This may take a moment.</p><div className="loading-bars"><i/><i/><i/></div></div>}

function RemedyPage(){
  const {disease=''}=useParams(), navigate=useNavigate(); const [params]=useSearchParams();
  const language=params.get('lang')||'en'; const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{let active=true;setLoading(true);setError('');setData(null);getRemedy(disease,language).then(result=>{if(active)setData(result)}).catch(err=>{if(!active)return;setError(err.response?.data?.error||'We couldn’t reach your wellness guide right now. Please try again in a moment.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[disease,language]);
  return <main className="results-page"><div className="results-top"><div className="results-wrap"><Link to="/" className="back-link"><ArrowLeft size={15}/> All topics</Link><div className="results-title"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR WELLNESS NOTES</div><h1>A little support for<br/><em>{decodeURIComponent(disease)}.</em></h1></div><div className="result-language"><span>PLAN LANGUAGE</span><select aria-label="Plan language" value={language} onChange={e=>navigate(`/remedy/${encodeURIComponent(disease)}?lang=${e.target.value}`)}>{languages.map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></div></div><SearchBox compact initial={decodeURIComponent(disease)} onSearch={v=>{if(v.trim())navigate(`/remedy/${encodeURIComponent(v.trim())}?lang=${language}`)}}/></div></div>
    <div className="results-wrap results-content"><AnimatePresence mode="wait">{loading?<motion.div key="loading" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><LoadingPlan/></motion.div>:error?<motion.div key="error" className="error-panel" initial={{opacity:0}} animate={{opacity:1}}><CircleAlert size={27}/><h2>We hit a small pause.</h2><p>{error}</p><button className="cta-button" onClick={()=>navigate(0)}>Try again <ArrowRight size={16}/></button><small>The API returns this message when generation fails or its AI key is unavailable.</small></motion.div>:data?<motion.div key={disease+language} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.35}}><div className="wellness-note"><span><Sparkles size={17}/></span><div><strong>A note for your wellbeing</strong><p>{data.ayurvedicAnalysis||data.healthTip}</p></div><span className="note-side">A GENTLE PLACE TO START</span></div>
      <div className="results-columns"><div className="main-results"><section className="result-section"><div className="result-section-head"><div><span className="eyebrow">01 · DAILY CARE</span><h2>A small thing to try</h2></div><span className="round-section-icon"><Sun size={18}/></span></div><div className="tip-card"><span className="tip-line"/><p>{data.healthTip||'Take a moment to rest, hydrate and notice what your body needs today.'}</p></div></section>
      <section className="result-section"><div className="result-section-head"><div><span className="eyebrow">02 · FROM THE KITCHEN</span><h2>Home remedies</h2></div><span className="count-label">{(data.homeRemedies||[]).length} IDEAS</span></div><div className="remedy-list">{(data.homeRemedies||[]).map((remedy,i)=><RemedyCard key={i} remedy={remedy} index={i}/>)}</div>{!data.homeRemedies?.length&&<p className="empty-note">No home remedies were included in this plan.</p>}</section>
      <section className="result-section"><div className="result-section-head"><div><span className="eyebrow">03 · GENTLE MOVEMENT</span><h2>Move & breathe</h2></div><span className="round-section-icon icon-sage"><Activity size={18}/></span></div><div className="yoga-list">{(data.yoga||[]).map((pose,i)=><YogaCard key={i} pose={pose} index={i}/>)}</div>{!data.yoga?.length&&<p className="empty-note">No movement ideas were included in this plan.</p>}</section></div>
      <aside className="side-results"><div className="doctor-card"><div className="doctor-icon"><ShieldCheck size={20}/></div><span className="eyebrow">WHEN TO SEEK CARE</span><h3>Listen to your body.</h3><p>{data.doctorAdvice||'If your symptoms persist or concern you, speak with a qualified healthcare professional.'}</p><div className="doctor-rule"/><small>Professional care is always the right next step when you need it.</small></div><div className="side-reminder"><span>✳</span><p>These ideas are here to support your wellbeing, alongside advice from your healthcare professional.</p></div></aside></div><div className="results-end"><Flower2 size={17}/> WISHING YOU A LITTLE MORE EASE</div></motion.div>:null}</AnimatePresence></div><Footer/></main>
}

function RemedyCard({remedy,index}){const [open,setOpen]=useState(index===0);return <article className={`remedy-card ${open?'remedy-open':''}`}><button className="remedy-toggle" onClick={()=>setOpen(!open)} aria-expanded={open}><span className="remedy-number">{String(index+1).padStart(2,'0')}</span><span className="remedy-title-wrap"><strong>{remedy.remedyName||'Home remedy'}</strong><small>{remedy.ingredients?.length||0} ingredients <i/> {remedy.preparationSteps?.length||0} steps</small></span><span className="accordion-chevron">⌄</span></button>{open&&<div className="remedy-body"><div><span className="eyebrow">WHAT YOU’LL NEED</span><ul className="ingredient-list">{(remedy.ingredients||[]).map((item,i)=><li key={i}><Check size={13}/>{item}</li>)}</ul></div><div><span className="eyebrow">HOW TO PREPARE</span><ol className="steps-list">{(remedy.preparationSteps||[]).map((step,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{step}</li>)}</ol></div></div>}</article>}

function YogaCard({pose,index}){const query=pose.youtubeSearchQuery||`${pose.asanaName} yoga tutorial`;return <article className="yoga-card"><span className="yoga-index">{String(index+1).padStart(2,'0')}</span><div className="yoga-content"><div className="yoga-title-row"><h3>{pose.asanaName||'Mindful movement'}</h3><span className="duration"><Clock3 size={13}/>{pose.duration||'A few minutes'}</span></div><ol className="yoga-steps">{(pose.howToDo||[]).map((step,i)=><li key={i}><span>{i+1}</span>{step}</li>)}</ol><a className="video-link" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer"><span><Play size={12} fill="currentColor"/></span> Find a guided video <ArrowUpRight size={13}/></a></div></article>}

export default function App(){const [apiState,setApiState]=useState('checking');useEffect(()=>{getApiStatus().then(res=>setApiState(res.status==='ok'?'online':'offline')).catch(()=>setApiState('offline'))},[]);return <><Header/><div className="api-indicator"><span className={apiState==='online'?'status-online':''}/>{apiState==='checking'?'Connecting':apiState==='online'?'Guide connected':'Guide unavailable'}</div><Routes><Route path="/" element={<Home/>}/><Route path="/remedy/:disease" element={<RemedyPage/>}/><Route path="*" element={<Home/>}/></Routes></>}
