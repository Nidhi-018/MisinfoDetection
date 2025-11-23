import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Tag from '../components/Tag';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { getChallenge, submitChallengeAnswer } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Challenge.css';

const Challenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState('easy');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { showSuccess, showError } = useToast();

  const totalRounds = 10;

  useEffect(() => {
    loadNewChallenge();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer('timeout');
    }
  }, [timeLeft, isAnswered]);

  const loadNewChallenge = async () => {
    try {
      const response = await getChallenge();
      if (response && response.data) {
        setChallenge(response.data);
        setTimeLeft(30);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setResult(null);
      } else {
        showError('No challenge available');
      }
    } catch (error) {
      showError(error.message || 'Failed to load challenge');
      console.error('Challenge load error:', error);
    }
  };

  const handleAnswer = async (answer) => {
    if (isAnswered || !challenge) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    try {
      const response = await submitChallengeAnswer(challenge.id, answer);
      if (response && response.data) {
        const isCorrect = response.data.correct;

        setResult({
          correct: isCorrect,
          explanation: response.data.explanation || 'Answer processed',
          correctAnswer: response.data.correctAnswer
        });

        if (isCorrect) {
          setScore(prev => prev + (response.data.score || 100));
          setStreak(prev => prev + 1);
          showSuccess('Correct! 🎉');
        } else {
          setStreak(0);
          showError('Incorrect! 😔');
        }

        // Update difficulty based on streak
        if (streak >= 5) setDifficulty('hard');
        else if (streak >= 3) setDifficulty('medium');
        else setDifficulty('easy');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      showError(error.message || 'Failed to submit answer');
      console.error('Answer submission error:', error);
      // Reset answered state on error
      setIsAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const handleNext = () => {
    if (currentRound >= totalRounds) {
      setGameOver(true);
      setShowLeaderboard(true);
    } else {
      setCurrentRound(prev => prev + 1);
      loadNewChallenge();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentRound(1);
    setGameOver(false);
    setShowLeaderboard(false);
    setDifficulty('easy');
    loadNewChallenge();
  };

  const getDifficultyColor = () => {
    if (difficulty === 'easy') return 'success';
    if (difficulty === 'medium') return 'warning';
    return 'danger';
  };

  if (!challenge) {
    return (
      <div className="challenge-loading">
        <div className="challenge-loading-spinner"></div>
        <p>Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="challenge">
      <div className="challenge-header">
        <h1 className="challenge-title">REAL OR FAKE?</h1>
        <p className="challenge-subtitle">Test your misinformation detection skills</p>
      </div>

      {/* Game Stats */}
      <div className="challenge-stats">
        <Card className="challenge-stat-card">
          <div className="challenge-stat-label">Round</div>
          <div className="challenge-stat-value">
            {currentRound} / {totalRounds}
          </div>
        </Card>
        <Card className="challenge-stat-card">
          <div className="challenge-stat-label">Score</div>
          <div className="challenge-stat-value">{score}</div>
        </Card>
        <Card className="challenge-stat-card">
          <div className="challenge-stat-label">Streak</div>
          <div className="challenge-stat-value">🔥 {streak}</div>
        </Card>
        <Card className="challenge-stat-card">
          <div className="challenge-stat-label">Difficulty</div>
          <div className="challenge-stat-value">
            <Tag variant={getDifficultyColor()}>{difficulty.toUpperCase()}</Tag>
          </div>
        </Card>
      </div>

      {/* Timer */}
      <div className="challenge-timer">
        <ProgressBar
          value={(timeLeft / 30) * 100}
          variant={timeLeft <= 10 ? 'danger' : 'primary'}
          showLabel
        />
        <span className="challenge-timer-text">{timeLeft}s remaining</span>
      </div>

      {/* Challenge Content */}
      <Card className="challenge-content-card">
        {challenge.type === 'image' ? (
          <div className="challenge-image">
            <img src={challenge.content} alt="Challenge" />
          </div>
        ) : (
          <div className="challenge-text">
            <p>{challenge.content}</p>
          </div>
        )}

        {!isAnswered ? (
          <div className="challenge-actions">
            <Button
              variant="success"
              size="large"
              onClick={() => handleAnswer('real')}
              fullWidth
              className="challenge-button-real"
            >
              ✅ REAL
            </Button>
            <Button
              variant="danger"
              size="large"
              onClick={() => handleAnswer('fake')}
              fullWidth
              className="challenge-button-fake"
            >
              ❌ FAKE
            </Button>
          </div>
        ) : (
          <div className="challenge-result">
            <div className={`challenge-result-badge ${result.correct ? 'correct' : 'incorrect'}`}>
              {result.correct ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            <p className="challenge-explanation">{result.explanation}</p>
            <p className="challenge-correct-answer">
              Correct answer: <strong>{result.correctAnswer.toUpperCase()}</strong>
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={handleNext}
              fullWidth
            >
              {currentRound >= totalRounds ? 'View Results' : 'Next Challenge'}
            </Button>
          </div>
        )}
      </Card>

      {/* Leaderboard Modal */}
      <Modal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        title="Game Over!"
        size="medium"
      >
        <div className="challenge-leaderboard">
          <div className="challenge-final-score">
            <h2>Final Score</h2>
            <div className="challenge-final-score-value">{score}</div>
            <p>Accuracy: {Math.round((score / (totalRounds * 100)) * 100)}%</p>
          </div>
          <div className="challenge-leaderboard-actions">
            <Button variant="primary" onClick={handleRestart} fullWidth>
              Play Again
            </Button>
            <Button variant="outline" onClick={() => setShowLeaderboard(false)} fullWidth>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Challenge;

