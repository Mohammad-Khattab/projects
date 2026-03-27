'use client';

import React, { useState, useEffect } from 'react';
import {
  Coffee, Leaf, UtensilsCrossed, Sun, Flame, Droplets,
  MapPin, Clock, AtSign, ShoppingBag, ChevronDown,
  Menu as MenuIcon, X,
} from 'lucide-react';

/* ── Contact ─────────────────────────────────────────────── */
const TALABAT_HREF = 'https://www.talabat.com/jordan/restaurant/740221/zghairon-cafe-al-rjoum';
const IG_HREF      = 'https://www.instagram.com/zghairon_cafe/';
const PHONE        = '+962 7 9777 3388';

/* ── Slideshow ───────────────────────────────────────────── */
const SLIDES = [
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/08/c0/4d/it-s-not-a-place-to-visit.jpg', pos: 'center 30%' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/08/c0/52/it-s-not-a-place-to-visit.jpg', pos: 'center center' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/08/c0/4e/it-s-not-a-place-to-visit.jpg', pos: 'center 40%' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/08/c0/51/it-s-not-a-place-to-visit.jpg', pos: 'center 55%' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/08/c2/3f/amazing-place-to-visit.jpg',   pos: 'center center' },
];

/* ── Menu data (bilingual, kept as-is) ──────────────────── */
const MENU_DATA = [
  {
    category: 'Hot Drinks', arabic: 'مشروبات ساخنة', Icon: Coffee,
    accent: '#8B5E3C', tint: 'rgba(139,94,60,.07)',
    items: [
      { name: 'Arabic Coffee',   arabic: 'قهوة عربية',  desc: 'Cardamom-spiced, served with dates',               price: '1.500' },
      { name: 'Turkish Coffee',  arabic: 'قهوة تركية',  desc: 'Dark roast · your choice of sweetness',            price: '1.500' },
      { name: 'Espresso',                                desc: 'Single or double shot',                            price: '2.000' },
      { name: 'Americano',                               desc: 'Espresso with hot water',                          price: '2.000' },
      { name: 'Cappuccino',                              desc: 'Espresso · steamed milk · foam',                   price: '2.500' },
      { name: 'Latte',                                   desc: 'Espresso with velvety steamed milk',               price: '2.500' },
      { name: 'Karak Tea',       arabic: 'شاي كرك',     desc: 'Spiced milk tea, strong and sweet',                price: '1.500' },
      { name: 'Mint Tea',        arabic: 'شاي نعنع',    desc: 'Fresh mint leaves · black tea base',               price: '1.500' },
      { name: 'Herbal Tea',      arabic: 'شاي أعشاب',   desc: 'Chamomile, hibiscus, or sage — your pick',         price: '2.000' },
      { name: 'Sahlab',          arabic: 'سحلب',         desc: 'Warm milk · orchid starch · cinnamon · coconut',  price: '2.500' },
    ],
  },
  {
    category: 'Cold Drinks', arabic: 'مشروبات باردة', Icon: Droplets,
    accent: '#4A6741', tint: 'rgba(74,103,65,.07)',
    items: [
      { name: 'Iced Latte',         desc: 'Espresso over ice with milk',               price: '3.000' },
      { name: 'Cold Brew',          desc: '18h slow-steep · hint of cardamom',         price: '3.000' },
      { name: 'Fresh Lemonade',     arabic: 'ليموناضة',     desc: 'Squeezed lemon · mint · honey',   price: '2.500' },
      { name: 'Tamarind',           arabic: 'تمرهندي',       desc: 'House-made · sweet and tangy',    price: '2.000' },
      { name: 'Jallab',             arabic: 'جلاب',           desc: 'Rose water · grape juice · pine nuts', price: '2.000' },
      { name: 'Carob Juice',        arabic: 'عصير خروب',     desc: 'Traditional Levantine · served cold', price: '2.000' },
      { name: 'Fresh Orange Juice', arabic: 'عصير برتقال',   desc: 'Squeezed to order',               price: '2.500' },
    ],
  },
  {
    category: 'Breakfast', arabic: 'فطور', Icon: Sun,
    accent: '#B5891A', tint: 'rgba(181,137,26,.07)',
    items: [
      { name: 'Labneh Plate',   arabic: 'لبنة',       desc: 'Strained yogurt · olive oil · zaatar · olives', price: '3.000' },
      { name: 'Hummus',         arabic: 'حمص',         desc: 'Stone-ground · warm olive oil · paprika',       price: '3.000' },
      { name: 'Foul Mudammas',  arabic: 'فول مدمس',    desc: 'Stewed fava beans · lemon · cumin · herbs',     price: '2.500' },
      { name: 'Eggs & Zaatar',  arabic: 'بيض وزعتر',   desc: 'Fried eggs · wild zaatar butter · bread',       price: '3.500' },
      { name: 'Full Breakfast', arabic: 'فطور كامل',   desc: 'Labneh · hummus · eggs · olives · bread · tea', price: '5.500' },
    ],
  },
  {
    category: 'Bites', arabic: 'وجبات خفيفة', Icon: UtensilsCrossed,
    accent: '#6B4226', tint: 'rgba(107,66,38,.07)',
    items: [
      { name: 'Zaatar Manakish', arabic: 'مناقيش زعتر', desc: 'Freshly baked flatbread · wild zaatar',       price: '2.000' },
      { name: 'Cheese Manakish', arabic: 'مناقيش جبنة', desc: 'Akkawi cheese · nigella seeds',               price: '2.500' },
      { name: 'Halloumi Toast',                          desc: 'Sourdough · grilled halloumi · tomato jam',   price: '3.750' },
      { name: 'Chicken Wrap',    arabic: 'لفة دجاج',    desc: 'Grilled chicken · garlic sauce · pickles',    price: '4.000' },
      { name: 'Mixed Meze',      arabic: 'مزة مشكلة',   desc: 'Hummus · labneh · olives · veggies · pita',  price: '5.000' },
    ],
  },
  {
    category: 'Sweets', arabic: 'حلويات', Icon: Flame,
    accent: '#9B3510', tint: 'rgba(155,53,16,.07)',
    items: [
      { name: 'Chocolate Cake', desc: 'Dense fudge cake · dark chocolate ganache',             price: '2.500' },
      { name: 'Cheesecake',     desc: 'Creamy NY style · seasonal fruit compote',              price: '3.000' },
      { name: 'Knafeh',         arabic: 'كنافة',  desc: 'Shredded pastry · sweet cheese · orange blossom', price: '2.000' },
      { name: 'Um Ali',         arabic: 'أم علي', desc: 'Egyptian bread pudding · cream · mixed nuts',     price: '3.000' },
      { name: 'Baklava',        arabic: 'بقلاوة', desc: 'Filo · pistachios · rose water syrup · 3 pcs',   price: '1.500' },
    ],
  },
];

/* ── Translations ────────────────────────────────────────── */
type Lang = 'en' | 'ar';
const T = {
  en: {
    langBtn: 'ع',
    nav: { about: 'About', menu: 'Menu', visit: 'Visit', wa: 'Talabat', order: 'Order on Talabat' },
    hero: {
      eyebrow: 'Downtown Amman · Al-Balad',
      sub: 'Your cozy escape in Downtown Amman.',
      subsub: 'Art · Coffee · Balad views.',
      cta1: 'View Menu', cta2: 'Order on Talabat', scroll: 'Scroll',
    },
    about: {
      eyebrow: 'Our Story',
      h: ['A small café', 'with a big ', 'soul.'],
      p1: "Tucked behind a green door at the al-Khalha stairs of Downtown Amman, Zghairon feels less like a café and more like someone's warmly curated living room — orange velvet sofas, mosaic tiled floors, a chandelier overhead, and gallery walls filled with Jordanian memory.",
      p2: "We pour Arabic coffee with cardamom and dates, brew espresso from local roasters, and bake everything in-house. Come to read, to talk, to sit with your thoughts. There's no rush here.",
      stats: [['Art on the Walls','Rotating shows'],['Local Roasts','Sourced weekly'],['Three Stories','Ground to rooftop']],
    },
    menu: { eyebrow: 'What We Serve', heading: 'The Menu', priceNote: 'All prices in JOD' },
    footer: {
      desc: 'Specialty coffee, local art, and three stories of warmth in the heart of Al-Balad.',
      visitLabel: 'Visit Us',
      address: ['Al-Khalha Stairs, Downtown', 'Amman, Jordan'],
      hours: 'Daily · 9:30 AM – 12:00 AM',
      followLabel: 'Follow',
      orderLabel: 'Order Now',
      orderBtn: 'Order on Talabat',
      replyNote: 'Fast delivery · Powered by Talabat',
    },
  },
  ar: {
    langBtn: 'EN',
    nav: { about: 'عن المكان', menu: 'المنيو', visit: 'تواصل', wa: 'طلبات', order: 'اطلب عبر طلبات' },
    hero: {
      eyebrow: 'وسط البلد · عمّان',
      sub: 'ملجأك الدافئ في قلب وسط البلد.',
      subsub: 'فن · قهوة · إطلالة البلد.',
      cta1: 'اعرض المنيو', cta2: 'اطلب عبر طلبات', scroll: 'تمرير',
    },
    about: {
      eyebrow: 'قصتنا',
      h: ['كافيه صغير', 'بروح ', 'كبيرة.'],
      p1: 'مختبئ خلف باب أخضر على درج الخلّة في قلب وسط البلد، صغيرون أشبه بغرفة معيشة دافئة منه بكافيه — أرائك مخملية برتقالية، أرضيات فسيفسائية، ثريا معلّقة، وجدران مليئة بذاكرة أردنية.',
      p2: 'نقدّم القهوة العربية بالهيل والتمر، نحمّص القهوة من محمّصات أردنية محلية، ونخبز كل شيء بأيدينا. تعال للقراءة، للحديث، للجلوس مع أفكارك. لا عجلة هنا.',
      stats: [['فن على الجدران','معارض متجددة'],['تحميص محلي','يصل أسبوعياً'],['ثلاثة طوابق','من الأرض للسطح']],
    },
    menu: { eyebrow: 'ماذا نقدّم', heading: 'المنيو', priceNote: 'الأسعار بالدينار الأردني' },
    footer: {
      desc: 'قهوة مختصّة، فن محلي، وثلاثة طوابق من الدفء في قلب البلد.',
      visitLabel: 'زورونا',
      address: ['درج الخلّة، وسط البلد', 'عمّان، الأردن'],
      hours: 'يومياً · ٩:٣٠ ص – ١٢ م',
      followLabel: 'تابعونا',
      orderLabel: 'اطلب الآن',
      orderBtn: 'اطلب عبر طلبات',
      replyNote: 'توصيل سريع · بالتعاون مع طلبات',
    },
  },
};

/* ── CSS ─────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Cairo:wght@300;400;500;600;700&display=swap');

.zc{font-family:'DM Sans',sans-serif;background:#F5ECD7;color:#2C1810;-webkit-font-smoothing:antialiased;}
.zc*,.zc*::before,.zc*::after{box-sizing:border-box;}
.zc a{text-decoration:none;color:inherit;}
.zc-d{font-family:'Cormorant Garamond',serif;}

/* Arabic overrides */
.zc[dir="rtl"]{font-family:'Cairo',sans-serif;}
.zc[dir="rtl"] .zc-d{font-family:'Cairo',sans-serif;font-style:normal;}
.zc[dir="rtl"] .zc-logo-name{font-family:'Cairo',sans-serif;font-style:normal;font-size:1.2rem;}
.zc[dir="rtl"] .zc-divider{background:linear-gradient(270deg,#C1440E,#E8845A 70%,transparent);}
.zc[dir="rtl"] .zc-mob-close{right:auto;left:22px;}
.zc[dir="rtl"] .zc-item-arabic{margin-left:0;margin-right:5px;}

/* grain */
.zc-grain{position:fixed;inset:0;z-index:9999;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.80' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity:.04;}

/* ── hero ── */
.zc-hero{min-height:100svh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:#1A0A05;}
.zc-slide{position:absolute;inset:0;background-size:cover;opacity:0;transition:opacity 1.6s ease;}
.zc-slide.active{opacity:1;animation:zc-ken 7s ease-out forwards;}
@keyframes zc-ken{from{transform:scale(1.07) translate(1%,.5%);}to{transform:scale(1.0) translate(0%,0%);}}
.zc-hero-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(to bottom,rgba(12,5,2,.65) 0%,rgba(12,5,2,.35) 35%,rgba(12,5,2,.40) 65%,rgba(12,5,2,.75) 100%);}
.zc-dots{position:absolute;bottom:80px;left:50%;transform:translateX(-50%);z-index:5;display:flex;gap:8px;}
.zc-dot{width:6px;height:6px;border-radius:50%;background:rgba(245,236,215,.3);cursor:pointer;transition:all .3s ease;border:none;padding:0;}
.zc-dot.active{background:#E8845A;width:20px;border-radius:3px;}

/* ── nav ── */
.zc-nav{position:fixed;top:0;left:0;right:0;z-index:200;transition:background .35s ease,border-color .35s ease;}
.zc-nav.at-top{background:rgba(18,7,4,.5);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(193,68,14,.12);}
.zc-nav.scrolled{background:rgba(245,236,215,.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(139,94,60,.18);}
.zc-nav-inner{max-width:1100px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;}
.zc-logo-btn{background:none;border:none;cursor:pointer;display:flex;align-items:baseline;gap:6px;padding:0;}
.zc-logo-name{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;font-style:italic;letter-spacing:-.01em;line-height:1;transition:color .3s;}
.zc-logo-sub{font-size:.58rem;font-weight:500;letter-spacing:.2em;text-transform:uppercase;transition:color .3s;}
.zc-nav-links{display:flex;align-items:center;gap:24px;}
.zc-nav-link{background:none;border:none;cursor:pointer;font-family:inherit;font-size:.7rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:4px 0;transition:opacity .2s;}
.zc-nav-link:hover{opacity:.5;}
.zc-hamburger{background:none;border:none;cursor:pointer;padding:4px;display:none;}
@media(max-width:767px){.zc-nav-links{display:none!important;}.zc-hamburger{display:block!important;}}

/* language toggle */
.zc-lang{
  display:inline-flex;align-items:center;justify-content:center;
  width:34px;height:34px;border-radius:50%;
  font-size:.72rem;font-weight:700;cursor:pointer;
  transition:all .25s ease;border:1.5px solid;
  font-family:'Cairo',sans-serif;letter-spacing:0;
}
.zc-lang.on-hero{border-color:rgba(245,236,215,.5);color:#F5ECD7;background:rgba(245,236,215,.08);}
.zc-lang.on-hero:hover{background:rgba(245,236,215,.2);border-color:#F5ECD7;}
.zc-lang.on-scroll{border-color:rgba(193,68,14,.4);color:#C1440E;background:rgba(193,68,14,.06);}
.zc-lang.on-scroll:hover{background:rgba(193,68,14,.14);border-color:#C1440E;}

/* ── mobile overlay ── */
.zc-mob-menu{position:fixed;inset:0;z-index:190;background:rgba(14,5,2,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;transform:translateX(100%);transition:transform .38s cubic-bezier(.22,1,.36,1);}
.zc-mob-menu.open{transform:translateX(0);}
.zc-mob-close{position:absolute;top:20px;right:22px;background:none;border:none;cursor:pointer;color:#F5ECD7;}
.zc-mob-link{background:none;border:none;cursor:pointer;font-family:'Cormorant Garamond',serif;font-size:2.4rem;font-weight:500;font-style:italic;color:#F5ECD7;letter-spacing:.02em;transition:color .2s;}
.zc[dir="rtl"] .zc-mob-link{font-family:'Cairo',sans-serif;font-style:normal;font-size:2rem;}
.zc-mob-link:hover{color:#E8845A;}

/* ── buttons ── */
.zc-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 26px;border-radius:2px;cursor:pointer;font-family:inherit;font-size:.76rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;transition:all .28s ease;white-space:nowrap;}
.zc-terra{background:#C1440E;color:#F5ECD7;border:1.5px solid #C1440E;}
.zc-terra:hover{background:#A33A0C;border-color:#A33A0C;transform:translateY(-1px);box-shadow:0 5px 18px rgba(193,68,14,.35);}
.zc-ghost{background:rgba(255,107,0,.16);color:#fff;border:1.5px solid rgba(255,107,0,.65);}
.zc-ghost:hover{background:rgba(255,107,0,.3);border-color:#FF6B00;box-shadow:0 0 18px rgba(255,107,0,.22);}
.zc-talabat{background:#FF6B00;color:#fff;border:none;box-shadow:0 4px 20px rgba(255,107,0,.32);}
.zc-talabat:hover{background:#e05e00;transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,107,0,.45);}
.zc-btn-sm{padding:9px 18px;font-size:.69rem;}

/* ── divider ── */
.zc-divider{width:48px;height:1.5px;background:linear-gradient(90deg,#C1440E,#E8845A 70%,transparent);margin:12px 0 22px;}

/* ── about ── */
.zc-about{background:#EDE0C4;}
.zc-about-grid{display:grid;gap:56px;grid-template-columns:1fr;}
@media(min-width:768px){.zc-about-grid{grid-template-columns:5fr 7fr;gap:72px;align-items:center;}}
.zc-about-photo{border-radius:4px;overflow:hidden;position:relative;aspect-ratio:4/5;}
.zc-about-photo img{width:100%;height:100%;object-fit:cover;display:block;}

/* ── menu ── */
.zc-menu-section{background:#F5ECD7;}
.zc-tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:44px;}
.zc-tab{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:.72rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;border:1.5px solid rgba(139,94,60,.22);background:#FAF3E5;color:#5A3A25;transition:all .25s ease;}
.zc-tab:hover{border-color:#C1440E;color:#C1440E;}
.zc-tab.active{background:#C1440E;color:#F5ECD7;border-color:#C1440E;box-shadow:0 4px 16px rgba(193,68,14,.28);}
.zc-tab svg{opacity:.65;transition:opacity .2s;}
.zc-tab.active svg{opacity:1;}
.zc-panel{animation:zc-panel-in .35s ease forwards;}
@keyframes zc-panel-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.zc-items-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:480px){.zc-items-grid{grid-template-columns:repeat(2,1fr);}}
@media(min-width:768px){.zc-items-grid{grid-template-columns:repeat(3,1fr);}}
.zc-item{background:#FAF3E5;border:1px solid rgba(139,94,60,.13);border-radius:4px;padding:14px 16px;transition:transform .2s ease,box-shadow .22s ease;}
.zc-item:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(44,24,16,.1);}
.zc-item-name{font-size:.93rem;font-weight:500;color:#2C1810;line-height:1.3;}
.zc-item-arabic{font-size:.75rem;color:#8B5E3C;font-weight:400;margin-left:5px;font-family:'Cairo',serif;font-style:italic;}
.zc-item-desc{font-size:.74rem;color:#7A5040;line-height:1.55;font-weight:300;margin-top:5px;}
.zc-item-price{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;font-weight:600;white-space:nowrap;}

/* ── footer ── */
.zc-footer{background:#1E0E08;}
.zc-footer-grid{display:grid;grid-template-columns:1fr;gap:40px;}
@media(min-width:640px){.zc-footer-grid{grid-template-columns:repeat(2,1fr);}}
@media(min-width:1024px){.zc-footer-grid{grid-template-columns:2fr 1.2fr 1.1fr 1.5fr;gap:48px;}}

/* ── animations ── */
@keyframes zc-rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.zc-r {animation:zc-rise 1s ease forwards;}
.zc-r1{animation:zc-rise 1s .15s ease forwards;opacity:0;}
.zc-r2{animation:zc-rise 1s .32s ease forwards;opacity:0;}
.zc-r3{animation:zc-rise 1s .5s  ease forwards;opacity:0;}
.zc-r4{animation:zc-rise 1s .68s ease forwards;opacity:0;}
@keyframes zc-bob{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(8px);opacity:.9}}
.zc-bob{animation:zc-bob 2.4s ease-in-out infinite;}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#F5ECD7}
::-webkit-scrollbar-thumb{background:#C1440E;border-radius:3px}
`;

/* ── Component ───────────────────────────────────────────── */
export default function ZghaironCafe() {
  const [scrolled,  setScrolled]  = useState(false);
  const [mobOpen,   setMobOpen]   = useState(false);
  const [slide,     setSlide]     = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [lang,      setLang]      = useState<Lang>('en');

  const t = T[lang];
  const isAr = lang === 'ar';
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const goto = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobOpen(false);
  };

  const logoColor = scrolled ? '#C1440E' : '#F5ECD7';
  const subColor  = scrolled ? '#8B5E3C' : 'rgba(245,236,215,.42)';
  const linkColor = scrolled ? '#2C1810' : 'rgba(245,236,215,.82)';

  const LangBtn = ({ className }: { className: string }) => (
    <button className={`zc-lang ${className}`} onClick={toggleLang} aria-label="Switch language" title={isAr ? 'Switch to English' : 'التبديل للعربية'}>
      {t.langBtn}
    </button>
  );

  return (
    <div className="zc" dir={isAr ? 'rtl' : 'ltr'}>
      <style>{CSS}</style>
      <div className="zc-grain" aria-hidden="true" />

      {/* ── MOBILE MENU ── */}
      <div className={`zc-mob-menu ${mobOpen ? 'open' : ''}`} role="dialog">
        <button className="zc-mob-close" onClick={() => setMobOpen(false)}>
          <X size={26} />
        </button>
        {(['about','menu','visit'] as const).map(s => (
          <button key={s} className="zc-mob-link" onClick={() => goto(s)}>
            {t.nav[s]}
          </button>
        ))}
        <LangBtn className="on-hero" />
        <a href={TALABAT_HREF} target="_blank" rel="noopener noreferrer"
           className="zc-btn zc-talabat" style={{ marginTop: 8 }}>
          <ShoppingBag size={16} /> {t.nav.order}
        </a>
      </div>

      {/* ── NAV ── */}
      <nav className={`zc-nav ${scrolled ? 'scrolled' : 'at-top'}`}>
        <div className="zc-nav-inner">
          <button className="zc-logo-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="zc-logo-name" style={{ color: logoColor }}>
              {isAr ? 'صغيرون' : 'Zghairon'}
            </span>
            <span className="zc-logo-sub" style={{ color: subColor }}>
              {isAr ? 'كافيه' : 'Café'}
            </span>
          </button>

          <div className="zc-nav-links">
            {(['about','menu','visit'] as const).map(s => (
              <button key={s} className="zc-nav-link" onClick={() => goto(s)} style={{ color: linkColor }}>
                {t.nav[s]}
              </button>
            ))}
            <LangBtn className={scrolled ? 'on-scroll' : 'on-hero'} />
            <a href={TALABAT_HREF} target="_blank" rel="noopener noreferrer"
               className={`zc-btn zc-btn-sm ${scrolled ? 'zc-terra' : 'zc-ghost'}`}>
              <ShoppingBag size={13} /> {t.nav.wa}
            </a>
          </div>

          <button className="zc-hamburger" onClick={() => setMobOpen(true)}
                  style={{ color: scrolled ? '#2C1810' : '#F5ECD7' }}>
            <MenuIcon size={24} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="zc-hero" id="home">
        {SLIDES.map((s, i) => (
          <div key={i} className={`zc-slide ${i === slide ? 'active' : ''}`}
               style={{ backgroundImage: `url(${s.url})`, backgroundPosition: s.pos }} />
        ))}
        <div className="zc-hero-overlay" />

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'120px 24px 64px', position:'relative', zIndex:3 }}>
          <div className="zc-r" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <span style={{ width:28, height:1, background:'rgba(245,236,215,.3)' }} />
            <span style={{ fontSize:'.65rem', letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,236,215,.45)', fontWeight:500 }}>
              {t.hero.eyebrow}
            </span>
            <span style={{ width:28, height:1, background:'rgba(245,236,215,.3)' }} />
          </div>

          <h1 className="zc-d zc-r1" style={{ fontSize:'clamp(3.8rem,14vw,9.5rem)', fontWeight:300, color:'#F5ECD7', lineHeight:.94, letterSpacing:'-.025em', marginBottom:4 }}>
            {isAr ? 'صغيرون' : 'Zghairon'}
          </h1>
          <p className="zc-d zc-r1" style={{ fontSize:'clamp(3.8rem,14vw,9.5rem)', fontWeight:700, fontStyle: isAr ? 'normal' : 'italic', color:'#E8845A', lineHeight:1, letterSpacing:'-.028em', marginBottom:36 }}>
            {isAr ? 'كافيه' : 'Café'}
          </p>

          <p className="zc-r2" style={{ fontSize:'clamp(.95rem,2.2vw,1.15rem)', color:'rgba(245,236,215,.65)', maxWidth:440, lineHeight:1.8, marginBottom:52, fontWeight:300 }}>
            {t.hero.sub}
            <br />
            <span style={{ fontSize:'.82em', color:'rgba(245,236,215,.38)', fontStyle: isAr ? 'normal' : 'italic' }}>
              {t.hero.subsub}
            </span>
          </p>

          <div className="zc-r3" style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => goto('menu')} className="zc-btn zc-terra">
              <Coffee size={15} /> {t.hero.cta1}
            </button>
            <a href={TALABAT_HREF} target="_blank" rel="noopener noreferrer" className="zc-btn zc-ghost">
              <ShoppingBag size={15} /> {t.hero.cta2}
            </a>
          </div>
        </div>

        <div className="zc-dots" style={{ zIndex:3 }}>
          {SLIDES.map((_, i) => (
            <button key={i} className={`zc-dot ${i === slide ? 'active' : ''}`}
                    onClick={() => setSlide(i)} aria-label={`Slide ${i+1}`} />
          ))}
        </div>

        <div className="zc-r4" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, paddingBottom:20, zIndex:3, position:'relative' }}>
          <span style={{ fontSize:'.62rem', letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(245,236,215,.25)', fontWeight:500 }}>
            {t.hero.scroll}
          </span>
          <div className="zc-bob"><ChevronDown size={16} color="rgba(245,236,215,.28)" /></div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="zc-about" style={{ padding:'clamp(64px,8vw,120px) 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="zc-about-grid">
            <div className="zc-about-photo">
              <img
                src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/08/c0/4d/it-s-not-a-place-to-visit.jpg"
                alt="Zghairon Café interior"
                loading="lazy"
              />
            </div>

            <div>
              <span style={{ fontSize:'.67rem', letterSpacing:'.2em', textTransform:'uppercase', color:'#8B5E3C', fontWeight:500 }}>
                {t.about.eyebrow}
              </span>
              <div className="zc-divider" />
              <h2 className="zc-d" style={{ fontSize:'clamp(2rem,5vw,3.3rem)', fontWeight:500, fontStyle: isAr ? 'normal' : 'italic', lineHeight:1.12, color:'#2C1810', marginBottom:24, letterSpacing:'-.015em' }}>
                {t.about.h[0]}<br />{t.about.h[1]}
                <span style={{ color:'#C1440E' }}>{t.about.h[2]}</span>
              </h2>
              <p style={{ fontSize:'.97rem', lineHeight:1.88, color:'#5A3A25', marginBottom:18, fontWeight:300 }}>
                {t.about.p1}
              </p>
              <p style={{ fontSize:'.97rem', lineHeight:1.88, color:'#5A3A25', marginBottom:38, fontWeight:300 }}>
                {t.about.p2}
              </p>

              <div style={{ display:'flex', gap:36, borderTop:'1px solid rgba(139,94,60,.13)', paddingTop:28, flexWrap:'wrap' }}>
                {(t.about.stats as [string,string][]).map(([title, sub]) => (
                  <div key={title}>
                    <div className="zc-d" style={{ fontSize:'1.05rem', fontWeight:600, color:'#2C1810', marginBottom:5 }}>{title}</div>
                    <div style={{ fontSize:'.7rem', color:'#8B5E3C', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:500 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU ── */}
      <section id="menu" className="zc-menu-section" style={{ padding:'clamp(64px,8vw,120px) 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:52 }}>
            <span style={{ fontSize:'.67rem', letterSpacing:'.2em', textTransform:'uppercase', color:'#8B5E3C', fontWeight:500 }}>
              {t.menu.eyebrow}
            </span>
            <div className="zc-divider" />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:12 }}>
              <h2 className="zc-d" style={{ fontSize:'clamp(2rem,5vw,3.3rem)', fontWeight:500, fontStyle: isAr ? 'normal' : 'italic', lineHeight:1.1, color:'#2C1810', letterSpacing:'-.015em' }}>
                {t.menu.heading}
              </h2>
              <span className="zc-d" style={{ fontSize:'.88rem', fontStyle: isAr ? 'normal' : 'italic', color:'#8B5E3C' }}>
                {t.menu.priceNote}
              </span>
            </div>
          </div>

          {/* tabs — always bilingual */}
          <div className="zc-tabs">
            {MENU_DATA.map(({ category, arabic, Icon, accent }, i) => (
              <button key={category} className={`zc-tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                <Icon size={14} color={activeTab === i ? '#F5ECD7' : accent} />
                <span>{category}</span>
                <span style={{ fontStyle:'italic', fontSize:'.8rem', opacity:.65, fontFamily:"'Cairo',sans-serif" }}>{arabic}</span>
              </button>
            ))}
          </div>

          {/* panel */}
          {(() => {
            const { category, arabic, Icon, accent, tint, items } = MENU_DATA[activeTab];
            return (
              <div key={activeTab} className="zc-panel">
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:tint, border:`1.5px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={19} color={accent} />
                  </div>
                  <div>
                    <div style={{ fontSize:'.68rem', letterSpacing:'.16em', textTransform:'uppercase', color:accent, fontWeight:600 }}>{category}</div>
                    <div style={{ fontSize:'.9rem', fontStyle:'italic', color:'#8B5E3C', fontFamily:"'Cairo',sans-serif" }}>{arabic}</div>
                  </div>
                </div>
                <div style={{ width:'100%', height:1, background:`linear-gradient(90deg,${accent}35,transparent)`, marginBottom:24 }} />
                <div className="zc-items-grid">
                  {items.map((item) => (
                    <div key={item.name} className="zc-item">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:5 }}>
                        <span className="zc-item-name">
                          {item.name}
                          {'arabic' in item && item.arabic && (
                            <span className="zc-item-arabic">{item.arabic}</span>
                          )}
                        </span>
                        <span className="zc-item-price" style={{ color:accent }}>{item.price}</span>
                      </div>
                      <p className="zc-item-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="visit" className="zc-footer" style={{ padding:'clamp(52px,7vw,88px) 24px 36px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="zc-footer-grid"
               style={{ paddingBottom:44, borderBottom:'1px solid rgba(245,236,215,.07)', marginBottom:28 }}>

            <div>
              <div className="zc-d" style={{ fontSize:'2rem', fontStyle: isAr ? 'normal' : 'italic', fontWeight:600, color:'#F5ECD7', marginBottom:10, letterSpacing:'-.01em' }}>
                {isAr ? 'صغيرون' : 'Zghairon'}
              </div>
              <p style={{ fontSize:'.84rem', lineHeight:1.75, color:'rgba(245,236,215,.36)', maxWidth:210, fontWeight:300 }}>
                {t.footer.desc}
              </p>
            </div>

            <div>
              <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'#C1440E', fontWeight:500, marginBottom:16 }}>
                {t.footer.visitLabel}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
                  <MapPin size={14} color="#C1440E" style={{ marginTop:3, flexShrink:0 }} />
                  <span style={{ fontSize:'.84rem', color:'rgba(245,236,215,.52)', lineHeight:1.65, fontWeight:300 }}>
                    {t.footer.address[0]}<br />{t.footer.address[1]}
                  </span>
                </div>
                <div style={{ display:'flex', gap:11, alignItems:'center' }}>
                  <Clock size={14} color="#C1440E" style={{ flexShrink:0 }} />
                  <span style={{ fontSize:'.84rem', color:'rgba(245,236,215,.52)', fontWeight:300 }}>
                    {t.footer.hours}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'#C1440E', fontWeight:500, marginBottom:16 }}>
                {t.footer.followLabel}
              </div>
              <a href={IG_HREF} target="_blank" rel="noopener noreferrer"
                 style={{ display:'inline-flex', alignItems:'center', gap:10, color:'rgba(245,236,215,.52)', fontSize:'.84rem', fontWeight:300, transition:'color .2s' }}>
                <AtSign size={15} /> zghairon_cafe
              </a>
              <div style={{ marginTop:12 }}>
                <a href={`tel:${PHONE}`}
                   style={{ display:'inline-flex', alignItems:'center', gap:10, color:'rgba(245,236,215,.35)', fontSize:'.82rem', fontWeight:300 }}>
                  {PHONE}
                </a>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-start' }}>
              <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'#4A6741', fontWeight:500, marginBottom:16 }}>
                {t.footer.orderLabel}
              </div>
              <a href={TALABAT_HREF} target="_blank" rel="noopener noreferrer"
                 className="zc-btn zc-talabat" style={{ alignSelf:'flex-start', padding:'14px 28px' }}>
                <ShoppingBag size={17} /> {t.footer.orderBtn}
              </a>
              <span style={{ fontSize:'.7rem', color:'rgba(245,236,215,.2)', marginTop:10, fontWeight:300 }}>
                {t.footer.replyNote}
              </span>
            </div>

          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <span style={{ fontSize:'.7rem', color:'rgba(245,236,215,.18)', fontWeight:300 }}>
              {isAr
                ? `© ${new Date().getFullYear()} صغيرون كافيه · عمّان`
                : `© ${new Date().getFullYear()} Zghairon Café · Amman`}
            </span>
            <span style={{ fontSize:'.88rem', fontStyle:'italic', color:'rgba(245,236,215,.18)', fontFamily:"'Cairo',sans-serif" }}>
              صغيرون
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
