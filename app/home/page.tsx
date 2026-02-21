'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowDown, Shield, Zap, Globe, Cpu } from 'lucide-react'

export default function LuxuryHomePage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reveal animations on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'translate-y-10')
          }
        })
      },
      { threshold: 0.1 }
    )

    const hiddenElements = document.querySelectorAll('.reveal')
    hiddenElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-black text-white selection:bg-yellow-500/30 selection:text-yellow-200 hide-scrollbar"
      style={{
        scrollBehavior: 'smooth'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .glass {
          background: rgba(15, 15, 15, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }
        
        .gold-text {
          background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gold-border {
          position: relative;
          background: #000;
          background-clip: padding-box;
          border: 1px solid transparent;
        }
        .gold-border::before {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          z-index: -1;
          margin: -1px;
          border-radius: inherit;
          background: linear-gradient(to right, #BF953F, #FCF6BA, #AA771C);
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(212, 175, 55, 0) 0%,
            rgba(212, 175, 55, 0.2) 50%,
            rgba(212, 175, 55, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .reveal {
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bg-grid-gold {
          background-image: 
            linear-gradient(rgba(212, 175, 55, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}} />

      {/* Hero Section */}
      <section className="relative h-screen w-full snap-start flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center brightness-50 scale-105"
          style={{ backgroundImage: 'url("/bg-gold.png")' }}
        />
        <div className="absolute inset-0 z-1 w-full h-full bg-gradient-to-b from-black/80 via-transparent to-black" />
        <div className="absolute inset-0 bg-grid-gold opacity-30" />

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full" />

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <div className="reveal opacity-0 translate-y-10 flex items-center justify-center gap-4 mb-8">
             <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-yellow-500/50" />
             <span className="text-yellow-500 uppercase tracking-[0.5em] text-[10px] md:text-xs font-bold">The Sovereignty of Stability</span>
             <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-yellow-500/50" />
          </div>
          
          <h1 className="reveal opacity-0 translate-y-10 delay-100 text-7xl md:text-[11rem] font-black mb-8 tracking-tighter gold-text leading-none italic">
            AURUM
          </h1>
          
          <p className="reveal opacity-0 translate-y-10 delay-200 text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-16 leading-relaxed font-light">
            Elegance meets industrial power. Secure your grid with the world's most sophisticated AI resonance engine.
          </p>

          <div className="reveal opacity-0 translate-y-10 delay-300 flex flex-col items-center gap-12">
            <Link href="/" className="gold-border px-16 py-6 rounded-full text-xs font-black tracking-[0.3em] uppercase hover:scale-110 transition-all duration-500 group overflow-hidden block">
               <span className="relative z-10">Ascend to Control</span>
               <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <div className="animate-bounce mt-8 cursor-pointer group" onClick={() => containerRef.current?.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
              <ArrowDown className="text-yellow-500/40 w-8 h-8 group-hover:text-yellow-500 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="relative min-h-screen w-full snap-start flex flex-col items-center justify-center bg-[#020202] overflow-hidden py-24 px-8 md:px-24">
        <div className="absolute inset-0 bg-grid-gold opacity-10" />
        
        {/* Section Header */}
        <div className="reveal opacity-0 translate-y-10 text-center mb-20 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gold-text italic tracking-tighter">Unrivaled Capabilities</h2>
          <p className="text-zinc-500 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Experience the next generation of grid management with our core suite of advanced features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-7xl relative z-10">
          {[
            { icon: <Shield />, title: 'Total Security', desc: 'Industry-leading protection for your infrastructure. We keep your assets safe from all modern threats.' },
            { icon: <Zap />, title: 'Smart Prediction', desc: 'Intelligent AI that identifies problems before they happen, ensuring your grid stays online.' },
            { icon: <Globe />, title: 'Global Control', desc: 'Manage your entire power network from a single dashboard with total visibility and ease.' }
          ].map((feature, idx) => (
            <div 
              key={idx}
              className={`reveal opacity-0 translate-y-10 glass p-16 rounded-[3rem] flex flex-col gap-8 hover:bg-zinc-900/40 transition-all duration-700 group border-t-yellow-500/30 overflow-hidden relative`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full group-hover:bg-yellow-500/10 transition-all duration-700" />
              <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-125 group-hover:bg-yellow-500/20 transition-all duration-700">
                {React.cloneElement(feature.icon as React.ReactElement, { size: 40, strokeWidth: 1 })}
              </div>
              <h3 className="text-3xl font-bold text-white group-hover:gold-text transition-all duration-500">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-light text-lg">{feature.desc}</p>
              <div className="h-[2px] w-0 bg-yellow-500/50 group-hover:w-full transition-all duration-1000" />
            </div>
          ))}
        </div>
      </section>

      {/* Narrative Section */}
      <section className="relative min-h-screen w-full snap-start flex items-center justify-center bg-black px-8">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-900/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center max-w-7xl">
           <div className="reveal opacity-0 translate-y-10">
              <span className="text-yellow-500 font-black tracking-widest text-xs uppercase mb-6 block">Visual Intelligence</span>
              <h2 className="text-6xl md:text-[6rem] font-bold mb-10 gold-text leading-[0.9] tracking-tighter italic">Harmonized<br/>Feedback</h2>
              <p className="text-zinc-400 text-xl font-light leading-relaxed mb-12 max-w-xl">
                Experience the beauty of perfection. Our interface provides more than data—it provides clarity. Witness your grid reach a state of absolute equilibrium.
              </p>
              <div className="flex flex-wrap gap-6">
                 <div className="glass px-8 py-5 rounded-2xl flex items-center gap-4 group">
                    <Cpu className="text-yellow-500 group-hover:rotate-90 transition-transform duration-500" />
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-tighter">Monitoring</div>
                      <div className="text-lg font-bold">Real-time Map</div>
                    </div>
                 </div>
                 <div className="glass px-8 py-5 rounded-2xl flex items-center gap-4 group">
                    <Sparkles className="text-yellow-500 group-hover:scale-125 transition-transform duration-500" />
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-tighter">Intelligence</div>
                      <div className="text-lg font-bold">Cascade Prevention</div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="reveal opacity-0 translate-y-20 delay-300 relative">
              <div className="w-full aspect-square glass rounded-[4rem] flex items-center justify-center relative group overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-1000" style={{ backgroundImage: 'url("/gold-map.png")' }} />
                 <div className="absolute inset-0 bg-grid-gold opacity-10 group-hover:opacity-20 transition-opacity" />
                 <div className="absolute inset-8 rounded-full border-[0.5px] border-yellow-500/20 animate-[spin_30s_linear_infinite]" />
                 <div className="absolute inset-16 rounded-full border-[0.5px] border-yellow-500/10 animate-[spin_15s_linear_infinite_reverse]" />
                 <div className="w-80 h-80 rounded-full bg-yellow-500/5 blur-[120px] animate-pulse" />
                 <div className="text-yellow-500 z-10 relative">
                    <Globe size={240} strokeWidth={0.2} className="opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative h-screen w-full snap-start flex flex-col items-center justify-center bg-[#020202] py-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-yellow-600/5 blur-[180px] rounded-full pointer-events-none" />
        
        <div className="reveal opacity-0 translate-y-10 text-center relative z-10 px-8">
           <h2 className="text-7xl md:text-[12rem] font-black mb-16 gold-text tracking-tighter leading-none italic">AURUM</h2>
           <p className="text-yellow-500/60 tracking-[0.8em] font-light text-sm mb-20 uppercase">Legacy in the making</p>
           
           
           <div className="mt-32 text-zinc-700 text-[10px] tracking-[0.5em] font-bold uppercase">
              © 2026 AURUM SYSTEMS • PRIVACY • PROTOCOL • SECURITY
           </div>
        </div>
      </section>
    </div>
  )
}
