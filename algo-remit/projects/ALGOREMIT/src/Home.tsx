import { useEffect, useRef, useState } from 'react'
import { FaReddit, FaRocket } from 'react-icons/fa'
import { FiAlertCircle, FiClock, FiDollarSign, FiGithub, FiLinkedin, FiMail, FiMenu, FiTwitter, FiUsers, FiX } from 'react-icons/fi'
import { SiAlgorand, SiCashapp, SiMastercard, SiPaypal, SiVisa, SiWesternunion } from 'react-icons/si'
import { HashLink } from 'react-router-hash-link'
import CostComparison from './components/CostComparison'
import ImpactChart from './components/ImpactChart'
import MarketExpansion from './components/MarketExpansion'

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null)
  const heroButtonRef = useRef<HTMLAnchorElement>(null)
  const heroOrbsRef = useRef<HTMLDivElement[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  const problemSolutionRef = useRef<HTMLDivElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  const simulationsRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const navRef = useRef<HTMLElement>(null)
  const statItemsRef = useRef<HTMLDivElement[]>([])
  const problemCardRef = useRef<HTMLDivElement>(null)
  const solutionCardRef = useRef<HTMLDivElement>(null)
  const demoCardRef = useRef<HTMLDivElement>(null)
  const simulationCardsRef = useRef<HTMLDivElement[]>([])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !statItemsRef.current.includes(el)) {
      statItemsRef.current.push(el)
    }
  }

  const addSimulationRef = (el: HTMLDivElement | null) => {
    if (el && !simulationCardsRef.current.includes(el)) {
      simulationCardsRef.current.push(el)
    }
  }

  const addOrbRef = (el: HTMLDivElement | null) => {
    if (el && !heroOrbsRef.current.includes(el)) {
      heroOrbsRef.current.push(el)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp')
          }
        })
      },
      { threshold: 0.1 },
    )

    if (navRef.current) observer.observe(navRef.current)
    if (heroTitleRef.current) observer.observe(heroTitleRef.current)
    if (heroSubtitleRef.current) observer.observe(heroSubtitleRef.current)
    if (heroButtonRef.current) observer.observe(heroButtonRef.current)
    statItemsRef.current.forEach((item) => observer.observe(item))
    if (problemCardRef.current) observer.observe(problemCardRef.current)
    if (solutionCardRef.current) observer.observe(solutionCardRef.current)
    if (demoCardRef.current) observer.observe(demoCardRef.current)
    simulationCardsRef.current.forEach((card) => observer.observe(card))
    if (footerRef.current) observer.observe(footerRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-gray-800 font-sans overflow-hidden cursor-default">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={addOrbRef}
            className="absolute rounded-full opacity-30 animate-orbFloat"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(255, 218, 193, 0.3)' : 'rgba(111, 78, 55, 0.3)'})`,
              top: `${20 + i * 10}%`,
              left: `${i * 20}%`,
              filter: 'blur(40px)',
              animationDelay: `${i * 1}s`,
              animationDuration: `${60 + i * 5}s`,
            }}
          />
        ))}
      </div>

      {/* News Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 to-rose-600 text-white py-3 overflow-hidden shadow-md">
        <div className="animate-marquee whitespace-nowrap text-lg font-bold">
          <span className="mx-4">AlgoRemit: Redefining Global Payments with Speed and Savings</span>
          <span className="mx-4">Powered by Algorand Blockchain</span>
          <span className="mx-4">Secure, Transparent, and Scalable</span>
          <span className="mx-4">Join the Future of Remittances</span>
          <span className="mx-4">AlgoRemit: Redefining Global Payments with Speed and Savings</span>
          <span className="mx-4">Powered by Algorand Blockchain</span>
          <span className="mx-4">Secure, Transparent, and Scalable</span>
          <span className="mx-4">Join the Future of Remittances</span>
        </div>
      </div>

      {/* Navbar */}
      <header ref={navRef} className="fixed top-12 left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <HashLink smooth to="/#home" className="text-3xl font-bold text-amber-600 flex items-center">
            <span className="bg-gradient-to-r from-amber-600 to-rose-700 bg-clip-text text-transparent">AlgoRemit</span>
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full ml-2 animate-pulse"></span>
          </HashLink>

          <nav className="hidden md:flex space-x-8">
            {['Home', 'Why AlgoRemit', 'Demo', 'Simulations', 'Account', 'Contact'].map((item, index) => (
              <HashLink
                key={index}
                smooth
                to={item === 'Account' ? '/account' : `/#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-amber-600 transition-colors relative group font-medium"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
              </HashLink>
            ))}
          </nav>

          <button className="md:hidden text-gray-600 hover:text-amber-600 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden bg-white/95 px-6 py-4 flex flex-col space-y-4 shadow-lg rounded-b-2xl">
            {['Home', 'Why AlgoRemit', 'Demo', 'Simulations', 'Account', 'Contact'].map((item, index) => (
              <HashLink
                key={index}
                smooth
                to={item === 'Account' ? '/account' : `/#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-amber-600 transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </HashLink>
            ))}
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden min-h-screen">
        <div ref={heroRef} className="relative z-10 text-center max-w-5xl mx-auto">
          <h1
            ref={heroTitleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 bg-clip-text text-transparent opacity-0"
          >
            Send Money Globally, Instantly
          </h1>
          <p
            ref={heroSubtitleRef}
            className="text-xl md:text-2xl text-gray-600 mb-10 font-medium leading-relaxed max-w-3xl mx-auto opacity-0"
          >
            Powered by Algorand and USDCa, AlgoRemit delivers secure, near-zero fee transfers in seconds, connecting you to loved ones
            worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HashLink
              smooth
              to="/account"
              ref={heroButtonRef}
              className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-amber-600 to-rose-700 text-white hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group cursor-pointer opacity-0 text-lg inline-flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center">
                Explore Your Account <FaRocket className="ml-2" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </HashLink>
            <HashLink
              smooth
              to="/#demo"
              className="px-8 py-4 rounded-full font-bold bg-white text-amber-600 border-2 border-amber-600 hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-amber-400/20 relative overflow-hidden group cursor-pointer text-lg inline-flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center">Watch Demo</span>
            </HashLink>
          </div>
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-400/40 animate-particleFloat"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-6 bg-gradient-to-r from-amber-100/80 to-rose-100/80 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
          {[
            { value: '500+', label: 'Users Served', icon: <FiUsers size={32} /> },
            { value: '$0.001', label: 'Avg. Fee (vs $20+ Traditional)', icon: <FiDollarSign size={32} /> },
            { value: '4 sec', label: 'Settlement Time (vs 3-5 days)', icon: <FiClock size={32} /> },
          ].map((stat, index) => (
            <div
              key={index}
              ref={addToRefs}
              className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl border border-amber-100 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer opacity-0"
            >
              <div className="text-amber-600 mb-4 flex justify-center">{stat.icon}</div>
              <h3 className="text-4xl font-bold text-amber-700 mb-2">{stat.value}</h3>
              <p className="text-gray-600 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section id="why-algoremit" ref={problemSolutionRef} className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-16 tracking-tight">
            Why Choose <span className="bg-gradient-to-r from-amber-600 to-rose-700 bg-clip-text text-transparent">AlgoRemit</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div
              ref={problemCardRef}
              className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl border border-rose-100 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer opacity-0"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiAlertCircle className="text-rose-500" size={28} />
              </div>
              <h3 className="text-3xl font-semibold text-gray-800 mb-6">The Challenge</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Traditional remittances are plagued by high fees ($15-$30), slow processing (3-5 days), and multiple intermediaries, eroding
                trust and efficiency for migrant workers sending money home.
              </p>
            </div>
            <div
              ref={solutionCardRef}
              className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl border border-amber-100 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer opacity-0"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaRocket className="text-amber-600" size={28} />
              </div>
              <h3 className="text-3xl font-semibold text-gray-800 mb-6">Our Breakthrough</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                AlgoRemit harnesses Algorand and USDCa for instant transfers (4 seconds) with fees as low as $0.001, delivering secure,
                transparent, and scalable solutions directly to users worldwide.
              </p>
            </div>
          </div>
          <p className="text-gray-700 mt-12 text-xl font-medium flex items-center justify-center">
            Powered by <SiAlgorand className="text-black mx-2" size={24} />, scaling to billions with carbon-neutral technology.
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" ref={demoRef} className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div
          ref={demoCardRef}
          className="relative z-10 backdrop-blur-lg bg-white/90 p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-5xl mx-auto text-center border border-amber-200/50 cursor-pointer opacity-0"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 tracking-tight">
            Discover the{' '}
            <span className="bg-gradient-to-r from-amber-600 to-rose-700 bg-clip-text text-transparent">AlgoRemit Experience</span>
          </h2>
          <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl mx-auto">
            Explore our blockchain-powered platform to send ALGO, mint tokens, and create NFTs seamlessly on the Algorand TestNet.
          </p>
          <HashLink
            smooth
            to="/send"
            className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group cursor-pointer flex items-center mx-auto w-fit"
          >
            <span className="relative z-10 flex items-center">
              Try Sending & Minting Now <FaRocket className="ml-2" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </HashLink>
        </div>
      </section>

      {/* Simulations Section */}
      <section id="simulations" ref={simulationsRef} className="py-20 px-6 bg-gradient-to-r from-amber-100/80 to-rose-100/80">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 mb-12 text-center tracking-tight">
            Explore <span className="bg-gradient-to-r from-amber-600 to-rose-700 bg-clip-text text-transparent">Investor Simulations</span>
          </h2>
          <div className="grid grid-cols-1 gap-10">
            <div ref={addSimulationRef} className="cursor-pointer opacity-0">
              <CostComparison />
            </div>
            <div ref={addSimulationRef} className="cursor-pointer opacity-0">
              <MarketExpansion />
            </div>
            <div ref={addSimulationRef} className="cursor-pointer opacity-0">
              <ImpactChart />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" ref={footerRef} className="py-16 px-6 bg-gradient-to-br from-amber-600/5 to-rose-600/10 text-center opacity-0">
        <div className="max-w-6xl mx-auto">
          {/* 3D Footer Container */}
          <div className="bg-gradient-to-br from-white to-amber-50/80 rounded-2xl shadow-2xl p-10 border border-amber-200 transform perspective-1000">
            <div className="transform rotate-x-2">
              <h3 className="text-4xl font-bold text-gray-800 mb-6">Ready to Redefine Global Payments?</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already enjoying instant, low-cost global money transfers with AlgoRemit.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                <HashLink
                  to="/account"
                  className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group cursor-pointer inline-flex items-center"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started <FaRocket className="ml-2" />
                  </span>
                </HashLink>
                <a
                  href="mailto:ahad06074@gmail.com"
                  className="px-8 py-4 rounded-full font-bold bg-white text-amber-600 border-2 border-amber-600 hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-amber-400/20 inline-flex items-center"
                >
                  <FiMail className="mr-2" /> Contact Us
                </a>
              </div>

              <div className="mb-10">
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Partners & Integrations</h4>
                <div className="flex flex-wrap justify-center gap-8 text-3xl text-gray-600">
                  <SiAlgorand className="text-black hover:text-amber-600 transition-colors" title="Algorand" />
                  <SiVisa className="hover:text-amber-600 transition-colors" title="Visa" />
                  <SiMastercard className="hover:text-amber-600 transition-colors" title="Mastercard" />
                  <SiPaypal className="hover:text-amber-600 transition-colors" title="PayPal" />
                  <SiWesternunion className="hover:text-amber-600 transition-colors" title="Western Union" />
                  <SiCashapp className="hover:text-amber-600 transition-colors" title="Monese" />
                </div>
              </div>

              <div className="border-t border-amber-200 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-6 md:mb-0">
                    <HashLink smooth to="/#home" className="text-2xl font-bold text-amber-600 flex items-center">
                      <span className="bg-gradient-to-r from-amber-600 to-rose-700 bg-clip-text text-transparent">AlgoRemit</span>
                    </HashLink>
                  </div>

                  <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                      Terms
                    </a>
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                      Privacy
                    </a>
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                      Security
                    </a>
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                      Careers
                    </a>
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                      Press
                    </a>
                  </div>

                  <div className="flex gap-6 text-xl">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <FiTwitter />
                    </a>

                    <a
                      href="https://www.linkedin.com/in/abdulahad-zarinc/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <FiLinkedin />
                    </a>

                    <a
                      href="https://github.com/AbdulAHAD968"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <FiGithub />
                    </a>

                    <a
                      href="mailto:ahad06074@gmail.com"
                      aria-label="Email"
                      className="text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <FiMail />
                    </a>

                    <a
                      href="https://www.reddit.com/user/Emotional_Studio4126/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Reddit"
                      className="text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <FaReddit />
                    </a>
                  </div>
                </div>

                <p className="text-gray-500 mt-8">&copy; 2025 AlgoRemit. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes orbFloat {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(${Math.random() > 0.5 ? '150px' : '-150px'}, ${Math.random() > 0.5 ? '-100px' : '100px'})
              rotate(${Math.random() > 0.5 ? '360deg' : '-360deg'});
          }
        }
        .animate-orbFloat {
          animation: orbFloat infinite ease-in-out;
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-particleFloat {
          animation: particleFloat infinite ease-in-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1.2s ease-out forwards;
        }

        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .rotate-x-2 {
          transform: rotateX(2deg);
        }
      `}</style>
    </div>
  )
}

export default Home
