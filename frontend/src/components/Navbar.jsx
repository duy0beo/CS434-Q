import React, { useState, useEffect, useRef } from 'react';

const SocialIcon = ({ type }) => {
    const icons = {
        facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>,
        twitter: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>,
        instagram: <> <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect> <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path> <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line> </>
    };
    return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[type]}</svg>;
};

export default function Navbar() {
    const [activeSection, setActiveSection] = useState('home');
    const navContainerRef = useRef(null);

    const handleScroll = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        const navElement = navContainerRef.current;
        if (targetElement && navElement) {
            const navHeight = navElement.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const handleScrollSpy = () => {
            const navHeight = navContainerRef.current?.offsetHeight || 100;
            const scrollPadding = 5; 
            const scrollY = window.scrollY;
            
            let currentSectionId = '';
            
            for (const section of sections) {
                const sectionTop = section.offsetTop - navHeight - scrollPadding;
                if (scrollY >= sectionTop) {
                    currentSectionId = section.id;
                } else {
                    break; 
                }
            }

            if (currentSectionId === '' && scrollY < (sections[0]?.offsetTop || 500)) {
                 setActiveSection('home');
            } else {
                 setActiveSection(currentSectionId);
            }
        };

        window.addEventListener('scroll', handleScrollSpy);
        return () => window.removeEventListener('scroll', handleScrollSpy);
    }, []);
    
    const socialLinkStyle = { color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.3)', textDecoration: 'none', transition: 'background-color 0.3s' };
    const navLinkStyle = { color: "white", textDecoration: "none", padding: "8px 25px", fontWeight: '500', fontSize: '17px', display: 'inline-block', cursor: 'pointer', transition: 'background-color 0.3s, color 0.3s', borderRadius: '30px' };
    const activeNavLinkStyle = { ...navLinkStyle, backgroundColor: '#00aaff', color: 'white' };

    return (
        <div ref={navContainerRef} style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '20px 8px', backgroundColor: 'transparent' }}>
             <nav style={{ background: "rgba(13, 26, 46, 0.95)", backdropFilter: 'blur(10px)', color: "#fff", padding: "2px px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
                <div style={{ display: "flex", alignItems: 'center', gap: "15px", paddingLeft: '15px' }}>
                    <a href="#home" onClick={(e) => handleScroll(e, 'home')} style={activeSection === 'home' ? activeNavLinkStyle : navLinkStyle}>Trang Chủ</a>
                    <a href="#about" onClick={(e) => handleScroll(e, 'about')} style={activeSection === 'about' ? activeNavLinkStyle : navLinkStyle}>Giới Thiệu</a>
                    <a href="#rooms" onClick={(e) => handleScroll(e, 'rooms')} style={activeSection === 'rooms' ? activeNavLinkStyle : navLinkStyle}>Phòng</a>
                    <a href="#posts" onClick={(e) => handleScroll(e, 'posts')} style={activeSection === 'posts' ? activeNavLinkStyle : navLinkStyle}>Bài Viết</a>
                    <a href="#gallery" onClick={(e) => handleScroll(e, 'gallery')} style={activeSection === 'gallery' ? activeNavLinkStyle : navLinkStyle}>Thư Viện Ảnh</a>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', paddingRight: '15px' }}>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}><SocialIcon type="facebook" /></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}><SocialIcon type="twitter" /></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}><SocialIcon type="instagram" /></a>
                </div>
            </nav>
        </div>
    );
}