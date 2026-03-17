'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faShieldHalved, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';


type Feature = {
  title: string;
  desc: string;
  icon: IconDefinition;
};

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!parallaxRef.current) return;
      const x = (e.clientX / window.innerWidth) * 40;
      const y = (e.clientY / window.innerHeight) * 40;
      parallaxRef.current.style.backgroundPosition = `${x}% ${y}%`;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

    const features: Feature[] = [
    {
      title: "Matukio ya Kanisa",
      desc: "Panga ibada, mikutano na sherehe maalum kwa kalenda ya kidigitali na inayoonekana kwa wote.",
      icon: faCalendarDays,
    },
    {
      title: "Mifumo ya Kundi",
      desc: "Weka viongozi wa vikundi na ufuatilie taarifa zao kwa usahihi.",
      icon: faShieldHalved,
    },
    {
      title: "Dashboard ya Viongozi",
      desc: "Mchungaji, katibu au mhasibu kila mmoja anaona dashboard yake yenye taarifa anazohitaji.",
      icon: faChartLine,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#130728] via-[#211a45] to-[#253266] relative text-white overflow-x-hidden font-sans">
      {/* Glowing, moving blurred parallax background */}
      <div
        ref={parallaxRef}
        className="fixed inset-0 -z-10 bg-[url('/portal-bg-blur.jpg')] bg-cover bg-no-repeat opacity-40 transition-all duration-300"
        style={{ backgroundPosition: '50% 50%' }}
      />
      {/* Decorative blurred circle overlays */}
      <div className="fixed top-[-150px] left-[-150px] w-[350px] h-[350px] rounded-full bg-pink-400 opacity-30 blur-3xl -z-10"></div>
      <div className="fixed bottom-[-120px] right-[-100px] w-[270px] h-[270px] rounded-full bg-yellow-400 opacity-20 blur-2xl -z-10"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-8">
          <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white drop-shadow-xl">
            <Image
              src="/KANISASOFT1.png"
              alt=""
              width={198}
              height={198}
              className="rounded-xl shadow-xl"
              priority
            />
          </div>
          <nav className="hidden md:flex gap-10 font-semibold text-white/90 text-lg">
            <Link href="#features" className="hover:text-pink-300 transition">Kuhusu</Link>
            <Link href="#events" className="hover:text-yellow-300 transition">Habari mpya</Link>
            <Link href="#contact" className="hover:text-green-300 transition">Mawasiliano</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-[#f0ce32] text-black font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all"
            >
              Ingia
            </Link>
            <button className="ml-3 flex md:hidden" onClick={() => setNavOpen(!navOpen)}>
              <span className="w-7 h-7 bg-white/80 rounded-full flex flex-col items-center justify-center shadow">
                <span className="w-4 h-0.5 bg-purple-600 mb-1 block rounded"></span>
                <span className="w-4 h-0.5 bg-pink-500 mt-1 block rounded"></span>
              </span>
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: navOpen ? 'auto' : 0 }}
          className="overflow-hidden bg-gradient-to-br from-[#1a1338] via-[#171b2f] to-[#381928] md:hidden"
        >
          <div className="flex flex-col gap-6 p-8 text-lg font-semibold">
            <Link href="#features" onClick={() => setNavOpen(false)}>Kuhusu</Link>
            <Link href="#events" onClick={() => setNavOpen(false)}>Habari mpya</Link>
            <Link href="#contact" onClick={() => setNavOpen(false)}>Mawasiliano</Link>
          </div>
        </motion.div>
      </header>

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-15 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-5 tracking-tight text-white drop-shadow-2xl">
            KanisaSoft – Inua kanisa lako kidigitali
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg md:text-2xl text-white/80 font-medium">
            <span className="text-[#f0ce32] font-bold">Rahisi, Kisasa na Salama</span>
            <br />
            Simamia taarifa za washirika, wageni, matukio na hata fedha kwa ufanisi kupitia KanisaSoft. Mfumo bora wa usimamizi kwa makanisa ya kisasa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="text-base px-6 py-3 sm:text-lg sm:px-9 sm:py-4 rounded-full bg-[#f0ce32] text-black font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Jisajili hapa
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-base px-6 py-3 sm:text-lg sm:px-8 sm:py-4 rounded-full bg-white/10 border border-white/10 text-white font-semibold shadow hover:bg-pink-500/20 hover:shadow-xl transition"
            >
              Fahamu zaidi
            </button>
          </div>
        </motion.div>
      </section>
      

 {/* FEATURES SECTION */}
      <section
        id="features"
        className="bg-gradient-to-br from-[#2d2646] to-[#232143] py-16 px-6 md:px-10"
      >
        <div className="max-w-6xl mx-auto">

          {/* CHURCH LEADERS */}
          <h2 className="text-4xl font-extrabold text-center mb-14 text-[#f0ce32] drop-shadow-lg">
            Viongozi wa Kanisa
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mb-20">
            {[
              { name: "Oscar B. Kindole", title: "Mchungaji Kiongozi", image: "/images/leaders/oscar.png" },
              { name: "Wencenslaus Fungamtama", title: "Katibu wa Kanisa", image: "/images/leaders/wencenslaus.png" },
              { name: "Reuben Bulugu", title: "Mzee wa Kanisa Kiongozi", image: "/images/leaders/reuben.png" },
            ].map((leader, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="rounded-3xl p-8 bg-white/10 backdrop-blur-lg border border-white/10 shadow-xl text-center flex flex-col items-center"
              >
                <Image
                  src={leader.image}
                  width={96}
                  height={96}
                  alt={leader.name}
                  className="rounded-full object-cover mb-5 border-4 border-[#f0ce32]"
                />
                <h3 className="text-xl font-bold text-[#f0ce32] mb-2">{leader.name}</h3>
                <p className="text-white/80">{leader.title}</p>
              </motion.div>
            ))}
          </div>

          {/* FEATURES */}
          <h2 className="text-4xl font-extrabold text-center mb-14 text-[#f0ce32] drop-shadow-lg">
            Kwanini utumie KanisaSoft?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="rounded-3xl p-8 bg-white/10 backdrop-blur-lg border border-white/10 shadow-xl text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-5 shadow-lg">
                  <FontAwesomeIcon icon={feature.icon} className="text-3xl text-[#2d2646]" />
                </div>
                <h3 className="text-xl font-bold text-[#f0ce32] mb-3">{feature.title}</h3>
                <p className="text-white/80 text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* MATUKIO YA KANISA */}
      <section id="events" className="py-15 px-4 md:px-10 bg-gradient-to-br from-[#24255a] to-[#161a36]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#f0ce32] text-center mb-16 tracking-tight drop-shadow-lg">
            Fahamu zaidi kuhusu KanisaSoft
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Kadi 1: Kongamano la Vijana */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-3xl glass-card shadow-2xl border border-yellow-200/10 bg-white/10 p-6 md:p-8 flex flex-col items-center text-center hover:scale-105 hover:shadow-yellow-300/40 transition-all duration-300"
            >
              <Image
                src="/event1.png"
                width={340}
                height={220}
                alt="Kongamano la Vijana"
                className="rounded-xl shadow-xl mb-6"
              />
              <h3 className="text-2xl font-bold mb-2 text-[#f0ce32]">Wasiliana kwa Haraka. Wafikie Wote.</h3>
              <span className="mb-2 text-pink-200 font-semibold">Julai 26, 2024 • KanisaSoft</span>
              <p className="text-white/80 text-base">
              Kwa kutumia KanisaSoft, unaweza kutuma ujumbe mfupi (SMS) kwa washirika wako kwa wakati mmoja.
              </p>
            </motion.div>

            {/* Kadi 2: Ibada za Wiki */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              viewport={{ once: true }}
              className="rounded-3xl glass-card shadow-2xl border border-yellow-200/10 bg-white/10 p-6 md:p-8 flex flex-col items-center text-center hover:scale-105 hover:shadow-yellow-300/40 transition-all duration-300"
            >
              <Image
                src="/event2.png"
                width={340}
                height={220}
                alt="Ibada za Kati ya Wiki"
                className="rounded-xl shadow-xl mb-6"
              />
              <h3 className="text-2xl font-bold mb-2 text-[#f0ce32]">Kanisa Lenye Mpangilio Linaanzia na Taarifa Sahihi.</h3>
              <span className="mb-2 text-green-200 font-semibold">January 12, 2025 • KanisaSoft</span>
              <p className="text-white/80 text-base">
              KanisaSoft hukuwezesha kuhifadhi taarifa za washirika kwa usalama na kwa mpangilio bora.
              </p>
            </motion.div>

            {/* Kadi 3: Harusi na Sherehe Maalum */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24 }}
              viewport={{ once: true }}
              className="rounded-3xl glass-card shadow-2xl border border-yellow-200/10 bg-white/10 p-6 md:p-8 flex flex-col items-center text-center hover:scale-105 hover:shadow-yellow-300/40 transition-all duration-300"
            >
              <Image
                src="/event3.png"
                width={340}
                height={220}
                alt="Harusi ya Kanisani"
                className="rounded-xl shadow-xl mb-6"
              />
              <h3 className="text-2xl font-bold mb-2 text-[#f0ce32]">Huduma za Kanisa Bila Mipaka</h3>
              <span className="mb-2 text-blue-200 font-semibold">Agosti 11, 2025 • KanisaSoft</span>
              <p className="text-white/80 text-base">
              Iwe uko ofisini, nyumbani au njiani—unaweza kuingia kwenye KanisaSoft kupitia kompyuta au simu yenye intaneti.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-8 px-6 bg-gradient-to-br from-[#151520] via-[#232143] to-[#2d2646]">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold mb-5 text-[#f0ce32]">
            Tupo Tayari Kukusaidia!
          </h2>
          <p className="mb-6 text-lg text-white/80">
            Wasiliana na timu yetu kwa ajili ya majaribio ya mfumo, ushirikiano, au kuanza kutumia huduma zetu:
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
            <a
              href="mailto:support@kanisasoft.co.tz"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/10 text-white font-bold shadow hover:bg-pink-500/20 transition text-lg"
            >
              support@kanisasoft.co.tz
            </a>
            <a
              href="tel:+255712104508"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/10 text-white font-bold shadow hover:bg-green-400/20 transition text-lg"
            >
              +255 712 104 508
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-[#0e0518] via-[#1a1956] to-[#1c2746] py-10 text-white/70 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-6">
          
          {/* Left: Copyright */}
          <div className="text-center md:text-left">
            &copy; {new Date().getFullYear()} 
            <span className="text-[#f0ce32] font-bold"> KanisaSoft </span> · 
            <span className="text-pink-300"> Rahisi, Kisasa na Salama</span>
          </div>

        {/* Right: Social Icons */}
        <div className="flex gap-5 text-xl">
          <a href="https://facebook.com/kanisasoft" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <Image src="/facebook.svg" alt="Facebook" width={24} height={24} className="filter invert" />
          </a>
          <a href="https://instagram.com/kanisasoft" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <Image src="/instagram.svg" alt="Instagram" width={24} height={24} className="filter invert" />
          </a>
          <a href="https://tiktok.com/kanisasoft" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <Image src="/tiktok.svg" alt="TikTok" width={24} height={24} className="filter invert" />
          </a>
          <a href="https://linkedin.com/kanisasoft" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <Image src="/linkedin.svg" alt="LinkedIn" width={24} height={24} className="filter invert" />
          </a>
          <a href="https://wa.me/255712104508" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <Image src="/whatsapp.svg" alt="WhatsApp" width={24} height={24} className="filter invert" />
          </a>
          <a href="mailto:support@kanisasoft.co.tz" className="hover:opacity-80 transition">
            <Image src="/email.svg" alt="Email" width={24} height={24} className="filter invert" />
          </a>
        </div>

        </div>
      </footer>

      <style jsx global>{`
        .glass-card {
          backdrop-filter: blur(18px) saturate(160%);
          box-shadow: 0 12px 48px 0 #00000044;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
