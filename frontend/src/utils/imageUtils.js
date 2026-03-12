// Smart image positioning utility for better face visibility
export const getSmartImagePosition = (aspectRatio, imageType = 'player') => {
  if (imageType === 'player') {
    // For player photos, focus on face area
    if (aspectRatio > 1.5) {
      // Very wide image - center horizontally, focus on upper area
      return 'center 20%';
    } else if (aspectRatio > 1.2) {
      // Landscape image - slight upper focus
      return 'center 25%';
    } else if (aspectRatio > 0.9) {
      // Square-ish image - center with slight upper bias
      return 'center 30%';
    } else if (aspectRatio > 0.6) {
      // Portrait image - focus on upper center for face
      return 'center 15%';
    } else {
      // Very tall portrait - focus on upper area
      return 'center 10%';
    }
  }
  
  return 'center center';
};

// Enhanced image loading with smart positioning
export const createSmartImageLoader = (imgElement, onLoad) => {
  const handleLoad = () => {
    const aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
    const smartPosition = getSmartImagePosition(aspectRatio, 'player');
    imgElement.style.objectPosition = smartPosition;
    
    // Add subtle enhancement filters
    imgElement.style.filter = 'brightness(1.05) contrast(1.1) saturate(1.05)';
    
    if (onLoad) onLoad(imgElement, aspectRatio);
  };
  
  if (imgElement.complete) {
    handleLoad();
  } else {
    imgElement.addEventListener('load', handleLoad);
  }
};