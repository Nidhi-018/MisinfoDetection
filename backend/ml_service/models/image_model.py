"""
Image Analysis Model
Provides misinformation detection for image content

TODO: Replace with real ML models:
1. For manipulation detection: Use CLIP or specialized deepfake detection models
2. For reverse image search: Use image hashing and similarity matching
3. Install required libraries:
   pip install clip-by-openai torch torchvision
   pip install imagehash pillow opencv-python
4. Load pre-trained models and use for analysis
"""

import os
import cv2
import numpy as np
from PIL import Image
from typing import Dict, List, Optional

def analyze_image_content(image_path: str, ocr_text: Optional[str] = None) -> Dict:
    """
    Analyze image content for misinformation indicators
    
    Args:
        image_path: Path to image file
        ocr_text: Optional OCR-extracted text from image
        
    Returns:
        Dictionary with analysis results:
        {
            "visual_analysis_score": int (0-100),
            "manipulation_prob": float (0-1),
            "match_sources": List[Dict],
            "ocr_text": str,
            "reasons": List[str]
        }
    """
    score = 50  # Base score
    reasons = []
    manipulation_prob = 0.0
    match_sources = []
    
    try:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            return {
                'visual_analysis_score': 0,
                'manipulation_prob': 1.0,
                'match_sources': [],
                'ocr_text': ocr_text or '',
                'reasons': ['Failed to load image'],
            }
        
        # 1. Check image quality and blurriness
        blur_score = detect_blur(img)
        if blur_score < 100:  # Low variance indicates blur
            score -= 10
            reasons.append('Image appears blurry or low quality')
            manipulation_prob += 0.1
        
        # 2. Check for manipulation indicators (simplified)
        # TODO: Replace with real deepfake/manipulation detection model
        # Using simple heuristics for now
        manipulation_indicators = detect_manipulation_indicators(img)
        if manipulation_indicators > 0:
            manipulation_prob += 0.2 * manipulation_indicators
            score -= manipulation_indicators * 15
            reasons.append(f'Detected {manipulation_indicators} potential manipulation indicator(s)')
        
        # 3. Check metadata (if available)
        metadata_issues = check_metadata(image_path)
        if metadata_issues:
            score -= 10
            reasons.append('Metadata inconsistencies detected')
            manipulation_prob += 0.15
        
        # 4. Reverse image search (mock using image hashing)
        # TODO: Replace with real reverse image search API
        match_sources = perform_reverse_search(image_path)
        if len(match_sources) > 0:
            score += 10  # Boost for verified sources
            reasons.append(f'Found {len(match_sources)} matching source(s)')
        else:
            reasons.append('No matching sources found')
        
        # Clamp values
        manipulation_prob = min(1.0, max(0.0, manipulation_prob))
        score = max(0, min(100, score))
        
        return {
            'visual_analysis_score': score,
            'manipulation_prob': round(manipulation_prob, 3),
            'match_sources': match_sources,
            'ocr_text': ocr_text or '',
            'reasons': reasons[:5],  # Top 5 reasons
        }
        
    except Exception as e:
        return {
            'visual_analysis_score': 0,
            'manipulation_prob': 1.0,
            'match_sources': [],
            'ocr_text': ocr_text or '',
            'reasons': [f'Error analyzing image: {str(e)}'],
        }

def detect_blur(img: np.ndarray) -> float:
    """
    Detect blur using Laplacian variance
    Higher variance = sharper image
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var

def detect_manipulation_indicators(img: np.ndarray) -> int:
    """
    Simple heuristics for manipulation detection
    TODO: Replace with real deepfake/manipulation detection model
    
    Returns count of detected indicators
    """
    indicators = 0
    
    # Check for compression artifacts (simplified)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
    
    # Unusual edge patterns might indicate manipulation
    if edge_density < 0.05 or edge_density > 0.5:
        indicators += 1
    
    # Check for color inconsistencies (simplified)
    # In production, use more sophisticated methods
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    saturation = hsv[:, :, 1]
    if np.std(saturation) < 10:  # Very uniform saturation might indicate manipulation
        indicators += 1
    
    return indicators

def check_metadata(image_path: str) -> bool:
    """
    Check image metadata for inconsistencies
    Returns True if issues found
    """
    try:
        from PIL.ExifTags import TAGS
        img = Image.open(image_path)
        exif = img._getexif()
        
        if exif is None:
            return True  # Missing EXIF data might be suspicious
        
        # Check for common inconsistencies
        # TODO: Implement more sophisticated metadata analysis
        
        return False
    except Exception:
        return True  # Error reading metadata

def perform_reverse_search(image_path: str) -> List[Dict]:
    """
    Perform reverse image search using image hashing
    Compares against sample images in samples/ directory
    
    TODO: Replace with real reverse image search API
    """
    try:
        import imagehash
        
        # Calculate hash of input image
        img = Image.open(image_path)
        input_hash = imagehash.average_hash(img)
        
        # Compare with sample images
        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        matches = []
        
        if os.path.exists(samples_dir):
            for filename in os.listdir(samples_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    sample_path = os.path.join(samples_dir, filename)
                    try:
                        sample_img = Image.open(sample_path)
                        sample_hash = imagehash.average_hash(sample_img)
                        
                        # Calculate hamming distance
                        hamming_distance = input_hash - sample_hash
                        
                        # If similar (hamming distance < 10), consider it a match
                        if hamming_distance < 10:
                            matches.append({
                                'source': f'Sample Image: {filename}',
                                'url': f'/samples/{filename}',
                                'match_confidence': 1.0 - (hamming_distance / 64.0),
                            })
                    except Exception:
                        continue
        
        return matches[:3]  # Return top 3 matches
        
    except ImportError:
        # imagehash not available, return empty
        return []
    except Exception:
        return []

