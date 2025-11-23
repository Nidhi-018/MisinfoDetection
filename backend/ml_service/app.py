"""
ML Service for Misinformation Detection
Flask application providing ML analysis endpoints

TODO: Replace stubs with real ML models:
- Text analysis: Use HuggingFace transformers (see models/text_model.py)
- Image analysis: Use CLIP or YOLO models (see models/image_model.py)
- Multi-modal: Combine text and image models
"""

from flask import Flask
from flask_cors import CORS
import os

from routes.analyze import analyze_bp

app = Flask(__name__)
CORS(app)  # Allow CORS for gateway communication

# Register blueprints
app.register_blueprint(analyze_bp, url_prefix='/ml')

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'service': 'ml_service'}

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return {
        'service': 'ML Service for Misinformation Detection',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'analyze_text': '/ml/analyze/text',
            'analyze_image': '/ml/analyze/image',
            'analyze_multi': '/ml/analyze/multi',
        }
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)

