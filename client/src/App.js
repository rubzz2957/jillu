import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import './App.css';
import { PORTFOLIO_ITEMS as DATA_PORTFOLIO_ITEMS } from './data';

const PUBLIC_URL = process.env.PUBLIC_URL || (typeof window !== 'undefined' && window.location.pathname.includes('/jillu') ? '/jillu' : '');
const logoImg = require('./WhatsApp Image 2026-07-20 at 9.49.24 PM.jpeg');

// Distinct Image Bundles to keep Services and Gallery completely unique
const HERO_IMAGES = {
  heroMain: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
  livingRoom: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
  modernVilla: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
};

const SERVICE_IMAGES = {
  tailoring: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
  blackout: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  mosquitoMesh: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
  motorized: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  maintenance: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
};

const GALLERY_IMAGES = {
  sheerVoile: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
  velvetDrapes: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  balconyMesh: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80',
  slidingNet: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
  doorNet1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Screen_door_interior.jpg/800px-Screen_door_interior.jpg',
  doorNet2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Screen-door-3050.jpg/800px-Screen-door-3050.jpg',
  doorNet3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Screen-door-with-frame.jpg/800px-Screen-door-with-frame.jpg',
  bedroomLuxury: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
};

function App() {
  const [openingComplete, setOpeningComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [zipImages, setZipImages] = useState([]);
  const [isLoadingZip, setIsLoadingZip] = useState(true);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submittedPhotos, setSubmittedPhotos] = useState([]);

  // Spotlight animation timer
  useEffect(() => {
    const timer = setTimeout(() => setOpeningComplete(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCustomerPhoto(null);
      setPhotoPreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setCustomerPhoto(null);
      setPhotoPreview('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    setCustomerPhoto(file);
  };

  const handlePhotoSubmit = () => {
    if (!customerPhoto || !photoPreview) {
      return;
    }

    const newPhoto = {
      id: Date.now(),
      title: customerPhoto.name.replace(/\.[^.]+$/, ''),
      category: 'Customer Upload',
      src: photoPreview,
    };

    setSubmittedPhotos((prev) => [newPhoto, ...prev]);
    setActiveTab('gallery');
  };

  // ZIP loader for Gallery
useEffect(() => {
  async function loadCatalogZip() {
    try {
      setIsLoadingZip(true);
      
      // 1. Fetch the zip file
      const response = await fetch(`${PUBLIC_URL}/catalog.zip`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(blob);
      const imagePromises = [];

      // 2. Extract image files
      zipContent.forEach((relativePath, zipEntry) => {
        // Exclude system hidden files (like __MACOSX) and folders
        const isMacFile = relativePath.includes('__MACOSX');
        const isImage = /\.(png|jpe?g|svg|webp|gif)$/i.test(zipEntry.name);

        if (!zipEntry.dir && !isMacFile && isImage) {
          const promise = zipEntry.async('blob').then((imgBlob) => ({
            name: zipEntry.name.split('/').pop(), // Get clean file name without subfolders
            url: URL.createObjectURL(imgBlob),
          }));
          imagePromises.push(promise);
        }
      });

      // 3. Wait for all blobs to convert
      const extractedImages = await Promise.all(imagePromises);

      console.log("Successfully extracted images:", extractedImages.length);

      // 4. Update state
      if (extractedImages.length > 0) {
        setZipImages(extractedImages);
      }
    } catch (err) {
      console.error('Error reading catalog.zip:', err);
    } finally {
      setIsLoadingZip(false);
    }
  }

  loadCatalogZip();
}, []);
  return (
    <div className="app-container" style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* CSS STYLES & ANIMATIONS */}
      <style>{`
        /* Golden Spotlight Opening Animation */
        .intro-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 1s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.8s ease;
        }
        .intro-overlay.reveal {
          transform: scale(1.08);
          opacity: 0;
          pointer-events: none;
        }
        .spotlight-ring {
          width: 170px;
          height: 170px;
          border-radius: 50%;
          border: 2px solid #d4af37;
          box-shadow: 0 0 40px rgba(212, 175, 55, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulseRing 1.8s infinite ease-in-out;
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); box-shadow: 0 0 20px rgba(212, 175, 55, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(212, 175, 55, 0.9); }
          100% { transform: scale(0.95); box-shadow: 0 0 20px rgba(212, 175, 55, 0.4); }
        }

        /* Gold Text & Card Animations */
        .gold-text {
          color: #d4af37;
          background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa7c11 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .animated-card {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .animated-card:hover {
          transform: translateY(-7px);
          border-color: #d4af37 !important;
          box-shadow: 0 12px 28px rgba(212, 175, 55, 0.2);
        }
        .btn-gold {
          background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
          color: #000;
          font-weight: bold;
          border: none;
          border-radius: 4px;
          transition: all 0.3s ease;
          letter-spacing: 1px;
        }
        .btn-gold:hover {
          background: linear-gradient(135deg, #f3e5ab 0%, #d4af37 100%);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
          transform: translateY(-2px);
        }
        .social-logo-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #d4af37;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #d4af37;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .social-logo-btn:hover {
          background: #d4af37;
          color: #000;
          transform: translateY(-4px);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.7);
        }
        .section-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid #d4af37;
          color: #d4af37;
          font-size: 0.8rem;
          letter-spacing: 2px;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
      `}</style>

      {/* INTRO SPOTLIGHT REVEAL */}
      <div className={`intro-overlay ${openingComplete ? 'reveal' : ''}`}>
        <div className="spotlight-ring">
          <img src={logoImg} alt="Jillu Curtains" style={{ width: '110px', borderRadius: '50%' }} />
        </div>
        <h2 className="gold-text" style={{ marginTop: '20px', letterSpacing: '4px', fontSize: '1.8rem' }}>JILLU CURTAINS</h2>
        <p style={{ color: '#aaa', fontSize: '0.85rem', letterSpacing: '2px', marginTop: '6px' }}>LUXURY DRAPES & INSECT SCREENS</p>
      </div>

      {/* HEADER / NAVBAR */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={logoImg} alt="Logo" style={{ height: '42px', borderRadius: '4px' }} />
          <span className="gold-text" style={{ fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '2px' }}>JILLU CURTAINS</span>
        </div>
        <ul className="nav-links">
          {['home', 'about', 'services', 'gallery', 'contact'].map((tab) => (
            <li key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab.toUpperCase()}
            </li>
          ))}
        </ul>
      </header>

      {/* DYNAMIC PAGE RENDER */}
      <main>
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'about' && <AboutPage setActiveTab={setActiveTab} />}
        {activeTab === 'services' && <ServicesPage setActiveTab={setActiveTab} />}
        {activeTab === 'gallery' && <GalleryPage zipImages={zipImages} isLoading={isLoadingZip} setActiveTab={setActiveTab} uploadedPhotos={submittedPhotos} />}
        {activeTab === 'contact' && <ContactPage customerPhoto={customerPhoto} photoPreview={photoPreview} onPhotoUpload={handlePhotoUpload} onSubmitPhoto={handlePhotoSubmit} />}
      </main>

      {/* FOOTER WITH SOCIAL MEDIA LOGOS */}
      <footer style={{ borderTop: '1px solid #222', background: '#0a0a0a', paddingTop: '60px', paddingBottom: '30px', marginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
          
          {/* Footer Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <img src={logoImg} alt="Jillu Curtains" style={{ width: '48px', borderRadius: '4px' }} />
              <h3 className="gold-text" style={{ margin: 0, fontSize: '1.3rem' }}>JILLU CURTAINS</h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.92rem', lineHeight: '1.7' }}>
              Specialized master tailors for high-end window drapery, 100% thermal blackout linings, sheer daylight filters, and durable mosquito mesh door systems.
            </p>
          </div>

          {/* Footer Col 2: Showroom & Contact Info */}
          <div>
            <h4 className="gold-text" style={{ fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '1px' }}>STORE LOCATION & HOURS</h4>
            <div style={{ color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}>📍 <strong>Address:</strong> Komarapalayam,Tamil nadu,India</p>
              <p style={{ margin: 0 }}>📞 <strong>Phone:</strong>+91 7502718156</p>
              <p style={{ margin: 0 }}>✉️ <strong>Email:</strong> jillucurtains1@gmail.com</p>
              <p style={{ margin: 0 }}>🕒 <strong>Hours:</strong> Mon - Sun, 10 AM TO 6PM</p>
            </div>
          </div>

          {/* Footer Col 3: SVG Social Media Logos */}
          <div>
            <h4 className="gold-text" style={{ fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '1px' }}>CONNECT WITH US</h4>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>Follow us on social media for design reveals and client transformations:</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              
              {/* Instagram SVG */}
              <a href="https://www.instagram.com/__harikrishnan_dhanapal_/" target="_blank" rel="noreferrer noopener" className="social-logo-btn" title="Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook SVG */}
              <a href="#facebook" className="social-logo-btn" title="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.847 9 5.052V8z"/>
                </svg>
              </a>

              {/* WhatsApp SVG */}
              <a href="https://wa.me/917502718156" target="_blank" rel="noreferrer noopener" className="social-logo-btn" title="WhatsApp">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </a>

            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '50px', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.85rem' }}>© 2026 Jillu Curtains. Premium Tailored Drapery & Mosquito Screen Systems. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ==========================================================================
   1. HOME PAGE (10 SECTIONS - HIGHLY IMPRESSIVE)
   ========================================================================== */
const HomePage = ({ setActiveTab }) => (
  <div>
    {/* Section 1: Grand Hero Banner */}
    <section style={{ 
      position: 'relative', 
      minHeight: '88vh', 
      backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url("${HERO_IMAGES.heroMain}")`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <div style={{ maxWidth: '900px' }}>
        <span className="section-badge">Craftsmanship Beyond Compare</span>
        <h1 className="gold-text" style={{ fontSize: '3.6rem', marginBottom: '20px', fontWeight: 'bold', lineHeight: '1.2' }}>
          Transform Your Windows Into Architectural Masterpieces
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#ddd', maxWidth: '750px', margin: '0 auto 35px', lineHeight: '1.7' }}>
          Custom tailored luxury drapes, 100% thermal blackout control, and sleek accordion mosquito mesh systems for home and villa interiors.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" style={{ padding: '16px 36px', fontSize: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('contact')}>
            Get Free Window Quote
          </button>
          <button style={{ padding: '16px 36px', fontSize: '1rem', cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #d4af37', borderRadius: '4px' }} onClick={() => setActiveTab('gallery')}>
            View Design Portfolio
          </button>
        </div>
      </div>
    </section>

    {/* Section 2: Key Live Statistics Bar */}
    <section style={{ background: '#0e0e0e', borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'center' }}>
        <div><h2 className="gold-text" style={{ fontSize: '2.5rem', margin: 0 }}>1,200+</h2><p style={{ color: '#888', marginTop: '5px' }}>Homes Fitted</p></div>
        <div><h2 className="gold-text" style={{ fontSize: '2.5rem', margin: 0 }}>100%</h2><p style={{ color: '#888', marginTop: '5px' }}>Custom Measurement</p></div>
        <div><h2 className="gold-text" style={{ fontSize: '2.5rem', margin: 0 }}>350+</h2><p style={{ color: '#888', marginTop: '5px' }}>Fabric Textures</p></div>
        <div><h2 className="gold-text" style={{ fontSize: '2.5rem', margin: 0 }}>5 Years</h2><p style={{ color: '#888', marginTop: '5px' }}>Frame Warranty</p></div>
      </div>
    </section>

    {/* Section 3: Core Offering Triad */}
    <section style={{ padding: '90px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <span className="section-badge">Our Specialties</span>
      <h2 className="gold-text" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Tailored To Perfection</h2>
      <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto 50px' }}>We do not do ready-made. Every piece is hand-measured and stitched for your exact window dimensions.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <div className="animated-card" style={{ background: '#121212', border: '1px solid #222', padding: '35px', borderRadius: '10px', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>👑</div>
          <h3 className="gold-text" style={{ marginBottom: '12px' }}>Luxury Custom Drapes</h3>
          <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.7' }}>Pinch pleat, box pleat, and eyelet curtains tailored in heavy jacquard, velvet, or pure linen.</p>
        </div>
        <div className="animated-card" style={{ background: '#121212', border: '1px solid #222', padding: '35px', borderRadius: '10px', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🛡️</div>
          <h3 className="gold-text" style={{ marginBottom: '12px' }}>Pleated Mosquito Netting</h3>
          <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.7' }}>High-tensile track-sliding mosquito mesh that keeps insects out while allowing unobstructed breeze.</p>
        </div>
        <div className="animated-card" style={{ background: '#121212', border: '1px solid #222', padding: '35px', borderRadius: '10px', textAlign: 'left' }}>
          <h3 className="gold-text" style={{ marginBottom: '12px' }}>Thermal Blackout Linings</h3>
          <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.7' }}>Multi-layer heat-blocking curtain backing designed for climate control and total privacy.</p>
        </div>
      </div>
    </section>

    {/* Section 4: Visual Showcase Grid */}
    <section style={{ background: '#0a0a0a', padding: '90px 20px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="section-badge">Gallery Preview</span>
          <h2 className="gold-text" style={{ fontSize: '2.5rem' }}>Interior Inspirations</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: '25px' }}>
          <div className="animated-card" style={{ background: '#121212', borderRadius: '10px', overflow: 'hidden', border: '1px solid #222' }}>
            <img src={HERO_IMAGES.livingRoom} alt="Living Room" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            <div style={{ padding: '25px' }}><h4 className="gold-text">Living Room Floor-Length Drapes</h4><p style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>Grand double-height drape installations.</p></div>
          </div>
          <div className="animated-card" style={{ background: '#121212', borderRadius: '10px', overflow: 'hidden', border: '1px solid #222' }}>
            <img src={HERO_IMAGES.modernVilla} alt="Villa Setup" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            <div style={{ padding: '25px' }}><h4 className="gold-text">Modern Villa Window Treatments</h4><p style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>Seamless integration with modern architecture.</p></div>
          </div>
        </div>
      </div>
    </section>

    {/* Section 5: Interactive Fabric Feature Spotlight */}
    <section style={{ padding: '90px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
        <div>
          <span className="section-badge">Material Excellence</span>
          <h2 className="gold-text" style={{ fontSize: '2.4rem', marginBottom: '20px' }}>Engineered Fabrics & Durable Mesh</h2>
          <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '20px' }}>
            We source colorfast, dust-resistant textiles and high-density fiberglass mesh to ensure your window installations look stunning for years.
          </p>
          <ul style={{ color: '#ddd', lineHeight: '2', paddingLeft: '20px' }}>
            <li>UV-Resistant coating prevents fabric fading</li>
            <li>Stainless steel & fiberglass non-rust netting</li>
            <li>Silent magnetic seals for mosquito screen doors</li>
          </ul>
        </div>
        <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '30px' }}>
          <h3 className="gold-text" style={{ marginBottom: '15px' }}>Swatch Request</h3>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>Want to feel the fabric thickness before deciding? We bring physical sample books to your door.</p>
          <button className="btn-gold" style={{ width: '100%', padding: '14px' }} onClick={() => setActiveTab('contact')}>Request Doorstep Swatch Book</button>
        </div>
      </div>
    </section>

    {/* Section 6: How We Work - 4 Step Process */}
    <section style={{ background: '#0e0e0e', padding: '90px 20px', textAlign: 'center', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <span className="section-badge">Seamless Execution</span>
        <h2 className="gold-text" style={{ fontSize: '2.5rem', marginBottom: '50px' }}>Our 4-Step Precision Workflow</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
          <div className="animated-card" style={{ background: '#141414', padding: '30px', borderRadius: '10px', border: '1px solid #222' }}>
            <h1 className="gold-text" style={{ margin: '0 0 10px 0' }}>01</h1>
            <h4>On-Site Measurement</h4>
            <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '8px' }}>Millimeter-exact laser frame measurement.</p>
          </div>
          <div className="animated-card" style={{ background: '#141414', padding: '30px', borderRadius: '10px', border: '1px solid #222' }}>
            <h1 className="gold-text" style={{ margin: '0 0 10px 0' }}>02</h1>
            <h4>Fabric Selection</h4>
            <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '8px' }}>Pick from hundreds of sheer & blackout options.</p>
          </div>
          <div className="animated-card" style={{ background: '#141414', padding: '30px', borderRadius: '10px', border: '1px solid #222' }}>
            <h1 className="gold-text" style={{ margin: '0 0 10px 0' }}>03</h1>
            <h4>Master Tailoring</h4>
            <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '8px' }}>Stitched with double-fold hem technology.</p>
          </div>
          <div className="animated-card" style={{ background: '#141414', padding: '30px', borderRadius: '10px', border: '1px solid #222' }}>
            <h1 className="gold-text" style={{ margin: '0 0 10px 0' }}>04</h1>
            <h4>Track & Net Fitting</h4>
            <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '8px' }}>Flawless, clean installation by experts.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Section 7: Quality & Guarantee Comparison */}
    <section style={{ padding: '90px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span className="section-badge">Why Choose Jillu</span>
        <h2 className="gold-text" style={{ fontSize: '2.5rem' }}>The Jillu Difference</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        <div style={{ background: '#121212', border: '1px solid #333', padding: '30px', borderRadius: '10px' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>Standard Ready-Made Curtains</h3>
          <ul style={{ color: '#888', lineHeight: '2', paddingLeft: '20px', fontSize: '0.9rem' }}>
            <li>Generic lengths that drag or sit too short</li>
            <li>Thin fabric with uneven light leakage</li>
            <li>Flimsy rings that snag on tracks</li>
            <li>No built-in insect protection options</li>
          </ul>
        </div>
        <div style={{ background: '#121212', border: '1px solid #d4af37', padding: '30px', borderRadius: '10px' }}>
          <h3 className="gold-text" style={{ marginBottom: '15px' }}>Jillu Bespoke Solution</h3>
          <ul style={{ color: '#ddd', lineHeight: '2', paddingLeft: '20px', fontSize: '0.9rem' }}>
            <li>Laser-measured floor drops and perfect headings</li>
            <li>100% genuine light & thermal isolation</li>
            <li>Heavy-duty silent smooth aluminum tracks</li>
            <li>Custom integrated sliding mosquito screen doors</li>
          </ul>
        </div>
      </div>
    </section>

    {/* Section 8: Testimonials */}
    <section style={{ background: '#0a0a0a', padding: '90px 20px', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <span className="section-badge">Client Reviews</span>
        <h2 className="gold-text" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Loved By Homeowners</h2>
        <blockquote style={{ fontSize: '1.2rem', color: '#ccc', fontStyle: 'italic', lineHeight: '1.8', margin: 0 }}>
          "Jillu Curtains outfitted our entire home. The blackout drapes in the master suite block every bit of morning light, and the sliding mosquito nets on our balcony doors operate so smoothly!"
        </blockquote>
        <p className="gold-text" style={{ marginTop: '20px', fontWeight: 'bold' }}>— Rajesh & Meera K., Villa Owners</p>
      </div>
    </section>

    {/* Section 9: FAQ Accordion Teaser */}
    <section style={{ padding: '90px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-badge">Got Questions?</span>
        <h2 className="gold-text" style={{ fontSize: '2.2rem' }}>Frequently Asked Questions</h2>
      </div>
      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ background: '#121212', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
          <h4 className="gold-text" style={{ margin: 0 }}>How long does custom curtain stitching take?</h4>
          <p style={{ color: '#888', marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.6' }}>Typically 5 to 7 business days from measurement confirmation to doorstep installation.</p>
        </div>
        <div style={{ background: '#121212', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
          <h4 className="gold-text" style={{ margin: 0 }}>Can mosquito nets be fitted on existing wooden or aluminum windows?</h4>
          <p style={{ color: '#888', marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.6' }}>Yes, we custom build aluminum track frames that mount seamlessly on any window frame type.</p>
        </div>
      </div>
    </section>

    {/* Section 10: Grand Home CTA */}
    <section style={{ background: 'linear-gradient(180deg, #0e0e0e 0%, #1c1708 100%)', padding: '90px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="gold-text" style={{ fontSize: '2.8rem', marginBottom: '15px' }}>Ready To Upgrade Your Living Space?</h2>
        <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '35px' }}>Schedule a doorstep measurement visit with our expert curtain technicians today.</p>
        <button className="btn-gold" style={{ padding: '16px 42px', fontSize: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('contact')}>
          Book Free On-Site Consultation
        </button>
      </div>
    </section>
  </div>
);
/* ==========================================================================
   2. ABOUT PAGE (10 SECTIONS)
   ========================================================================== */
const AboutPage = ({ setActiveTab }) => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
    {/* Section 1: Banner Header */}
    <section style={{ textAlign: 'center', marginBottom: '60px' }}>
      <span className="section-badge">Our Heritage</span>
      <h1 className="gold-text" style={{ fontSize: '3rem', marginBottom: '15px' }}>About Jillu Curtains</h1>
      <p style={{ color: '#aaa', maxWidth: '750px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
        A specialized workshop dedicated exclusively to custom drapery tailoring and advanced insect barrier engineering.
      </p>
    </section>

    {/* Section 2: Core Philosophy */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '70px' }}>
      <div>
        <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '15px' }}>Master Drapery Craftsmanship</h2>
        <p style={{ color: '#888', lineHeight: '1.8' }}>
          At Jillu Curtains, we believe windows shape the soul of every room. We combine traditional tailoring precision with modern track systems to create window coverings that offer privacy, climate insulation, and timeless beauty.
        </p>
      </div>
      <img src={SERVICE_IMAGES.tailoring} alt="Tailoring" style={{ width: '100%', borderRadius: '10px', border: '1px solid #333' }} />
    </section>

    {/* Section 3: In-House Tailoring Workshop */}
    <section style={{ background: '#121212', padding: '45px', borderRadius: '12px', border: '1px solid #222', marginBottom: '70px' }}>
     <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>In-House Fabrication Unit</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
        <div><h4 className="gold-text">Zero Subcontracting</h4><p style={{ color: '#888', fontSize: '0.88rem' }}>Every curtain is stitched in our controlled studio.</p></div>
        <div><h4 className="gold-text">Double-Fold Hems</h4><p style={{ color: '#888', fontSize: '0.88rem' }}>Ensures perfect curtain fall without curling edges.</p></div>
        <div><h4 className="gold-text">Rigorous QC</h4><p style={{ color: '#888', fontSize: '0.88rem' }}>Inspected for stitch density and pleat alignment before delivery.</p></div>
      </div>
    </section>

    {/* Section 4: Specialized Netting Expertise */}
    <section style={{ marginBottom: '70px' }}>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>Pioneers In Insect Net Systems</h2>
      <p style={{ color: '#aaa', textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px', lineHeight: '1.7' }}>
        Our mosquito screens are engineered with powder-coated extruded aluminum frames and high-tensile mesh designed to withstand wind pressure without sagging.
      </p>
    </section>

    {/* Section 5: Material Standards */}
    <section style={{ background: '#0e0e0e', padding: '45px', borderRadius: '12px', border: '1px solid #222', marginBottom: '70px' }}>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>Uncompromised Material Standards</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
        <div style={{ padding: '20px', background: '#141414', borderRadius: '8px' }}><h4 className="gold-text">Stainless Steel 304</h4><p style={{ color: '#888', fontSize: '0.85rem' }}>Anti-rust wire netting</p></div>
        <div style={{ padding: '20px', background: '#141414', borderRadius: '8px' }}><h4 className="gold-text">German Track Runners</h4><p style={{ color: '#888', fontSize: '0.85rem' }}>Ultra-silent glider clips</p></div>
        <div style={{ padding: '20px', background: '#141414', borderRadius: '8px' }}><h4 className="gold-text">Heavy Jacquard Threads</h4><p style={{ color: '#888', fontSize: '0.85rem' }}>Durable weave strength</p></div>
      </div>
    </section>

    {/* Section 6: Tailored Categories */}
    <section style={{ marginBottom: '70px' }}>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>Our Specialty Categories</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
        <div style={{ padding: '20px', background: '#121212', border: '1px solid #333', borderRadius: '8px' }}>Sheer Voiles</div>
        <div style={{ padding: '20px', background: '#121212', border: '1px solid #333', borderRadius: '8px' }}>Thermal Blackout</div>
        <div style={{ padding: '20px', background: '#121212', border: '1px solid #333', borderRadius: '8px' }}>Pleated Mesh</div>
        <div style={{ padding: '20px', background: '#121212', border: '1px solid #333', borderRadius: '8px' }}>Motorized Tracks</div>
      </div>
    </section>

    {/* Section 7: Quality Assurance Commitment */}
    <section style={{ background: '#121212', padding: '40px', borderRadius: '12px', border: '1px solid #d4af37', marginBottom: '70px', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ marginBottom: '15px' }}>Our Quality Promise</h2>
      <p style={{ color: '#aaa', maxWidth: '750px', margin: '0 auto' }}>
        If any drape length requires adjustment or if a mosquito mesh frame needs realignment within 12 months, our team re-services it free of charge.
      </p>
    </section>

    {/* Section 8: Experienced Technicians */}
    <section style={{ marginBottom: '70px', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ marginBottom: '20px' }}>Expert On-Site Technicians</h2>
      <p style={{ color: '#888', maxWidth: '700px', margin: '0 auto' }}>
        Our installation team carries years of experience handling delicate walls, stone cladding, and complex bay windows without causing damage to your property.
      </p>
    </section>

    {/* Section 9: Achievements Stats */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center', marginBottom: '70px' }}>
      <div style={{ padding: '25px', background: '#0e0e0e', border: '1px solid #222', borderRadius: '8px' }}><h1 className="gold-text" style={{ margin: 0 }}>10+</h1><p style={{ color: '#888' }}>Years Experience</p></div>
      <div style={{ padding: '25px', background: '#0e0e0e', border: '1px solid #222', borderRadius: '8px' }}><h1 className="gold-text" style={{ margin: 0 }}>5,000+</h1><p style={{ color: '#888' }}>Drapes Stitched</p></div>
      <div style={{ padding: '25px', background: '#0e0e0e', border: '1px solid #222', borderRadius: '8px' }}><h1 className="gold-text" style={{ margin: 0 }}>100%</h1><p style={{ color: '#888' }}>Satisfaction Focus</p></div>
    </section>

    {/* Section 10: About CTA */}
    <section style={{ textAlign: 'center', background: '#121212', padding: '50px 20px', borderRadius: '12px', border: '1px solid #333' }}>
      <h2 className="gold-text" style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Work With Custom Drapery Experts</h2>
      <p style={{ color: '#aaa', marginBottom: '25px' }}>Let us guide you through fabric selection, light control, and window protection.</p>
      <button className="btn-gold" style={{ padding: '14px 35px' }} onClick={() => setActiveTab('contact')}>Contact Our Team</button>
    </section>
  </div>
);

/* ==========================================================================
   3. SERVICES PAGE (10 SECTIONS - STRICT SERVICE SPECIFICATIONS)
   ========================================================================== */
const ServicesPage = ({ setActiveTab }) => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
    
    {/* Section 1: Title Header */}
    <section style={{ textAlign: 'center', marginBottom: '60px' }}>
      <span className="section-badge">Engineering & Tailoring</span>
      <h1 className="gold-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>Our Services & Solutions</h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Detailed breakdown of bespoke tailoring services, mosquito mesh installation, and track engineering.</p>
    </section>

    {/* Section 2: Hardware & Track Infrastructure Showcase */}
    <section style={{ background: '#121212', border: '1px solid #333', padding: '35px', borderRadius: '12px', marginBottom: '70px' }}>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '10px' }}>Track & Mounting Hardware Architecture</h2>
      <p style={{ color: '#888', textAlign: 'center', marginBottom: '30px' }}>Engineered support systems for effortless drape glides and bug netting installation</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="animated-card" style={{ background: '#080808', border: '1px solid #222', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 className="gold-text" style={{ marginBottom: '8px' }}>Heavy Aluminum Tracks</h4>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Rust-proof dual/triple rail channels for combined sheer and blackout drapes.</p>
        </div>
        <div className="animated-card" style={{ background: '#080808', border: '1px solid #222', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 className="gold-text" style={{ marginBottom: '8px' }}>Recessed Ceiling Channels</h4>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Concealed architectural track slots built flush into modern false ceilings.</p>
        </div>
        <div className="animated-card" style={{ background: '#080808', border: '1px solid #222', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <h4 className="gold-text" style={{ marginBottom: '8px' }}>Magnetic Mesh Frames</h4>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Snug magnetic perimeter strip locking for zero gap mosquito protection.</p>
        </div>
      </div>
    </section>

    {/* Section 3: Deep Service 1 - Custom Drapery Tailoring */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '70px' }}>
      <img src={SERVICE_IMAGES.tailoring} alt="Stitching Service" style={{ width: '100%', borderRadius: '10px', border: '1px solid #333' }} />
      <div>
        <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '15px' }}>1. Bespoke Curtain Tailoring Service</h2>
        <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '15px' }}>
          Hand-stitched drapes designed precisely around your room's ceiling height, floor clearance, and window width. We craft pinch pleat, box pleat, ripplefold, and grommet eyelet styles.
        </p>
        <ul style={{ color: '#ddd', fontSize: '0.92rem', lineHeight: '2', paddingLeft: '20px' }}>
          <li>Double-bottom weighted hems for linear vertical drops</li>
          <li>Custom lining attachments (Sheer, Satin, or Thermal)</li>
          <li>Reinforced heading tapes for long-lasting pleat structural memory</li>
        </ul>
      </div>
    </section>

    {/* Section 4: Deep Service 2 - Mosquito Mesh & Netting Installations */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '70px' }}>
      <div>
        <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '15px' }}>2. Mosquito Screen Door & Window Systems</h2>
        <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '15px' }}>
          Engineered protection against mosquitoes, flies, and pests without blocking outdoor sunlight or fresh air flow.
        </p>
        <ul style={{ color: '#ddd', fontSize: '0.92rem', lineHeight: '2', paddingLeft: '20px' }}>
          <li>Pleated Accordion Sliding Nets for French doors & balconies</li>
          <li>Velcro-detachable washable mesh frames for easy cleaning</li>
          <li>High-strength SS304 anti-claw pet mesh options</li>
        </ul>
      </div>
      <img src={SERVICE_IMAGES.mosquitoMesh} alt="Mosquito Net Service" style={{ width: '100%', borderRadius: '10px', border: '1px solid #333' }} />
    </section>

    {/* Section 5: Deep Service 3 - Thermal & 100% Blackout Line */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '70px' }}>
      <img src={SERVICE_IMAGES.blackout} alt="Blackout Service" style={{ width: '100%', borderRadius: '10px', border: '1px solid #333' }} />
      <div>
        <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '15px' }}>3. Thermal & Sound Blackout Installation</h2>
        <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '15px' }}>
          Specially coated 3-pass blackout linings sewn directly into your main drapes to keep bedrooms pitch black and energy efficient.
        </p>
        <ul style={{ color: '#ddd', fontSize: '0.92rem', lineHeight: '2', paddingLeft: '20px' }}>
          <li>100% Light cutoff ideal for night-shift sleep & home theaters</li>
          <li>Blocks up to 40% solar heat transfer to reduce AC bills</li>
          <li>Acoustic deadening layers to mute outdoor traffic noises</li>
        </ul>
      </div>
    </section>

    {/* Section 6: Deep Service 4 - Smart Motorized Curtain Tracks */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '70px' }}>
      <div>
        <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '15px' }}>4. Motorized Smart Track Automation</h2>
        <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '15px' }}>
          Upgrade your curtains with whisper-quiet motorized tracks controlled via remote control, smartphone app, or home automation systems.
        </p>
        <ul style={{ color: '#ddd', fontSize: '0.92rem', lineHeight: '2', paddingLeft: '20px' }}>
          <li>Heavy-load motor capacity for large double-story windows</li>
          <li>Touch-motion manual override (pull gently to auto-close)</li>
          <li>Compatible with Alexa, Google Home, and smart relays</li>
        </ul>
      </div>
      <img src={SERVICE_IMAGES.motorized} alt="Motorized Track" style={{ width: '100%', borderRadius: '10px', border: '1px solid #333' }} />
    </section>

    {/* Section 7: Deep Service 5 - Net Repair & Maintenance */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '70px' }}>
      <img src={SERVICE_IMAGES.maintenance} alt="Maintenance Service" style={{ width: '100%', borderRadius: '10px', border: '1px solid #333' }} />
      <div>
        <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '15px' }}>5. Re-Mesh & Track Maintenance</h2>
        <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '15px' }}>
          Already have screen frames or curtain tracks installed? We offer replacement mesh fitting, cord repairs, track wheel lubrications, and drape steam ironing.
        </p>
        <ul style={{ color: '#ddd', fontSize: '0.92rem', lineHeight: '2', paddingLeft: '20px' }}>
          <li>Replacement fiberglass wire re-tensioning</li>
          <li>Broken track runner clip replacement</li>
          <li>Curtain length alteration and re-hemming</li>
        </ul>
      </div>
    </section>

    {/* Section 8: Commercial Window Solutions */}
    <section style={{ background: '#121212', padding: '40px', borderRadius: '12px', border: '1px solid #222', marginBottom: '70px', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ marginBottom: '15px' }}>6. Commercial & Corporate Contracts</h2>
      <p style={{ color: '#aaa', maxWidth: '750px', margin: '0 auto', lineHeight: '1.7' }}>
        We supply flame-retardant curtains, office window roller blinds, and mosquito screening for hotels, hospitals, offices, and restaurant dining areas.
      </p>
    </section>

    {/* Section 9: Service Warranty Matrix */}
    <section style={{ marginBottom: '70px' }}>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>Service Coverage & Guarantee</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'center' }}>
        <div style={{ background: '#0e0e0e', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}><h4 className="gold-text">Stitching Warranty</h4><p style={{ color: '#888', fontSize: '0.85rem' }}>3 Years on seam & tape integrity</p></div>
        <div style={{ background: '#0e0e0e', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}><h4 className="gold-text">Track Warranty</h4><p style={{ color: '#888', fontSize: '0.85rem' }}>5 Years smooth glide guarantee</p></div>
        <div style={{ background: '#0e0e0e', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}><h4 className="gold-text">Net Tension Guarantee</h4><p style={{ color: '#888', fontSize: '0.85rem' }}>2 Years non-sag assurance</p></div>
      </div>
    </section>

    {/* Section 10: Service CTA */}
    <section style={{ textAlign: 'center', background: '#0e0e0e', padding: '50px 20px', borderRadius: '12px', border: '1px solid #333' }}>
      <h2 className="gold-text" style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Need a Service Consultation?</h2>
      <p style={{ color: '#aaa', marginBottom: '25px' }}>Get in touch with our technicians for an accurate on-site quote.</p>
      <button className="btn-gold" style={{ padding: '14px 35px' }} onClick={() => setActiveTab('contact')}>Book Service Visit</button>
    </section>

  </div>
);

/* ==========================================================================
   4. GALLERY PAGE (PORTFOLIO GALLERY)
   ========================================================================== */

const PORTFOLIO_ITEMS = DATA_PORTFOLIO_ITEMS.map((item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  src: `${PUBLIC_URL}/images/${encodeURIComponent(item.image)}`,
}));

const GalleryPage = ({ setActiveTab, uploadedPhotos }) => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
    
    {/* Section 1: Intro */}
    <section style={{ textAlign: 'center', marginBottom: '60px' }}>
      <span className="section-badge">Visual Showcase</span>
      <h1 className="gold-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>Design & Installation Gallery</h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Browse high-resolution photographs of our real customer drape setups and mosquito screen installations.</p>
    </section>

    {uploadedPhotos.length > 0 && (
      <section style={{ marginBottom: '70px' }}>
        <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>Customer Uploads</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          {uploadedPhotos.map((item) => (
            <div key={item.id} className="animated-card" style={{ background: '#121212', border: '1px solid #222', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={item.src} alt={item.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#d4af37', background: '#1a1810', padding: '4px 10px', borderRadius: '4px' }}>
                  {item.category}
                </span>
                <h3 style={{ color: '#eee', fontSize: '1.1rem', marginTop: '12px', marginBottom: '0' }}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Section 2: Separate Portfolio Showcase */}
    <section style={{ marginBottom: '70px' }}>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '30px' }}>Our Featured Portfolio</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        {PORTFOLIO_ITEMS.map((item) => (
          <div key={item.id} className="animated-card" style={{ background: '#121212', border: '1px solid #222', borderRadius: '10px', overflow: 'hidden' }}>
            <img src={item.src} alt={item.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#d4af37', background: '#1a1810', padding: '4px 10px', borderRadius: '4px' }}>
                {item.category}
              </span>
              <h3 style={{ color: '#eee', fontSize: '1.1rem', marginTop: '12px', marginBottom: '0' }}>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Section 6: Texture & Fabric Swatch Previews */}
    <section style={{ background: '#0e0e0e', padding: '40px', borderRadius: '12px', border: '1px solid #222', marginBottom: '70px', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ marginBottom: '15px' }}>1. Fabric Texture Close-ups</h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>Detailed look at our linen weaves, satin backs, and fiberglass wire mesh density.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
        <div style={{ padding: '20px', background: '#141414', border: '1px solid #333', borderRadius: '6px', color: '#ccc' }}>Linen Weave</div>
        <div style={{ padding: '20px', background: '#141414', border: '1px solid #333', borderRadius: '6px', color: '#ccc' }}>Raw Silk Satin</div>
        <div style={{ padding: '20px', background: '#141414', border: '1px solid #333', borderRadius: '6px', color: '#ccc' }}>SS Anti-Pet Net</div>
        <div style={{ padding: '20px', background: '#141414', border: '1px solid #333', borderRadius: '6px', color: '#ccc' }}>Thermal Foil Back</div>
      </div>
    </section>

    {/* Section 7: Pleat Style Comparison */}
    <section style={{ marginBottom: '70px', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '25px' }}>2. Heading & Pleat Styling Options</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '25px', background: '#121212', border: '1px solid #222', borderRadius: '8px' }}><h4 className="gold-text">Pinch Pleat</h4><p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>Traditional tailored luxury</p></div>
        <div style={{ padding: '25px', background: '#121212', border: '1px solid #222', borderRadius: '8px' }}><h4 className="gold-text">Grommet Ring</h4><p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>Modern casual look</p></div>
        <div style={{ padding: '25px', background: '#121212', border: '1px solid #222', borderRadius: '8px' }}><h4 className="gold-text">Ripplefold Track</h4><p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>Architectural continuous wave</p></div>
      </div>
    </section>

    {/* Section 8: Commercial Installations Showcase */}
    <section style={{ background: '#121212', padding: '40px', borderRadius: '12px', marginBottom: '70px', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ marginBottom: '15px' }}>3. Villa & Hotel Project Highlights</h2>
      <p style={{ color: '#aaa', maxWidth: '750px', margin: '0 auto' }}>
        Showcasing floor-to-ceiling installations in luxury penthouses, resort villas, and corporate conference suites.
      </p>
    </section>

    {/* Section 10: Gallery CTA */}
    <section style={{ background: '#0e0e0e', padding: '50px 20px', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
      <h2 className="gold-text" style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Inspired By Our Gallery?</h2>
      <p style={{ color: '#aaa', marginBottom: '25px' }}>Let us tailor these exact drapery and net styles for your windows.</p>
      <button className="btn-gold" style={{ padding: '14px 35px' }} onClick={() => setActiveTab('contact')}>Book Measurement Visit</button>
    </section>

  </div>
);

/* ==========================================================================
   5. CONTACT PAGE (10 SECTIONS)
   ========================================================================== */
const ContactPage = ({ customerPhoto, photoPreview, onPhotoUpload, onSubmitPhoto }) => (
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
    
    {/* Section 1: Intro */}
    <section style={{ textAlign: 'center', marginBottom: '50px' }}>
      <span className="section-badge">Get In Touch</span>
      <h1 className="gold-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>Contact Jillu Curtains</h1>
      <p style={{ color: '#aaa' }}>Book a technician measurement visit or request instant price estimates.</p>
    </section>

    {/* Section 2: Interactive Appointment Booking Form */}
    <section style={{ background: '#121212', border: '1px solid #333', padding: '40px', borderRadius: '12px', marginBottom: '50px' }}>
      <h2 className="gold-text" style={{ marginBottom: '20px' }}>Schedule Free On-Site Visit</h2>
      <form style={{ display: 'grid', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          <input type="text" placeholder="Full Name" style={{ padding: '14px', background: '#080808', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          <input type="tel" placeholder="Phone Number" style={{ padding: '14px', background: '#080808', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
        </div>
        <input type="email" placeholder="Email Address" style={{ padding: '14px', background: '#080808', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
        <select style={{ padding: '14px', background: '#080808', border: '1px solid #333', color: '#aaa', borderRadius: '4px' }}>
          <option>Select Primary Interest</option>
          <option>Custom Window Drapes</option>
          <option>Mosquito Mesh Doors & Windows</option>
          <option>100% Thermal Blackout Curtains</option>
          <option>Motorized Curtain Tracks</option>
          <option>Both Curtains & Mosquito Mesh</option>
        </select>
        <textarea placeholder="Describe window counts or custom requirements..." rows="4" style={{ padding: '14px', background: '#080808', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}></textarea>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#ccc', fontSize: '0.95rem' }}>
          Attach a photo of your window or existing setup
          <input type="file" accept="image/*" onChange={onPhotoUpload} style={{ color: '#fff', paddingTop: '4px' }} />
        </label>
        {photoPreview && (
          <div style={{ border: '1px solid #d4af37', borderRadius: '8px', padding: '12px', background: '#0e0e0e' }}>
            <img src={photoPreview} alt="Uploaded preview" style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '6px' }} />
            <p style={{ color: '#d4af37', margin: '8px 0 0', fontSize: '0.9rem' }}>
              {customerPhoto?.name || 'Photo attached successfully'}
            </p>
          </div>
        )}
        <button type="button" className="btn-gold" style={{ padding: '16px', cursor: photoPreview ? 'pointer' : 'not-allowed', fontSize: '1rem', opacity: photoPreview ? 1 : 0.7 }} onClick={onSubmitPhoto} disabled={!photoPreview}>Submit Free Measurement Request</button>
      </form>
    </section>

    {/* Section 3: Direct Phone & WhatsApp Support */}
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '50px' }}>
      <div style={{ background: '#121212', padding: '25px', borderRadius: '8px', textAlign: 'center', border: '1px solid #222' }}>
        <h3 className="gold-text" style={{ margin: '0 0 8px 0' }}>📞 Phone Orders</h3>
        <p style={{ color: '#aaa', margin: 0 }}>+91 7502718156</p>
      </div>
      <div style={{ background: '#121212', padding: '25px', borderRadius: '8px', textAlign: 'center', border: '1px solid #222' }}>
        <h3 className="gold-text" style={{ margin: '0 0 8px 0' }}>✉️ Email Support</h3>
        <p style={{ color: '#aaa', margin: 0 }}>jillucurtains1@gmail.com</p>
      </div>
    </section>

    {/* Section 4: Store Hours & Studio Visit */}
    <section style={{ background: '#0e0e0e', border: '1px solid #222', padding: '30px', borderRadius: '8px', textAlign: 'center', marginBottom: '50px' }}>
      <h3 className="gold-text" style={{ marginBottom: '10px' }}>Studio Working Hours</h3>
      <p style={{ color: '#aaa', margin: 0 }}>Monday – Saturday: 10:00 AM – 6:30 PM | Sunday: By Appointment Only</p>
    </section>

    {/* Section 5: Service Location Coverage */}
    <section style={{ marginBottom: '50px', textAlign: 'center' }}>
      <h3 className="gold-text" style={{ marginBottom: '15px' }}>Service Area Coverage</h3>
      <p style={{ color: '#888', maxWidth: '700px', margin: '0 auto' }}>
        Our mobile measurement vans serve all suburban districts, residential villas, and commercial hubs within a 50-mile radius.
      </p>
    </section>

    {/* Section 6: Doorstep Swatch Inspection Guarantee */}
    <section style={{ background: '#121212', padding: '30px', borderRadius: '8px', border: '1px solid #222', textAlign: 'center', marginBottom: '50px' }}>
      <h3 className="gold-text" style={{ marginBottom: '10px' }}>Physical Fabric Hanger Inspection</h3>
      <p style={{ color: '#aaa', margin: 0 }}>Our team brings physical fabric books and aluminum net track samples straight to your residence.</p>
    </section>

    {/* Section 7: Instant Consultation Line */}
    <section style={{ textAlign: 'center', marginBottom: '50px' }}>
      <h3 className="gold-text" style={{ marginBottom: '10px' }}>Need Urgent Quotation?</h3>
      <p style={{ color: '#888' }}>WhatsApp us your approximate window measurements for an instant estimated price range.</p>
    </section>

    {/* Section 8: Safety & Hygiene Protocol */}
    <section style={{ background: '#0e0e0e', padding: '25px', borderRadius: '8px', border: '1px solid #222', textAlign: 'center', marginBottom: '50px' }}>
      <h4 className="gold-text" style={{ margin: '0 0 8px 0' }}>Clean Installation Guarantee</h4>
      <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Our installation crews use dust-catch drill attachments to leave your floors spotless.</p>
    </section>

    {/* Section 9: Reschedule Policy */}
    <section style={{ textAlign: 'center', marginBottom: '50px' }}>
      <h4 className="gold-text">Flexible Scheduling</h4>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>Easily modify or reschedule your measurement appointment up to 2 hours prior to the technician visit.</p>
    </section>

    {/* Section 10: Re-Measurement Assurance */}
    <section style={{ border: '1px solid #d4af37', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
      <p style={{ color: '#ddd', margin: 0, fontSize: '0.95rem' }}>
        <strong>100% Fit Guarantee:</strong> Zero cost re-adjustments if any curtain drop length or screen frame size needs alteration.
      </p>
    </section>

  </div>
);

export default App;