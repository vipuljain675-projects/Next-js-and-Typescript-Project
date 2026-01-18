'use client';
import React, { useState, useEffect, useContext, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import gsap from "@/lib/gsap"; // ✅ Change this line

// Rest of your Navbar code stays the same...

const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
  });
  
  const auth = useContext(AuthContext); 
  const { unreadCount } = useChat();
  const router = useRouter();
  const pathname = usePathname();

  // GSAP Refs
  const navbarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Navbar entrance animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navbarRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "elastic.out(1, 0.5)"
      });

      gsap.from(searchBarRef.current, {
        scaleX: 0,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  // Dropdown animation
  useEffect(() => {
    if (showUserMenu && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { 
          opacity: 0, 
          y: -20,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [showUserMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    const closeMenu = () => setShowUserMenu(false);
    if (showUserMenu) {
      window.addEventListener("click", closeMenu);
    }
    return () => window.removeEventListener("click", closeMenu);
  }, [showUserMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Search button pulse animation
    gsap.to(".search-button", {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    const params = new URLSearchParams();
    if (searchQuery.location) params.set("location", searchQuery.location);
    if (searchQuery.checkIn) params.set("checkIn", searchQuery.checkIn);
    if (searchQuery.checkOut) params.set("checkOut", searchQuery.checkOut);
    router.push(`/?${params.toString()}`);
  };

  const userInitial = auth?.user?.firstName ? auth.user.firstName.charAt(0).toUpperCase() : "";

  return (
    <header ref={navbarRef} className="fixed-top bg-white border-bottom navbar-shadow" style={{ zIndex: 1030 }}>
      <div className="container-fluid px-4 px-md-5">
        <div className="d-flex justify-content-between align-items-center" style={{ height: "80px" }}>
          
          {/* Logo with GSAP ref */}
          <div ref={logoRef}>
            <Link href="/" className="text-decoration-none d-flex align-items-center logo-container">
              <svg width="32" height="32" fill="#FF385C" viewBox="0 0 32 32" className="logo-icon">
                <path d="M16 1c2 0 3.46 1.67 3.46 3.33 0 2-1.46 3.67-3.46 3.67s-3.46-1.67-3.46-3.67C12.54 2.67 14 1 16 1zm0 24.5c-1.86 0-3.54.5-5.17 1.42L8.7 19.1a7.34 7.34 0 0 1-.45-2.6c0-3.91 3.18-7.08 7.08-7.08h1.34c3.91 0 7.08 3.18 7.08 7.08 0 .9-.17 1.78-.45 2.6l-2.13 7.82c-1.63-.92-3.31-1.42-5.17-1.42z"/>
              </svg>
              <span className="ms-2 fw-bold fs-4 d-none d-sm-inline logo-text" style={{ color: "#FF385C" }}>airbnb</span>
            </Link>
          </div>

          {/* Top Navigation */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <Link href="/" className={`nav-tab-link-top ${pathname === '/' ? 'active' : ''}`}>Homes</Link>
            <Link href="/experiences" className="nav-tab-link-top">Experiences</Link>
            <Link href="/services" className="nav-tab-link-top">Services</Link>
          </div>

          {/* Right Menu */}
          <div className="d-flex align-items-center gap-3">
            {auth?.isLoggedIn ? (
               <div className="d-none d-md-flex align-items-center gap-3">
                  <Link href="/bookings" className="nav-link-animated text-dark fw-semibold small text-decoration-none">Trips</Link>
                  <Link href="/wishlist" className="nav-link-animated text-dark fw-semibold small text-decoration-none">Saved</Link>
                  
                  <Link 
                    href="/messages" 
                    className="nav-link-animated text-dark fw-semibold small text-decoration-none position-relative"
                  >
                    <i className="bi bi-chat-dots fs-6 me-1"></i>
                    Messages
                    {unreadCount > 0 && (
                      <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger badge-pulse"
                        style={{ fontSize: '9px', padding: '2px 5px', marginLeft: '-10px' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  <Link href="/host" className="nav-link-animated text-dark fw-semibold small text-decoration-none">Switch to Host</Link>
               </div>
            ) : (
              <Link href="/host" className="nav-tab-link-top d-none d-md-block">Airbnb your home</Link>
            )}
            
            {/* User Menu */}
            <div className="position-relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-menu-pill d-flex align-items-center gap-2 border rounded-pill bg-white py-1 px-2"
              >
                <i className="bi bi-list fs-5 ms-1"></i>
                <div 
                  className="rounded-circle bg-dark d-flex align-items-center justify-content-center text-white fw-bold user-avatar" 
                  style={{ width: "32px", height: "32px", fontSize: "14px" }}
                >
                  {auth?.isLoggedIn ? userInitial : <i className="bi bi-person-fill"></i>}
                </div>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div 
                  ref={dropdownRef}
                  className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border py-2 text-start dropdown-menu-custom" 
                  style={{ width: "240px", zIndex: 1050 }}
                >
                  {auth?.isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 fw-bold small text-secondary">Hi, {auth.user?.firstName}</div>
                      <Link href="/messages" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">
                        <i className="bi bi-chat-dots me-2"></i>
                        Messages
                        {unreadCount > 0 && (
                          <span className="badge bg-danger ms-2" style={{ fontSize: '10px' }}>
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/bookings" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">My Trips</Link>
                      <Link href="/wishlist" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">Saved Homes</Link>
                      <hr className="my-2" />
                      <Link href="/host/my-listings" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">Manage Listings</Link>
                      <Link href="/host/manage-bookings" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">Handle Requests</Link>
                      <hr className="my-2" />
                      <button onClick={auth.logout} className="dropdown-item-custom d-block w-100 text-start px-4 py-2 border-0 bg-transparent text-danger fw-bold">Log out</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark fw-bold">Log in</Link>
                      <Link href="/signup" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">Sign up</Link>
                      <hr className="my-2" />
                      <Link href="/host" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">Airbnb your home</Link>
                      <Link href="/help" className="dropdown-item-custom d-block px-4 py-2 text-decoration-none text-dark">Help Center</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar with GSAP ref */}
        <div ref={searchBarRef} className="pb-3 d-flex justify-content-center">
          <form onSubmit={handleSearch} className="search-bar-container w-100" style={{ maxWidth: '850px' }}>
            <div className="search-section search-section-start">
              <label className="search-label">Where</label>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search destinations"
                onChange={(e) => setSearchQuery({...searchQuery, location: e.target.value})}
              />
            </div>
            <div className="search-section search-section-middle">
              <label className="search-label">Check in</label>
              <input 
                type="date" 
                className="search-input"
                onChange={(e) => setSearchQuery({...searchQuery, checkIn: e.target.value})}
              />
            </div>
            <div className="search-section search-section-middle">
              <label className="search-label">Check out</label>
              <input 
                type="date" 
                className="search-input"
                onChange={(e) => setSearchQuery({...searchQuery, checkOut: e.target.value})}
              />
            </div>
            <button type="submit" className="search-button me-2">
              <i className="bi bi-search text-white"></i>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Navbar;