import { useState, useEffect } from 'react';
import { fetchJson, API_BASE } from '../../_store/http';
import {
  createBanner as createBannerApi,
  updateBanner as updateBannerApi,
  deleteBanner as deleteBannerApi,
} from '@/app/admin/_store/banner';

// ============= HELPER FUNCTIONS =============
export const isTailwindGradient = value =>
  typeof value === 'string' &&
  (value.includes('from-') || value.includes('from['));

export const normalizeBanner = banner => {
  const fallbackId = banner?._id || banner?.id || `local-${Date.now()}`;
  return {
    id: fallbackId,
    _id: banner?._id || null,
    eyebrow: banner?.eyebrow || '',
    heading: banner?.heading || '',
    description: banner?.description || '',
    primaryCta: {
      label: banner?.primaryCta?.label || '',
      href: banner?.primaryCta?.href || '',
    },
    secondaryCta: {
      label: banner?.secondaryCta?.label || '',
      href: banner?.secondaryCta?.href || '',
    },
    bgColor: banner?.bgColor || '#0d0d0d',
    bgImage: banner?.bgImage || '',
    textColor: banner?.textColor || '#ffffff',
    order: banner?.order ?? 0,
    isActive: banner?.isActive ?? true,
  };
};

// Текстийн өнгийг хөрвүүлэх (#ffffff -> hex)
export const getTextColor = textColor => {
  if (!textColor) return '#ffffff';
  // Хэрэв аль хэдийн hex бол
  if (textColor.startsWith('#')) return textColor;
  // text-[#ffffff] форматаас hex-ийг салгаж авах
  const match = textColor.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : '#ffffff';
};

export const getBannerId = banner => banner?._id || banner?.id || null;
export const getPersistedId = banner => banner?._id || null;

// Зураг байвал зургийг, байхгүй бол өнгийг ашиглана
export const getBackgroundStyle = banner => {
  if (banner.bgImage) {
    return {
      backgroundImage: `url(${banner.bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {};
};

export const getOverlayStyle = banner => {
  if (banner.bgImage) return 'bg-black/30';
  if (isTailwindGradient(banner.bgColor)) {
    return `bg-gradient-to-r ${banner.bgColor}`;
  }
  return '';
};

export const getOverlayInlineStyle = banner => {
  if (banner.bgImage) return undefined;
  if (!isTailwindGradient(banner.bgColor) && banner.bgColor) {
    return { background: banner.bgColor };
  }
  return undefined;
};

// ============= CUSTOM HOOKS =============

// Admin эрх шалгах
export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let canceled = false;

    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        if (!canceled) setIsAdmin(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        if (user?.role !== 'admin') {
          if (!canceled) setIsAdmin(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Admin verification failed');
        if (!canceled) setIsAdmin(true);
      } catch (error) {
        if (!canceled) setIsAdmin(false);
      }
    };

    verifyAdmin();
    return () => {
      canceled = true;
    };
  }, []);

  return isAdmin;
};

// Banner удирдлага
export const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let canceled = false;
    const loadBanners = async () => {
      const data = await fetchJson('/api/banners', {
        fallback: { banners: [] },
      });
      const incoming = Array.isArray(data) ? data : data?.banners || [];
      if (canceled) return;
      if (incoming.length > 0) {
        setBanners(incoming.map(normalizeBanner));
        setCurrentIndex(0);
      } else {
        setBanners([]);
      }
    };
    loadBanners();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, banners.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, banners?.length]);

  const goToNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    if (banners.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = index => {
    if (banners.length === 0) return;
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return {
    banners,
    setBanners,
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrev,
    goToSlide,
  };
};

// Banner CRUD үйлдлүүд
export const useBannerActions = (banners, setBanners, setCurrentIndex) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleAddBanner = () => {
    setUploadError('');
    setIsUploading(false);
    setEditingBanner(
      normalizeBanner({
        id: `local-${Date.now()}`,
        eyebrow: '',
        heading: '',
        description: '',
        primaryCta: { label: '', href: '' },
        secondaryCta: { label: '', href: '' },
        bgColor: '#0d0d0d',
        bgImage: '',
        textColor: '#ffffff',
      })
    );
    setShowModal(true);
  };

  const handleEditBanner = banner => {
    setUploadError('');
    setIsUploading(false);
    setEditingBanner(normalizeBanner(banner));
    setShowModal(true);
  };

  const handleDeleteBanner = async (id, currentBanner) => {
    const targetId = id || getPersistedId(currentBanner);
    if (!targetId) return;

    if (confirm('Энэ banner-ийг устгах уу?')) {
      try {
        await deleteBannerApi(targetId);
      } catch (error) {
        console.error('Banner delete failed:', error);
      }

      setBanners(prev => {
        const next = prev.filter(b => getBannerId(b) !== targetId);
        setCurrentIndex(idx =>
          idx >= next.length ? Math.max(0, next.length - 1) : idx
        );
        return next.length > 0 ? next : [];
      });
    }
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;

    const payload = {
      eyebrow: editingBanner.eyebrow,
      heading: editingBanner.heading,
      description: editingBanner.description,
      primaryCta: editingBanner.primaryCta,
      secondaryCta: editingBanner.secondaryCta,
      bgColor: editingBanner.bgColor,
      bgImage: editingBanner.bgImage,
      textColor: editingBanner.textColor,
      order: editingBanner.order ?? 0,
      isActive: editingBanner.isActive ?? true,
    };

    try {
      const existingId = getPersistedId(editingBanner);
      const response = existingId
        ? await updateBannerApi(existingId, payload)
        : await createBannerApi(payload);

      const saved = normalizeBanner(
        response?.banner || response || editingBanner
      );

      setBanners(prev => {
        const exists = prev.some(b => getBannerId(b) === getBannerId(saved));
        if (exists) {
          return prev.map(b =>
            getBannerId(b) === getBannerId(saved) ? saved : b
          );
        }
        return [...prev, saved];
      });
    } catch (error) {
      console.error('Banner save failed:', error);
    } finally {
      setShowModal(false);
      setEditingBanner(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setUploadError('');
    setIsUploading(false);
  };

  return {
    showModal,
    editingBanner,
    setEditingBanner,
    isUploading,
    setIsUploading,
    uploadError,
    setUploadError,
    handleAddBanner,
    handleEditBanner,
    handleDeleteBanner,
    handleSaveBanner,
    handleCloseModal,
  };
};
