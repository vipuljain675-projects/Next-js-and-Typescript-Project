'use client';
import React, { useEffect, useState, useContext, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Home } from "@/types";
import { AuthContext } from "@/context/AuthContext";
import Badge from "@/components/UI/Badge";
import Link from "next/link";
import gsap from "@/lib/gsap"; // ✅ Import from our utility

export default function HomeList() {
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchParams = useSearchParams();
  const auth = useContext(AuthContext);
  const router = useRouter();

  const cardsAnimated = useRef(false);

  const getImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800";
    if (url.startsWith("http")) return url;
    
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';
    return `${baseURL}${url}`;
  };

  const fetchHomes = async (pageNum: number, isInitial = false) => {
    if (isInitial) setLoading(true);
    const location = searchParams.get("location") || "";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";

    try {
      let endpoint = `/homes?page=${pageNum}`;
      if (location || (checkIn && checkOut)) {
        endpoint = `/search?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&page=${pageNum}`;
      }

      const res = await api.get(endpoint);
      const fetchedHomes = res.data.homes || [];

      setHomes(prev => isInitial ? fetchedHomes : [...prev, ...fetchedHomes]);
      setHasMore(res.data.hasNextPage);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    cardsAnimated.current = false;
    fetchHomes(1, true);
  }, [searchParams]);

  // 🎨 GSAP Animation - Now works in production!
  useEffect(() => {
    if (homes.length > 0 && !loading && !cardsAnimated.current) {
      cardsAnimated.current = true;
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const cards = document.querySelectorAll('.home-card');
        
        if (cards.length > 0) {
          gsap.set(cards, { opacity: 0, y: 30 });
          
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform,opacity"
          });
        }
      }, 50);
    }
  }, [homes, loading]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHomes(nextPage, false);
    
    const btn = document.querySelector('.load-more-btn');
    if (btn) {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  const handleWishlist = async (e: React.MouseEvent, homeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth?.isLoggedIn) {
      router.push('/login');
      return;
    }

    const heartBtn = e.currentTarget as HTMLButtonElement;
    
    gsap.to(heartBtn, {
      scale: 1.2,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    try {
      await api.post('/favourite-list', { homeId });
      
      const heartPath = heartBtn.querySelector('.heart-path');
      if (heartPath) {
        gsap.to(heartPath, {
          fill: '#FF385C',
          duration: 0.3,
          ease: "power2.out"
        });
      }
      
      showToast('❤️ Saved to wishlist!');
    } catch (err) {
      showToast('❌ Failed to save', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: white;
      padding: 12px 24px;
      border-radius: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-weight: 600;
      z-index: 9999;
      border: 2px solid ${type === 'error' ? '#ff4444' : '#FF385C'};
    `;
    document.body.appendChild(toast);
    
    gsap.fromTo(toast,
      { opacity: 0, y: -20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3,
        onComplete: () => {
          setTimeout(() => {
            gsap.to(toast, {
              opacity: 0,
              y: -20,
              duration: 0.3,
              onComplete: () => toast.remove()
            });
          }, 2000);
        }
      }
    );
  };

  if (loading && page === 1) {
    return (
      <div className="text-center mt-5 pt-5" style={{ marginTop: "180px" }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading homes...</span>
        </div>
        <p className="mt-3 text-muted">Finding amazing places for you...</p>
      </div>
    );
  }

  return (
    <main className="container-fluid px-4 px-md-5" style={{ marginTop: "180px" }}>
      <div className="row g-3 mb-5">
        {homes.map((home) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2-4" key={home._id}>
            <div className="home-card">
              <div className="position-relative overflow-hidden mb-2 image-wrapper">
                <Link href={`/homes/${home._id}?${searchParams.toString()}`} target="_blank">
                  <img
                    src={getImageUrl(home.photoUrl[0])}
                    className="home-image"
                    alt={home.houseName}
                    loading="lazy"
                  />
                </Link>
                
                {home.rating >= 4.8 && <Badge type="favourite" />}
                
                <button 
                  className="wishlist-btn"
                  aria-label="Add to wishlist"
                  onClick={(e) => handleWishlist(e, home._id)}
                >
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path 
                      d="M16 28C16 28 3.5 21 3.5 11.5C3.5 9.99737 4.10625 8.55516 5.18544 7.47595C6.26464 6.39676 7.70685 5.79051 9.20948 5.79051C11.5893 5.79051 13.6612 7.1825 14.8284 9.28832C15.0548 9.72273 15.5103 10 16 10C16.4897 10 16.9452 9.72273 17.1716 9.28832C18.3388 7.1825 20.4107 5.79051 22.7905 5.79051C24.2931 5.79051 25.7354 6.39676 26.8146 7.47595C27.8937 8.55516 28.5 9.99737 28.5 11.5C28.5 21 16 28 16 28Z" 
                      stroke="#fff"
                      strokeWidth="2"
                      fill="rgba(0,0,0,0.5)"
                      className="heart-path"
                    />
                  </svg>
                </button>
              </div>
              
              <Link href={`/homes/${home._id}`} target="_blank" className="text-decoration-none text-dark d-block mt-2">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="fw-bold text-truncate" style={{ flex: "1 1 auto", paddingRight: "8px" }}>
                    {home.location}
                  </div>
                  <div className="d-flex align-items-center gap-1" style={{ flex: "0 0 auto" }}>
                    <i className="bi bi-star-fill"></i>
                    <span className="fw-semibold" style={{ fontSize: "15px" }}>{home.rating.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-secondary small mb-1">{home.houseName}</div>
                <div className="mt-2">
                  <span className="fw-bold" style={{ fontSize: "15px" }}>₹{home.price.toLocaleString()}</span>
                  <span className="text-secondary" style={{ fontSize: "15px" }}> night</span>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center my-5 pb-5">
          <button className="btn load-more-btn rounded-pill px-5 py-2 fw-bold" onClick={handleLoadMore}>
            Show more
          </button>
        </div>
      )}

      {homes.length === 0 && !loading && (
        <div className="text-center py-5">
          <div className="empty-state">
            <i className="bi bi-house-x-fill" style={{ fontSize: '64px', color: '#ddd' }}></i>
            <h3 className="text-secondary mt-3">No homes found</h3>
            <p className="text-muted">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </main>
  );
}