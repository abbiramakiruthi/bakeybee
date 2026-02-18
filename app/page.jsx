'use client'

import { useState, useEffect, useRef } from 'react'
import menuData from '../data/menu.json'
import { WHATSAPP_NUMBER } from '../lib/config'

function HeroBee({ style }) {
  return (
    <svg viewBox="0 0 120 120" style={style} className="hero-bee">
      <g>
        <ellipse cx="40" cy="45" rx="18" ry="12" fill="rgba(255,255,255,0.5)" transform="rotate(-30 40 45)">
          <animateTransform attributeName="transform" type="rotate" values="-30 40 45;-20 40 45;-30 40 45" dur="0.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="80" cy="45" rx="18" ry="12" fill="rgba(255,255,255,0.5)" transform="rotate(30 80 45)">
          <animateTransform attributeName="transform" type="rotate" values="30 80 45;20 80 45;30 80 45" dur="0.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="60" cy="62" rx="22" ry="26" fill="#FFD43B"/>
        <path d="M40 55 Q60 50 80 55" stroke="#5C3A0D" strokeWidth="4" fill="none"/>
        <path d="M38 65 Q60 60 82 65" stroke="#5C3A0D" strokeWidth="4" fill="none"/>
        <path d="M40 75 Q60 70 80 75" stroke="#5C3A0D" strokeWidth="4" fill="none"/>
        <circle cx="52" cy="50" r="3" fill="#5C3A0D"/>
        <circle cx="68" cy="50" r="3" fill="#5C3A0D"/>
        <path d="M55 58 Q60 63 65 58" stroke="#5C3A0D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="52" y1="38" x2="45" y2="25" stroke="#5C3A0D" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="45" cy="24" r="3" fill="#FFD43B"/>
        <line x1="68" y1="38" x2="75" y2="25" stroke="#5C3A0D" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="75" cy="24" r="3" fill="#FFD43B"/>
      </g>
    </svg>
  )
}

function MenuCard({ item, index }) {
  return (
    <div className="menu-item" style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="menu-item-top">
        <span className="item-name">
          {item.name}
          {item.tag && <span className="item-tag" data-tag={item.tag}>{item.tag}</span>}
        </span>
        <span className="item-dots"></span>
        <span className="item-price">₹{item.price}</span>
      </div>
      {item.desc && <p className="item-desc">{item.desc}</p>}
    </div>
  )
}

export default function Page() {
  const [activeCategory, setActiveCategory] = useState('brownies')
  const [isScrolled, setIsScrolled] = useState(false)
  const [beeOffset, setBeeOffset] = useState(0)
  const [showOrderCta, setShowOrderCta] = useState(false)
  const [navOffset, setNavOffset] = useState(90)
  const heroRef = useRef(null)
  const navRef = useRef(null)
  const menuRef = useRef(null)
  const aboutRef = useRef(null)
  const contactRef = useRef(null)
  const categoryRefs = useRef({})
  const catNavRef = useRef(null)

  const message = 'Hi Bakey Bee! I\'d like to place an order. Please share availability.'
  const waOrderUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  const activeCatRef = useRef('brownies')
  const beeOffsetRef = useRef(0)
  const isAutoScrollingRef = useRef(false)
  const forcedActiveRef = useRef(null)
  const forcedActiveUntilRef = useRef(0)

  useEffect(() => {
    let ticking = false
    const updateMetrics = () => {
      const nextIsScrolled = window.scrollY > 80
      const nextBeeOffset = Math.min(window.scrollY * 0.15, 80)
      const heroBottom = heroRef.current
        ? heroRef.current.offsetTop + heroRef.current.offsetHeight
        : 0
      const nextShowOrderCta = window.scrollY > heroBottom - 80

      const navHeight = navRef.current?.offsetHeight ?? 0
      const nextNavOffset = navHeight || 0

      setIsScrolled(nextIsScrolled)
      if (nextNavOffset !== navOffset) {
        setNavOffset(nextNavOffset)
      }
      setShowOrderCta(nextShowOrderCta)
      if (Math.abs(nextBeeOffset - beeOffsetRef.current) > 0.5) {
        beeOffsetRef.current = nextBeeOffset
        setBeeOffset(nextBeeOffset)
      }
    }

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        updateMetrics()
        ticking = false
      })
    }

    const handleResize = () => {
      updateMetrics()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    updateMetrics()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [navOffset])

  const scrollPillIntoView = (key, behavior = 'smooth') => {
    const nav = catNavRef.current
    const scroller = nav?.querySelector('.category-nav-inner')
    const btn = nav?.querySelector(`[data-cat="${key}"]`)
    if (!nav || !scroller || !btn) return

    const navRect = scroller.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const isOffscreen = btnRect.left < navRect.left || btnRect.right > navRect.right
    if (!isOffscreen) return

    const btnCenter = btn.offsetLeft + btn.offsetWidth / 2
    const target = Math.max(0, btnCenter - scroller.clientWidth / 2)
    scroller.scrollTo({ left: target, behavior })
  }

  useEffect(() => {
    let ticking = false
    const handleMenuScroll = () => {
      if (ticking || isAutoScrollingRef.current) return
      ticking = true
      window.requestAnimationFrame(() => {
        if (forcedActiveRef.current && Date.now() < forcedActiveUntilRef.current) {
          const forcedKey = forcedActiveRef.current
          if (forcedKey !== activeCatRef.current) {
            activeCatRef.current = forcedKey
            setActiveCategory(forcedKey)
            scrollPillIntoView(forcedKey, 'smooth')
          }
          ticking = false
          return
        }
        const navHeight = navRef.current?.offsetHeight ?? 0
        const catNavHeight = catNavRef.current?.offsetHeight ?? 0
        const offset = navHeight + catNavHeight + 16
        const scrollY = window.scrollY + offset
        let current = Object.keys(menuData)[0]

        Object.keys(menuData).forEach((key) => {
          const el = categoryRefs.current[key]
          if (!el) return
          const top = el.getBoundingClientRect().top + window.pageYOffset
          if (top <= scrollY) {
            current = key
          }
        })

        if (current && current !== activeCatRef.current) {
          activeCatRef.current = current
          setActiveCategory(current)
          scrollPillIntoView(current, 'smooth')
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', handleMenuScroll, { passive: true })
    handleMenuScroll()
    return () => window.removeEventListener('scroll', handleMenuScroll)
  }, [])

  const scrollToRef = (ref, offset = navOffset) => {
    if (!ref.current) return
    const y = ref.current.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const scrollToMenu = () => scrollToRef(menuRef, 110)
  const scrollToAbout = () => scrollToRef(aboutRef, 90)
  const scrollToContact = () => scrollToRef(contactRef, 90)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      heroRef.current?.focus()
    }, 300)
  }

  const scrollToCategory = (key) => {
    activeCatRef.current = key
    setActiveCategory(key)
    const el = categoryRefs.current[key]
    if (!el) return
    const navHeight = navRef.current?.offsetHeight ?? 0
    const catNavHeight = catNavRef.current?.offsetHeight ?? 0
    const offset = navHeight + catNavHeight + 4
    const targetY = el.getBoundingClientRect().top + window.pageYOffset - offset

    isAutoScrollingRef.current = true
    window.scrollTo({ top: targetY, behavior: 'smooth' })
    scrollPillIntoView(key, 'smooth')

    const start = Date.now()
    const release = () => { isAutoScrollingRef.current = false }
    const check = () => {
      const currentY = window.scrollY
      if (Math.abs(currentY - targetY) < 6 || Date.now() - start > 1800) {
        release()
        forcedActiveRef.current = key
        forcedActiveUntilRef.current = Date.now() + 900
        return
      }
      window.requestAnimationFrame(check)
    }
    window.requestAnimationFrame(check)
  }

  return (
    <div className="app">
      {/* Nav */}
      <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`} ref={navRef}>
        <div className="nav-inner">
          <button className="nav-logo" onClick={scrollToTop} type="button" aria-label="Back to top">
            <span className="nav-bee-icon">🐝</span>
            <span>Bakey Bee</span>
          </button>
          <div className="nav-links">
            <button className="nav-link-btn" type="button" onClick={scrollToAbout}>
              About
            </button>
            <button className="nav-link-btn" type="button" onClick={scrollToMenu}>
              Menu
            </button>
            <button className="nav-link-btn" type="button" onClick={scrollToContact}>
              Contact
            </button>
            {showOrderCta && (
              <a
                className="nav-cta"
                href={waOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="nav-cta-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" role="img" focusable="false">
                    <path
                      d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.302 22.612c-.39 1.1-1.932 2.014-3.168 2.282-.846.18-1.95.324-5.67-1.218-4.762-1.974-7.828-6.8-8.066-7.114-.23-.314-1.926-2.566-1.926-4.892s1.22-3.472 1.652-3.946c.432-.474.944-.592 1.258-.592.314 0 .628.002.902.016.29.014.678-.11 1.06.808.39.944 1.328 3.236 1.444 3.472.116.236.194.51.038.824-.154.314-.232.51-.462.786-.23.274-.486.614-.692.824-.23.236-.47.49-.202.962.268.472 1.194 1.968 2.564 3.188 1.762 1.568 3.248 2.054 3.71 2.282.462.228.73.192.998-.116.27-.314 1.152-1.342 1.458-1.802.308-.462.614-.384 1.038-.23.424.154 2.704 1.276 3.166 1.508.462.23.77.348.886.54.116.192.116 1.1-.274 2.2z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                    />
                  </svg>
                </span>
                Order Now
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="hero" ref={heroRef} tabIndex={-1}>
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="kicker-line"></span>
            <span>EST. 2025</span>
          </div>
          <HeroBee
            style={{
              width: '130px',
              height: '130px',
              marginBottom: '0.5rem',
              transform: `translateY(${beeOffset}px)`,
              transition: 'transform 0.25s ease-out',
              willChange: 'transform',
            }}
          />
          <h1 className="hero-title">
            Sweet <span className="hero-title-accent">Like</span>
            <br />
            Honey.
          </h1>
          <p className="hero-tagline">Buzzing With Delight</p>
          <p className="hero-sub">
            Handcrafted brownies, blondies, and cakes baked fresh every morning.
            Experience the buzz of pure sweetness in every bite.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={scrollToMenu}>
              Browse Menu
              <span className="cta-arrow">→</span>
            </button>
            <a
              className="hero-ghost"
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hero-ghost-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" role="img" focusable="false">
                  <path
                    d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.302 22.612c-.39 1.1-1.932 2.014-3.168 2.282-.846.18-1.95.324-5.67-1.218-4.762-1.974-7.828-6.8-8.066-7.114-.23-.314-1.926-2.566-1.926-4.892s1.22-3.472 1.652-3.946c.432-.474.944-.592 1.258-.592.314 0 .628.002.902.016.29.014.678-.11 1.06.808.39.944 1.328 3.236 1.444 3.472.116.236.194.51.038.824-.154.314-.232.51-.462.786-.23.274-.486.614-.692.824-.23.236-.47.49-.202.962.268.472 1.194 1.968 2.564 3.188 1.762 1.568 3.248 2.054 3.71 2.282.462.228.73.192.998-.116.27-.314 1.152-1.342 1.458-1.802.308-.462.614-.384 1.038-.23.424.154 2.704 1.276 3.166 1.508.462.23.77.348.886.54.116.192.116 1.1-.274 2.2z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  />
                </svg>
              </span>
              Order Now
            </a>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C320,120 480,0 720,60 C960,120 1120,0 1440,60 L1440,120 L0,120 Z" fill="var(--cream)"/>
          </svg>
        </div>
      </section>

      {/* About */}
      <section className="about-section" ref={aboutRef}>
        <div className="about-inner">
          <div className="about-grid">
            <div className="about-copy">
              <div className="about-kicker">The Bee-hind Story</div>
              <h2 className="about-title">Small Kitchen, <span>Big Heart.</span></h2>
              <p className="about-text">
                From a tiny home oven in 2025 to a buzzing neighborhood favorite, Bakey Bee
                is built on honest ingredients, warm flavors, and desserts made to share.
              </p>
              <div className="about-cards">
                <div className="about-card">
                  <h3>Freshly Baked</h3>
                  <p>Small batches every morning for peak flavor and texture.</p>
                </div>
                <div className="about-card">
                  <h3>Local Love</h3>
                  <p>Premium, locally sourced ingredients whenever possible.</p>
                </div>
                <div className="about-card">
                  <h3>Custom Orders</h3>
                  <p>Celebrations, gifting, and cravings — we bake for all of it.</p>
                </div>
              </div>
            </div>
            <div className="about-media" role="img" aria-label="Bakey Bee kitchen and treats"></div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="specialties">
        <h2 className="section-title">Our Specialties</h2>
        <div className="specialties-grid">
          {[
            { emoji: "🍫", title: "Brownies & Blondies", desc: "Rich, fudgy, and irresistible — from classic to loaded Nutella & Biscoff" },
            { emoji: "🧁", title: "Cupcakes", desc: "Fluffy, moist cupcakes in 10+ flavors starting at just ₹20" },
            { emoji: "🎂", title: "Custom Cakes", desc: "Celebration cakes in 14 flavors — Rasamalai, Biscoff, Ferrero & more" },
            { emoji: "🍩", title: "Donuts & Bombaloni", desc: "Glazed, filled, and coated in your favorite chocolates" },
          ].map((item, i) => (
            <div className="specialty-card" key={i}>
              <span className="specialty-emoji">{item.emoji}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section
        className="menu-section"
        id="menu"
        ref={menuRef}
        style={{ '--nav-offset': `${navOffset}px`, '--nav-gap': '0px' }}
      >
        <div className="section-head">
          <div className="section-kicker">Freshly Baked</div>
          <h2 className="section-title section-title-dark">The Sweet List</h2>
          <p className="section-sub">
            From our hive to your home. Browse our handcrafted selection of treats.
          </p>
        </div>

        <div className="category-nav" ref={catNavRef}>
          <div className="category-nav-inner">
            {Object.entries(menuData).map(([key, cat]) => (
              <button
                key={key}
                data-cat={key}
                className={`cat-btn ${activeCategory === key ? 'cat-btn-active' : ''}`}
                onClick={() => scrollToCategory(key)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="menu-container">
          {Object.entries(menuData).map(([key, category]) => (
            <div
              key={key}
              className="menu-category"
              data-category={key}
              ref={(el) => (categoryRefs.current[key] = el)}
            >
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <h3 className="category-title">{category.title}</h3>
                <div className="category-line"></div>
              </div>
              <div className="menu-items-list">
                {category.items.map((item, i) => (
                  <MenuCard key={i} item={item} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sweet Note */}
      <section className="toppings-note">
        <div className="toppings-inner">
          <span className="toppings-icon">🍯</span>
          <div>
            <h3>Sweet Note</h3>
            <p>Brownie Slab toppings (Nuts / Walnut / Chocolates / Nutella / Biscoff) — <strong>₹50</strong></p>
            <p>Cupcake Whip topping — <strong>₹5</strong> &nbsp;|&nbsp; Cupcake Ganache topping — <strong>₹10</strong></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact" ref={contactRef}>
        <div className="footer-inner">
          <div className="footer-brand">
            <HeroBee style={{ width: '60px', height: '60px' }} />
            <h3>Bakey Bee</h3>
            <p className="footer-tagline">Buzzing with Delight</p>
          </div>
          <div className="footer-col">
            <h4>Follow Us</h4>
            <a href="https://instagram.com/_bakey_bee_" target="_blank" rel="noopener noreferrer" className="insta-link">
              📸 @_bakey_bee_
            </a>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <p>Small-batch bakes with local ingredients and big heart.</p>
          </div>
          <div className="footer-col">
            <h4>Order Now</h4>
            <p>DM us on Instagram</p>
            <p>Custom orders welcome!</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Bakey Bee — Made with 🍯 and love</p>
        </div>
      </footer>
    </div>
  )
}
