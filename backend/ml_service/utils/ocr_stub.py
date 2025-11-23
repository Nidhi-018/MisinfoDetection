"""
OCR Utility
Extracts text from images using Tesseract OCR

TODO: If Tesseract is not available, returns empty string
In production, ensure Tesseract is installed:
- Ubuntu/Debian: sudo apt-get install tesseract-ocr
- macOS: brew install tesseract
- Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
"""

import os
from typing import Optional

def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from image using OCR
    
    Args:
        image_path: Path to image file
        
    Returns:
        Extracted text string (empty if OCR fails or unavailable)
    """
    try:
        import pytesseract
        from PIL import Image
        
        # Check if image exists
        if not os.path.exists(image_path):
            return ''
        
        # Open image
        img = Image.open(image_path)
        
        # Extract text using Tesseract
        text = pytesseract.image_to_string(img)
        
        # Clean up text
        text = text.strip()
        
        return text
        
    except ImportError:
        # pytesseract not installed
        print('Warning: pytesseract not available. OCR functionality disabled.')
        return ''
    except Exception as e:
        # OCR failed
        print(f'Warning: OCR extraction failed: {str(e)}')
        return ''

