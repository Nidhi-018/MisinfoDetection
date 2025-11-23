const mongoose = require('mongoose');
const contentService = require('../db/services/contentService');
const feedbackService = require('../db/services/feedbackService');
const userService = require('../db/services/userService');
const alertService = require('../db/services/alertService');

/**
 * Get dashboard analytics (admin only)
 */
async function getDashboardStats(req, res, next) {
  try {
    // Get total analyses
    const totalAnalyses = await contentService.listContent(1, 1);
    const totalAnalysesCount = totalAnalyses.pagination.total;

    // Get most common risk levels
    const allContent = await contentService.listContent(1, 10000); // Get all for aggregation
    const riskLevelCounts = {
      low: 0,
      moderate: 0,
      high: 0,
    };
    
    allContent.content.forEach((content) => {
      if (content.riskLevel in riskLevelCounts) {
        riskLevelCounts[content.riskLevel]++;
      }
    });

    // Get daily activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentContent = await contentService.listContent(1, 10000, {
      createdAt: { $gte: sevenDaysAgo },
    });

    // Group by day
    const dailyActivity = {};
    recentContent.content.forEach((content) => {
      const date = content.createdAt.toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    // Get top users by XP
    const topUsers = await userService.listUsers(1, 10, {});
    const topUsersFormatted = topUsers.users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: Math.floor(user.xp / 100) + 1,
      badges: user.badges,
    })).sort((a, b) => b.xp - a.xp);

    res.json({
      totalAnalyses: totalAnalysesCount,
      mostCommonRiskLevels: riskLevelCounts,
      dailyActivity,
      topUsers: topUsersFormatted.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get game statistics
 */
async function getGameStats(req, res, next) {
  try {
    const userId = req.user?.userId || req.query.userId;
    
    if (!userId) {
      return res.json({
        totalChallenges: 0,
        userStats: null,
        leaderboardPosition: null,
      });
    }

    // Get total challenges
    const challengeService = require('../db/services/challengeService');
    const allChallenges = await challengeService.listChallenges(1, 1);
    const totalChallenges = allChallenges.pagination.total;

    // Convert userId to ObjectId if valid
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    // Get user stats
    const user = await userService.getUserById(userObjectId);
    const leaderboardService = require('../db/services/leaderboardService');
    const leaderboardEntry = await leaderboardService.getLeaderboardByUserId(userObjectId);

    // Get leaderboard position
    const topPlayers = await leaderboardService.getTopPlayers(1000);
    const userPosition = topPlayers.findIndex((entry) => 
      entry.user?._id?.toString() === userObjectId.toString() || entry.user?.toString() === userObjectId.toString()
    );

    res.json({
      totalChallenges,
      userStats: user ? {
        xp: user.xp,
        level: Math.floor(user.xp / 100) + 1,
        badges: user.badges,
      } : null,
      leaderboardPosition: userPosition >= 0 ? userPosition + 1 : null,
      totalPlayers: topPlayers.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getGameStats,
};

