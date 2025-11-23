"""
Analysis Routes for ML Service
Handles text, image, and multi-modal analysis requests
"""

from flask import Blueprint, request, jsonify
import os
import tempfile

from models.text_model import analyze_text_content
from models.image_model import analyze_image_content
from utils.ocr_stub import extract_text_from_image

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/analyze/text', methods=['POST'])
def analyze_text():
    """
    Analyze text content for misinformation
    
    Request body:
        {
            "text": "string to analyze"
        }
    
    Returns:
        {
            "text_analysis_score": 72,
            "sentiment": "neutral",
            "claims": [...],
            "contradictions": [...],
            "summary": "...",
            "reasons": [...]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Invalid input',
                'message': 'Text is required'
            }), 400
        
        text = data['text']
        
        if not isinstance(text, str) or len(text.strip()) == 0:
            return jsonify({
                'error': 'Invalid input',
                'message': 'Text must be a non-empty string'
            }), 400
        
        # Perform analysis
        result = analyze_text_content(text)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@analyze_bp.route('/analyze/image', methods=['POST'])
def analyze_image():
    """
    Analyze image content for misinformation
    
    Request: multipart/form-data with 'image' file
    
    Returns:
        {
            "visual_analysis_score": 80,
            "manipulation_prob": 0.12,
            "match_sources": [...],
            "ocr_text": "...",
            "reasons": [...]
        }
    """
    try:
        if 'image' not in request.files:
            return jsonify({
                'error': 'Invalid input',
                'message': 'Image file is required'
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'error': 'Invalid input',
                'message': 'No file selected'
            }), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            image_path = tmp_file.name
        
        try:
            # Extract OCR text
            ocr_text = extract_text_from_image(image_path)
            
            # Perform image analysis
            result = analyze_image_content(image_path, ocr_text)
            
            return jsonify(result), 200
            
        finally:
            # Clean up temporary file
            if os.path.exists(image_path):
                os.unlink(image_path)
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@analyze_bp.route('/analyze/multi', methods=['POST'])
def analyze_multi():
    """
    Analyze multi-modal content (text + image)
    
    Request body:
        {
            "text": "optional text",
            "image_path": "optional image path or URL",
            "url_meta": {...}
        }
    
    Returns:
        Combined analysis result with credibility_score
    """
    try:
        data = request.get_json() or {}
        
        text = data.get('text', '')
        image_path = data.get('image_path')
        url_meta = data.get('url_meta', {})
        
        results = {
            'text_analysis_score': None,
            'visual_analysis_score': None,
            'sentiment': 'unknown',
            'claims': [],
            'contradictions': [],
            'summary': '',
            'reasons': [],
            'manipulation_prob': None,
            'match_sources': [],
            'ocr_text': None,
        }
        
        # Analyze text if provided
        if text and len(text.strip()) > 0:
            text_result = analyze_text_content(text)
            results['text_analysis_score'] = text_result.get('text_analysis_score')
            results['sentiment'] = text_result.get('sentiment', 'unknown')
            results['claims'] = text_result.get('claims', [])
            results['contradictions'] = text_result.get('contradictions', [])
            results['summary'] = text_result.get('summary', '')
            results['reasons'].extend(text_result.get('reasons', []))
        
        # Analyze image if provided
        if image_path:
            # For URL-based images, download first (simplified)
            # TODO: Implement proper image download from URL
            ocr_text = None
            if os.path.exists(image_path):
                ocr_text = extract_text_from_image(image_path)
                image_result = analyze_image_content(image_path, ocr_text)
                results['visual_analysis_score'] = image_result.get('visual_analysis_score')
                results['manipulation_prob'] = image_result.get('manipulation_prob')
                results['match_sources'] = image_result.get('match_sources', [])
                results['ocr_text'] = ocr_text
                results['reasons'].extend(image_result.get('reasons', []))
        
        # Calculate combined credibility score
        credibility_score = calculate_credibility_score(results)
        results['credibility_score'] = credibility_score
        
        # Build explainability object
        results['explainability'] = {
            'top_reasons': results['reasons'][:3],
            'text_contribution': results['text_analysis_score'] if results['text_analysis_score'] else 0,
            'visual_contribution': results['visual_analysis_score'] if results['visual_analysis_score'] else 0,
        }
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

def calculate_credibility_score(results):
    """
    Calculate credibility score from multi-modal results
    Uses weighted formula: 0.6 * text_score + 0.4 * visual_score
    """
    text_score = results.get('text_analysis_score')
    visual_score = results.get('visual_analysis_score')
    
    if text_score is not None and visual_score is not None:
        return round(0.6 * text_score + 0.4 * visual_score)
    elif text_score is not None:
        return text_score
    elif visual_score is not None:
        return visual_score
    else:
        return 50  # Default neutral score

