import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const ROLES = [
  'I build AI-powered platforms',
  'Semantic Kernel / MCP / .NET / AWS',
  'From prompts to production',
  'Agents & clean architecture',
]

const FOCUS = [
  {
    icon: '🤖',
    title: 'AI Engineering',
    text: 'Prompt studios, agent workflows, prompt chaining and structured outputs with Semantic Kernel, MCP and LLM orchestration.',
  },
  {
    icon: '🏗️',
    title: 'Backend & Arch',
    text: '.NET / C# services, REST APIs, CQRS and clean architecture for maintainable, distributed enterprise systems.',
  },
  {
    icon: '☁️',
    title: 'Cloud & Infra',
    text: 'AWS (ECS, DynamoDB, Elasticache, SSM, CloudWatch) provisioned with Terraform, plus OpenTelemetry observability.',
  },
  {
    icon: '🕹️',
    title: 'Frontend',
    text: 'Angular & React in Nx monorepos, reusable component libraries and JSON-driven dynamic UIs.',
  },
]

const SKILLS: { group: string; items: string[] }[] = [
  { group: 'AI & LLM', items: ['Semantic Kernel', 'MCP', 'Prompt Eng', 'Agents', 'Structured Outputs', 'Claude', 'OpenAI'] },
  { group: 'Backend', items: ['.NET / C#', 'Python', 'Node.js', 'NestJS', 'REST', 'CQRS'] },
  { group: 'Cloud & Infra', items: ['AWS', 'Terraform', 'Docker', 'Redis', 'DynamoDB', 'OpenTelemetry'] },
  { group: 'Frontend & Data', items: ['React', 'Angular', 'TypeScript', 'Nx', 'PostgreSQL', 'MongoDB'] },
]

const PROJECTS = [
  {
    tag: 'AI PLATFORM',
    title: 'Prompt Studio',
    text: 'Platform for testing, evaluating and managing prompts in healthcare AI workflows — chained prompts, reusable definitions, memory handling and formatted responses.',
    link: null,
    linkLabel: 'ENTERPRISE / PRIVATE',
  },
  {
    tag: 'AI BACKEND',
    title: 'LLM Orchestration',
    text: 'Backend capabilities built with .NET + Semantic Kernel: feature chaining, MCP tool integrations, Redis-based chat memory and agent workflows.',
    link: null,
    linkLabel: 'ENTERPRISE / PRIVATE',
  },
  {
    tag: 'OPEN SOURCE',
    title: 'Codigo de Altura',
    text: 'A small collective of coder friends I co-founded — where I experiment with agents, tooling and side projects.',
    link: 'https://github.com/Codigo-de-Altura',
    linkLabel: 'VIEW ON GITHUB >',
  },
]

/* ---------- pixel robot ---------- */
function PixelRobot() {
  return (
    <svg className="robot" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-label="pixel robot">
      {/* antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#37e0ff" />
      <rect x="7" y="2" width="2" height="1" fill="#6c63a6" />
      {/* head outline + face */}
      <rect x="2" y="3" width="12" height="11" fill="#241a52" />
      <rect x="3" y="4" width="10" height="9" fill="#9d7bff" />
      <rect x="3" y="11" width="10" height="2" fill="#7c5ce0" />
      {/* side bolts */}
      <rect x="1" y="7" width="1" height="3" fill="#6c63a6" />
      <rect x="14" y="7" width="1" height="3" fill="#6c63a6" />
      {/* eyes */}
      <rect className="eye" x="5" y="6" width="2" height="3" fill="#37e0ff" />
      <rect className="eye" x="9" y="6" width="2" height="3" fill="#37e0ff" />
      {/* cheeks */}
      <rect x="4" y="9" width="1" height="1" fill="#ff4d8d" />
      <rect x="11" y="9" width="1" height="1" fill="#ff4d8d" />
      {/* mouth */}
      <rect x="6" y="10" width="4" height="1" fill="#241a52" />
      <rect x="7" y="10" width="2" height="1" fill="#ff4d8d" />
      {/* neck / body */}
      <rect x="6" y="14" width="4" height="2" fill="#6c63a6" />
    </svg>
  )
}

/* ---------- starfield ---------- */
function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 42 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        size: Math.random() > 0.8 ? 4 : 2,
      })),
    [],
  )
  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  )
}

/* ---------- typewriter ---------- */
function useTypewriter(words: string[]) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex % words.length]
    const speed = deleting ? 35 : 70
    const timeout = setTimeout(() => {
      const next = deleting
        ? current.substring(0, text.length - 1)
        : current.substring(0, text.length + 1)
      setText(next)
      if (!deleting && next === current) setTimeout(() => setDeleting(true), 1500)
      else if (deleting && next === '') {
        setDeleting(false)
        setWordIndex((i) => i + 1)
      }
    }, speed)
    return () => clearTimeout(timeout)
  }, [text, deleting, wordIndex, words])

  return text
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-70px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const typed = useTypewriter(ROLES)

  return (
    <>
      <div className="bg" />
      <div className="bg-grid" />
      <Stars />
      <div className="scanlines" />

      <nav className="nav">
        <span className="nav-logo gradient-text">◆ AG</span>
        <div className="nav-links">
          <a href="#about">ABOUT</a>
          <a href="#focus">FOCUS</a>
          <a href="#skills">STACK</a>
          <a href="#work">WORK</a>
          <a href="#contact">CONTACT</a>
        </div>
      </nav>

      <div className="container">
        {/* HERO */}
        <header className="hero" id="top">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="hero-badge">
              <span className="blink">◆</span> ONLINE / OPEN TO WORK
            </span>
            <h1>
              ANDRES
              <br />
              <span className="gradient-text">GUZMAN</span>
            </h1>
            <p className="hero-sub">
              Senior AI / Full-Stack Software Engineer turning large language models into real,
              production-grade products.
            </p>
            <p className="hero-roles">
              {typed}
              <span className="cursor">█</span>
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#contact">GET IN TOUCH</a>
              <a className="btn" href="https://github.com/andyguz17" target="_blank" rel="noreferrer">GITHUB</a>
              <a className="btn" href="https://linkedin.com/in/andres-guzman-a63757139" target="_blank" rel="noreferrer">LINKEDIN</a>
            </div>
          </motion.div>

          <motion.div
            className="hero-art"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PixelRobot />
          </motion.div>
        </header>
      </div>

      <div className="container">
        {/* ABOUT */}
        <section id="about">
          <Reveal>
            <p className="eyebrow">01 — ABOUT</p>
            <p className="about-text">
              I started in <span className="hl">mechatronics and computer vision</span>, and today I
              design and build <strong>AI platforms</strong>: prompt-execution pipelines, agent
              workflows, and the cloud-native backends and enterprise frontends that make them
              usable. I like owning the whole path — from a raw prompt, to an orchestrated agent, to
              a clean API, to the UI a real team ships every day.
            </p>
          </Reveal>
        </section>

        {/* FOCUS */}
        <section id="focus">
          <Reveal>
            <p className="eyebrow">02 — WHAT I DO</p>
            <h2 className="section-title">FOCUS AREAS</h2>
          </Reveal>
          <div className="grid">
            {FOCUS.map((f, i) => (
              <motion.div
                key={f.title}
                className="card"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="card-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills">
          <Reveal>
            <p className="eyebrow">03 — TOOLBOX</p>
            <h2 className="section-title">TECH STACK</h2>
          </Reveal>
          {SKILLS.map((s, i) => (
            <Reveal key={s.group} delay={i * 0.05}>
              <div className="skill-group">
                <h4>{s.group}</h4>
                <div className="pills">
                  {s.items.map((it) => (
                    <span className="pill" key={it}>{it}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* WORK */}
        <section id="work">
          <Reveal>
            <p className="eyebrow">04 — SELECTED WORK</p>
            <h2 className="section-title">THINGS I BUILT</h2>
          </Reveal>
          <div className="grid">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.title}
                className="project-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                {p.link ? (
                  <a className="project-link" href={p.link} target="_blank" rel="noreferrer">{p.linkLabel}</a>
                ) : (
                  <span className="project-link" style={{ color: 'var(--muted)' }}>{p.linkLabel}</span>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact">
          <Reveal>
            <p className="eyebrow">05 — CONTACT</p>
            <h2>
              LET'S BUILD SOMETHING <span className="gradient-text">SMART</span>
            </h2>
            <p>
              Open to AI engineering, backend architecture and full-stack roles. The fastest way to
              reach me is email or LinkedIn.
            </p>
            <div className="cta-row" style={{ justifyContent: 'center' }}>
              <a className="btn btn-primary" href="mailto:andyguz17@gmail.com">EMAIL ME</a>
              <a className="btn" href="https://linkedin.com/in/andres-guzman-a63757139" target="_blank" rel="noreferrer">LINKEDIN</a>
            </div>
          </Reveal>
        </section>
      </div>

      <footer className="footer">
        <div>© {new Date().getFullYear()} ANDRES GUZMAN · BUILT WITH REACT + VITE · <span className="insert-coin">INSERT COIN</span></div>
        <div className="socials">
          <a href="https://github.com/andyguz17" target="_blank" rel="noreferrer">GITHUB</a>
          <a href="https://linkedin.com/in/andres-guzman-a63757139" target="_blank" rel="noreferrer">LINKEDIN</a>
          <a href="https://instagram.com/andyguz17" target="_blank" rel="noreferrer">INSTAGRAM</a>
        </div>
      </footer>
    </>
  )
}
