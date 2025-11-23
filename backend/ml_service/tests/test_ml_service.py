"""
Unit Tests for ML Service
Tests analysis endpoints and model functions
"""

import pytest
import os
import tempfile
from PIL import Image
import numpy as np

from models.text_model import analyze_text_content
from models.image_model import analyze_image_content
from utils.ocr_stub import extract_text_from_image

class TestTextModel:
    """Tests for text analysis model"""
    
    def test_analyze_text_returns_required_keys(self):
        """Test that text analysis returns all required keys"""
        text = "This is a test text about vaccines."
        result = analyze_text_content(text)
        
        assert 'text_analysis_score' in result
        assert 'sentiment' in result
        assert 'claims' in result
        assert 'contradictions' in result
        assert 'summary' in result
        assert 'reasons' in result
        
        assert isinstance(result['text_analysis_score'], int)
        assert 0 <= result['text_analysis_score'] <= 100
        assert result['sentiment'] in ['positive', 'negative', 'neutral']
        assert isinstance(result['claims'], list)
        assert isinstance(result['contradictions'], list)
        assert isinstance(result['reasons'], list)
    
    def test_analyze_text_clickbait_detection(self):
        """Test that clickbait text is detected"""
        clickbait_text = "Miracle cure discovered! Doctors hate this one trick!"
        result = analyze_text_content(clickbait_text)
        
        assert result['text_analysis_score'] < 50  # Should have lower score
        assert len(result['reasons']) > 0
    
    def test_analyze_text_empty_input(self):
        """Test handling of empty text"""
        result = analyze_text_content("")
        assert 'text_analysis_score' in result

class TestImageModel:
    """Tests for image analysis model"""
    
    def test_analyze_image_returns_required_keys(self):
        """Test that image analysis returns all required keys"""
        # Create a simple test image
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
            img = Image.new('RGB', (100, 100), color='red')
            img.save(tmp_file.name)
            image_path = tmp_file.name
        
        try:
            result = analyze_image_content(image_path)
            
            assert 'visual_analysis_score' in result
            assert 'manipulation_prob' in result
            assert 'match_sources' in result
            assert 'ocr_text' in result
            assert 'reasons' in result
            
            assert isinstance(result['visual_analysis_score'], int)
            assert 0 <= result['visual_analysis_score'] <= 100
            assert 0.0 <= result['manipulation_prob'] <= 1.0
            assert isinstance(result['match_sources'], list)
            assert isinstance(result['reasons'], list)
        finally:
            os.unlink(image_path)
    
    def test_analyze_image_invalid_path(self):
        """Test handling of invalid image path"""
        result = analyze_image_content('/nonexistent/image.png')
        assert result['visual_analysis_score'] == 0
        assert result['manipulation_prob'] == 1.0

class TestOCR:
    """Tests for OCR functionality"""
    
    def test_ocr_extract_text(self):
        """Test OCR text extraction"""
        # Create a simple image with text (simplified test)
        # In real tests, use actual images with text
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
            img = Image.new('RGB', (200, 100), color='white')
            img.save(tmp_file.name)
            image_path = tmp_file.name
        
        try:
            text = extract_text_from_image(image_path)
            # OCR may or may not work depending on Tesseract availability
            assert isinstance(text, str)
        finally:
            os.unlink(image_path)

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

