'use client';

import { useAdmin, useBanners, useBannerActions } from './banner/bannerUtils';
import {
  BannerControls,
  BannerContent,
  NavigationButtons,
  PaginationDots,
  EmptyBanner,
} from './banner/BannerUI';
import { BannerModal } from './banner/BannerModel';

export default function HeroBanners() {
  const isAdmin = useAdmin();

  const {
    banners,
    setBanners,
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrev,
    goToSlide,
  } = useBanners();

  const {
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
  } = useBannerActions(banners, setBanners, setCurrentIndex);

  const hasBanners = banners.length > 0;
  const currentBanner = hasBanners ? banners[currentIndex] || banners[0] : null;

  if (!hasBanners && !isAdmin) {
    return null;
  }

  return (
    <>
      <section className='relative min-h-[600px] overflow-hidden border-b border-[#0d0d0d]'>
        <BannerControls
          isAdmin={isAdmin}
          hasBanners={hasBanners}
          currentBanner={currentBanner}
          onAdd={handleAddBanner}
          onEdit={handleEditBanner}
          onDelete={id => handleDeleteBanner(id, currentBanner)}
        />

        {hasBanners ? (
          <>
            <BannerContent banner={currentBanner} />
            <NavigationButtons onPrev={goToPrev} onNext={goToNext} />
            <PaginationDots
              banners={banners}
              currentIndex={currentIndex}
              onGoToSlide={goToSlide}
            />
          </>
        ) : (
          <EmptyBanner isAdmin={isAdmin} onAdd={handleAddBanner} />
        )}
      </section>

      <BannerModal
        show={showModal}
        banner={editingBanner}
        onBannerChange={setEditingBanner}
        onSave={handleSaveBanner}
        onClose={handleCloseModal}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        uploadError={uploadError}
        setUploadError={setUploadError}
        banners={banners}
      />
    </>
  );
}
