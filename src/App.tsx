import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ROLES = [
  'I build AI-powered platforms',
  'Semantic Kernel • MCP • .NET • AWS',
  'From prompts to production',
  'Agents, orchestration & clean architecture',
]

const FOCUS = [
  {
    icon: '🤖',
    title: 'AI Engineering',
    text: 'Prompt studios, agent workflows, prompt chaining and structured outputs with Semantic Kernel, MCP and LLM orchestration.',
  },
  {
    icon: '🏗️',
    title: 'Backend & Architecture',
    text: '.NET / C# services, REST APIs, CQRS and clean architecture for maintainable, distributed enterprise systems.',
  },
  {
    icon: '☁️',
    title: 'Cloud & Infra',
    text: 'AWS (ECS, DynamoDB, Elasticache, SSM, CloudWatch) provisioned with Terraform, plus OpenTelemetry observability.',
  },
  {
    icon: '🎨',
    title: 'Frontend & Platform',
    text: 'Angular & React in Nx monorepos, reusable component libraries and JSON-driven dynamic UIs.',
  },
]

const SKILLS: { group: string; items: string[] }[] = [
  { group: 'AI & LLM', items: ['Semantic Kernel', 'MCP', 'Prompt Engineering', 'Agents', 'Structured Outputs', 'Claude', 'OpenAI'] },
  { group: 'Backend', items: ['.NET / C#', 'Python', 'Node.js', 'NestJS', 'REST', 'CQRS'] },
  { group: 'Cloud & Infra', items: ['AWS', 'Terraform', 'Docker', 'Redis', 'DynamoDB', 'OpenTelemetry'] },
  { group: 'Frontend & Data', items: ['React', 'Angular', 'TypeScript', 'Nx', 'PostgreSQL', 'MongoDB'] },
]

const PROJECTS = [
  {
    tag: 'AI Platform',
    title: 'Prompt Studio',
    text: 'Platform for testing, evaluating and managing prompts in healthcare AI workflows — chained prompts, reusable definitions, memory handling and formatted responses.',
    link: null,
    linkLabel: 'Enterprise · private',
  },
  {
    tag: 'AI Backend',
    title: 'LLM Orchestration Services',
    text: 'Backend capabilities built with .NET + Semantic Kernel: feature chaining, MCP tool integrations, Redis-based chat memory and agent workflows.',
    link: null,
    linkLabel: 'Enterprise · private',
  },
  {
    tag: 'Open Source',
    title: 'Código de Altura',
    text: 'A small collective of coder friends I co-founded — where I experiment with agents, tooling and side projects.',
    link: 'https://github.com/Codigo-de-Altura',
    linkLabel: 'View on GitHub →',
  },
]

function useTypewriter(words: string[]) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex % words.length]
    const speed = deleting ? 40 : 80
    const timeout = setTimeout(() => {
      const next = deleting
        ? current.substring(0, text.length - 1)
        : current.substring(0, text.length + 1)
      setText(next)
      if (!deleting && next === current) {
        setTimeout(() => setDeleting(true), 1600)
      } else if (deleting && next === '') {
        setDeleting(false)
        setWordIndex((i) => i + 1)
      }
    }, speed)
    return () => clearTimeout(timeout)
  }, [text, deleting, wordIndex, words])

  return text
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const typed = useTypewriter(ROLES)

  return (
    <>
      <div className="bg-glows">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />
      </div>

      <nav className="nav">
        <span className="nav-logo gradient-text">AG</span>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#focus">Focus</a>
          <a href="#skills">Stack</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <div className="container">
        {/* HERO */}
        <header className="hero" id="top">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="hero-badge">
              <span className="dot" /> Available for AI-focused work
            </span>
            <h1>
              Hi, I'm <span className="gradient-text">Andres Guzman</span>
            </h1>
            <p className="hero-sub">
              Senior AI / Full-Stack Software Engineer turning large language models into
              real, production-grade products.
            </p>
            <p className="hero-roles mono">
              {typed}
              <span style={{ color: '#8b5cf6' }}>▌</span>
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#contact">
                Get in touch
              </a>
              <a className="btn btn-ghost" href="https://github.com/andyguz17" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a
                className="btn btn-ghost"
                href="https://linkedin.com/in/andres-guzman-a63757139"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
          </motion.div>
        </header>

        {/* ABOUT */}
        <section id="about">
          <Reveal>
            <p className="eyebrow">01 — About</p>
            <p className="about-text">
              I started in <span className="muted">mechatronics and computer vision</span>, and
              today I design and build <strong>AI platforms</strong>: prompt-execution pipelines,
              agent workflows, and the cloud-native backends and enterprise frontends that make
              them usable. I like owning the whole path —{' '}
              <span className="muted">from a raw prompt, to an orchestrated agent, to a clean API,
              to the UI a real team ships every day.</span>
            </p>
          </Reveal>
        </section>

        {/* FOCUS */}
        <section id="focus">
          <Reveal>
            <p className="eyebrow">02 — What I do</p>
            <h2 className="section-title">Focus areas</h2>
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
            <p className="eyebrow">03 — Toolbox</p>
            <h2 className="section-title">Tech I work with</h2>
          </Reveal>
          {SKILLS.map((s) => (
            <Reveal key={s.group}>
              <div className="skill-group">
                <h4>{s.group}</h4>
                <div className="pills">
                  {s.items.map((it) => (
                    <span className="pill" key={it}>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* WORK */}
        <section id="work">
          <Reveal>
            <p className="eyebrow">04 — Selected work</p>
            <h2 className="section-title">Things I've built</h2>
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
                  <a className="project-link" href={p.link} target="_blank" rel="noreferrer">
                    {p.linkLabel}
                  </a>
                ) : (
                  <span className="project-link" style={{ color: 'var(--muted)' }}>
                    {p.linkLabel}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact">
          <Reveal>
            <p className="eyebrow">05 — Contact</p>
            <h2>
              Let's build something <span className="gradient-text">intelligent</span>.
            </h2>
            <p>
              Open to AI engineering, backend architecture and full-stack roles. The fastest way
              to reach me is email or LinkedIn.
            </p>
            <div className="cta-row" style={{ justifyContent: 'center' }}>
              <a className="btn btn-primary" href="mailto:andyguz17@gmail.com">
                andyguz17@gmail.com
              </a>
              <a
                className="btn btn-ghost"
                href="https://linkedin.com/in/andres-guzman-a63757139"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
          </Reveal>
        </section>
      </div>

      <footer className="footer">
        <div>© {new Date().getFullYear()} Andres Guzman · Built with React + Vite · Hosted on GitHub Pages</div>
        <div className="socials">
          <a href="https://github.com/andyguz17" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/andres-guzman-a63757139" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://instagram.com/andyguz17" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </footer>
    </>
  )
}
