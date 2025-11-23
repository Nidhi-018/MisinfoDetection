# ML Service - Misinformation Detection

Python Flask microservice for analyzing text and images for misinformation.

## Setup

### Local Development

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. (Optional) Install Tesseract OCR for text extraction:
   - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
   - macOS: `brew install tesseract`
   - Windows: Download from [Tesseract Wiki](https://github.com/UB-Mannheim/tesseract/wiki)

3. Run the service:
```bash
python app.py
```

The service will start on `http://localhost:5000`

### Docker

```bash
docker build -t ml-service .
docker run -p 5000:5000 ml-service
```

## Replacing Stubs with Real ML Models

### Text Analysis

1. Install transformers library:
```bash
pip install transformers torch
```

2. Update `models/text_model.py`:
```python
from transformers import pipeline

# Load model
classifier = pipeline("text-classification", 
                     model="facebook/roberta-base")

def analyze_text_content(text: str) -> Dict:
    # Use real model
    result = classifier(text)
    # Process result and return analysis
```

3. For better misinformation detection, fine-tune on a dataset:
   - Use datasets like FakeNewsNet, LIAR, or custom dataset
   - Fine-tune using HuggingFace Trainer

### Image Analysis

1. Install CLIP and related libraries:
```bash
pip install clip-by-openai torch torchvision
```

2. Update `models/image_model.py`:
```python
import clip
import torch

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def analyze_image_content(image_path: str, ocr_text: str = None) -> Dict:
    # Load and preprocess image
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    
    # Use CLIP for similarity matching
    # Use specialized models for manipulation detection
```

3. For manipulation detection, use specialized models:
   - Deepfake detection: FaceForensics++, DFDC
   - Image forensics: DetectGAN, SPAN

### GPU Support

For GPU-accelerated inference:

1. Install CUDA-enabled PyTorch:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

2. Ensure CUDA is available:
```python
import torch
print(torch.cuda.is_available())  # Should be True
```

3. Use GPU in models:
```python
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
```

## API Endpoints

- `POST /ml/analyze/text` - Analyze text content
- `POST /ml/analyze/image` - Analyze image content
- `POST /ml/analyze/multi` - Multi-modal analysis
- `GET /health` - Health check

## Testing

Run tests with pytest:
```bash
pytest tests/ -v
```

With coverage:
```bash
pytest tests/ --cov=models --cov=utils -v
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `DEBUG` - Enable debug mode (default: false)

