import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import FileUploadBox from '../components/FileUploadBox';
import Loader from '../components/Loader';
import ScoreCircle from '../components/ScoreCircle';
import Tag from '../components/Tag';
import AlertBanner from '../components/AlertBanner';
import ProgressBar from '../components/ProgressBar';
import { analyzeText, analyzeImage, analyzeURL, reportMisinformation } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getUserId } from '../utils/auth';
import './Analyze.css';

const Analyze = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [imageFile, setImageFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { showSuccess, showError } = useToast();

  const handleImageSelect = (file) => {
    setImageFile(file);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let result;
      if (activeTab === 'image' && imageFile) {
        result = await analyzeImage(imageFile);
      } else if (activeTab === 'text' && textInput.trim()) {
        result = await analyzeText(textInput);
      } else if (activeTab === 'url' && urlInput.trim()) {
        result = await analyzeURL(urlInput);
      } else {
        showError('Please provide content to analyze');
        setIsAnalyzing(false);
        return;
      }

      setAnalysisResult(result.data);
      showSuccess('Analysis completed successfully!');
    } catch (error) {
      showError('Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReport = async () => {
    if (!analysisResult?.id) {
      showError('No analysis result to report');
      return;
    }

    try {
      await reportMisinformation(analysisResult.id, 'User reported as misinformation');
      showSuccess('Misinformation reported. Thank you for your contribution!');
    } catch (error) {
      showError('Failed to report misinformation. Please try again.');
      console.error('Report error:', error);
    }
  };

  const handleSave = () => {
    // Analysis is automatically saved to history by the backend
    // This is just a confirmation message
    showSuccess('Analysis saved to history!');
  };

  const getRiskVariant = (riskLevel) => {
    if (riskLevel === 'Safe') return 'success';
    if (riskLevel === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <div className="analyze">
      <div className="analyze-header">
        <h1 className="analyze-title">Analyze Content</h1>
        <p className="analyze-subtitle">
          Upload images, paste text, or enter URLs to verify credibility
        </p>
      </div>

      {/* Tabs */}
      <div className="analyze-tabs">
        <button
          className={`analyze-tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('image');
            setAnalysisResult(null);
          }}
        >
          🖼️ Image
        </button>
        <button
          className={`analyze-tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('text');
            setAnalysisResult(null);
          }}
        >
          📝 Text
        </button>
        <button
          className={`analyze-tab ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('url');
            setAnalysisResult(null);
          }}
        >
          🔗 URL
        </button>
      </div>

      {/* Upload Section */}
      <Card className="analyze-upload-card">
        {activeTab === 'image' && (
          <div className="analyze-upload-content">
            <FileUploadBox
              onFileSelect={handleImageSelect}
              accept="image/*"
            />
            {imageFile && (
              <div className="analyze-file-preview">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="analyze-preview-image"
                />
                <p className="analyze-file-name">{imageFile.name}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="analyze-upload-content">
            <textarea
              className="analyze-text-input"
              placeholder="Paste or type the text content you want to verify..."
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setAnalysisResult(null);
              }}
              rows={8}
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="analyze-upload-content">
            <input
              type="url"
              className="analyze-url-input"
              placeholder="Enter URL to verify (e.g., https://example.com/article)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setAnalysisResult(null);
              }}
            />
          </div>
        )}

        <div className="analyze-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleAnalyze}
            disabled={isAnalyzing || (activeTab === 'image' && !imageFile) || 
                     (activeTab === 'text' && !textInput.trim()) || 
                     (activeTab === 'url' && !urlInput.trim())}
            fullWidth
          >
            {isAnalyzing ? 'Analyzing...' : 'Scan Now'}
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="analyze-loading-card">
          <Loader size="large" message="Analyzing your content..." />
        </Card>
      )}

      {/* Results Section */}
      {analysisResult && !isAnalyzing && (
        <div className="analyze-results">
          {/* Credibility Score */}
          <Card className="analyze-score-card">
            <div className="analyze-score-header">
              <h2 className="analyze-score-title">Credibility Score</h2>
              <Tag variant={getRiskVariant(analysisResult.riskLevel)} size="large">
                {analysisResult.riskLevel} Risk
              </Tag>
            </div>
            <div className="analyze-score-content">
              <ScoreCircle score={analysisResult.credibilityScore} size={150} />
              <div className="analyze-score-info">
                <p className="analyze-score-description">
                  {analysisResult.credibilityScore >= 75
                    ? 'This content appears to be highly credible.'
                    : analysisResult.credibilityScore >= 50
                    ? 'This content has moderate credibility concerns.'
                    : 'This content shows significant credibility issues.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Explainable AI Section */}
          <Card className="analyze-explanation-card">
            <h2 className="analyze-section-title">Analysis Breakdown</h2>

            {analysisResult.flagged && (
              <AlertBanner type="warning" className="analyze-alert">
                This content has been flagged for potential misinformation.
              </AlertBanner>
            )}

            <div className="analyze-explanation-section">
              <h3 className="analyze-subsection-title">Why it was flagged</h3>
              <p className="analyze-explanation-text">
                {analysisResult.explanation.whyFlagged}
              </p>
            </div>

            <div className="analyze-explanation-section">
              <h3 className="analyze-subsection-title">Supporting Evidence</h3>
              <ul className="analyze-evidence-list">
                {analysisResult.explanation.supportingEvidence.map((evidence, idx) => (
                  <li key={idx} className="analyze-evidence-item">
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>

            <div className="analyze-explanation-section">
              <h3 className="analyze-subsection-title">Modality Breakdown</h3>
              <div className="analyze-modalities">
                {analysisResult.explanation.modalities.text && (
                  <div className="analyze-modality">
                    <div className="analyze-modality-header">
                      <span className="analyze-modality-name">Text Analysis</span>
                      <span className="analyze-modality-score">
                        {analysisResult.explanation.modalities.text.score}%
                      </span>
                    </div>
                    <ProgressBar
                      value={analysisResult.explanation.modalities.text.score}
                      variant="primary"
                    />
                  </div>
                )}
                {analysisResult.explanation.modalities.image && (
                  <div className="analyze-modality">
                    <div className="analyze-modality-header">
                      <span className="analyze-modality-name">Image Analysis</span>
                      <span className="analyze-modality-score">
                        {analysisResult.explanation.modalities.image.score}%
                      </span>
                    </div>
                    <ProgressBar
                      value={analysisResult.explanation.modalities.image.score}
                      variant="primary"
                    />
                  </div>
                )}
                {analysisResult.explanation.modalities.metadata && (
                  <div className="analyze-modality">
                    <div className="analyze-modality-header">
                      <span className="analyze-modality-name">Metadata Analysis</span>
                      <span className="analyze-modality-score">
                        {analysisResult.explanation.modalities.metadata.score}%
                      </span>
                    </div>
                    <ProgressBar
                      value={analysisResult.explanation.modalities.metadata.score}
                      variant="primary"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="analyze-explanation-section">
              <h3 className="analyze-subsection-title">Fact-Check References</h3>
              <div className="analyze-references">
                {analysisResult.explanation.factCheckReferences.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="analyze-reference"
                  >
                    <span className="analyze-reference-source">{ref.source}</span>
                    <Tag variant={ref.verdict === 'True' ? 'success' : 'warning'}>
                      {ref.verdict}
                    </Tag>
                  </a>
                ))}
              </div>
            </div>

            <div className="analyze-explanation-section">
              <h3 className="analyze-subsection-title">Similar Past Cases</h3>
              <div className="analyze-similar-cases">
                {analysisResult.explanation.similarCases.map((caseItem) => (
                  <div key={caseItem.id} className="analyze-similar-case">
                    <span className="analyze-similar-title">{caseItem.title}</span>
                    <span className="analyze-similar-similarity">
                      {Math.round(caseItem.similarity * 100)}% similar
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="analyze-result-actions">
            <Button variant="danger" onClick={handleReport}>
              Report Misinformation
            </Button>
            <Button variant="secondary" onClick={handleSave}>
              Save to History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyze;

