"""
Text Analysis Model
Provides misinformation detection for text content

TODO: Replace with real ML model:
1. Install transformers: pip install transformers torch
2. Load a pre-trained model:
   from transformers import pipeline
   classifier = pipeline("text-classification", model="facebook/roberta-base")
3. Use the model to analyze text and extract features
4. Fine-tune on misinformation detection dataset if available
"""

import re
from typing import Dict, List

def analyze_text_content(text: str) -> Dict:
    """
    Analyze text content for misinformation indicators
    
    Args:
        text: Text content to analyze
        
    Returns:
        Dictionary with analysis results:
        {
            "text_analysis_score": int (0-100),
            "sentiment": str,
            "claims": List[str],
            "contradictions": List[str],
            "summary": str,
            "reasons": List[str]
        }
    """
    # Rule-based heuristics (stub implementation)
    # TODO: Replace with real ML model
    
    score = 50  # Base score
    reasons = []
    claims = []
    contradictions = []
    
    text_lower = text.lower()
    
    # Check for clickbait indicators
    clickbait_keywords = ['miracle', 'cure', 'shocking', 'you won\'t believe', 'doctors hate', 'secret']
    clickbait_count = sum(1 for keyword in clickbait_keywords if keyword in text_lower)
    if clickbait_count > 0:
        score -= clickbait_count * 10
        reasons.append(f'Detected {clickbait_count} clickbait indicator(s)')
        claims.append('Contains clickbait language')
    
    # Check for extreme claims
    extreme_keywords = ['never', 'always', 'all', 'everyone', 'nobody', 'impossible']
    extreme_count = sum(1 for keyword in extreme_keywords if keyword in text_lower)
    if extreme_count > 2:
        score -= 15
        reasons.append('Contains extreme/absolute claims')
        claims.append('Uses absolute language')
    
    # Check for emotional manipulation
    emotional_keywords = ['urgent', 'act now', 'limited time', 'exclusive', 'breaking']
    emotional_count = sum(1 for keyword in emotional_keywords if keyword in text_lower)
    if emotional_count > 0:
        score -= emotional_count * 5
        reasons.append('Contains emotional manipulation language')
    
    # Check for medical claims without evidence
    medical_keywords = ['cure', 'treat', 'heal', 'prevent', 'guaranteed']
    medical_count = sum(1 for keyword in medical_keywords if keyword in text_lower)
    if medical_count > 0 and 'study' not in text_lower and 'research' not in text_lower:
        score -= 20
        reasons.append('Medical claims without cited research')
        claims.append('Unsubstantiated medical claims')
    
    # Check sentiment (simple rule-based)
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful']
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'worst']
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        sentiment = 'positive'
    elif negative_count > positive_count:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    # Check for contradictions (simple pattern matching)
    contradiction_patterns = [
        (r'never.*always', 'Contradictory statements'),
        (r'all.*none', 'Contradictory statements'),
    ]
    
    for pattern, description in contradiction_patterns:
        if re.search(pattern, text_lower):
            contradictions.append(description)
            score -= 10
    
    # Clamp score between 0 and 100
    score = max(0, min(100, score))
    
    # Generate summary (simplified)
    summary = f"Text analysis completed. Score: {score}/100. "
    if score < 40:
        summary += "High risk of misinformation detected."
    elif score < 70:
        summary += "Moderate risk detected."
    else:
        summary += "Low risk - content appears credible."
    
    # TODO: Use real ML model for better analysis:
    # from transformers import pipeline
    # classifier = pipeline("text-classification", model="facebook/roberta-base")
    # result = classifier(text)
    # score = calculate_score_from_model(result)
    
    return {
        'text_analysis_score': score,
        'sentiment': sentiment,
        'claims': claims[:5],  # Limit to top 5
        'contradictions': contradictions,
        'summary': summary,
        'reasons': reasons[:5],  # Top 5 reasons
    }

