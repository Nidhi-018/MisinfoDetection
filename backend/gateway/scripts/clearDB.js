require('dotenv').config();
const { connectDB, disconnectDB } = require('../db/connection');
const Content = require('../db/models/Content');
const Feedback = require('../db/models/Feedback');
const Challenge = require('../db/models/Challenge');
const Leaderboard = require('../db/models/Leaderboard');
const Alert = require('../db/models/Alerts');
const User = require('../db/models/User');

async function clearDB() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Confirm before clearing
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('⚠️  WARNING: This will delete ALL data. Are you sure? (yes/no): ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      await disconnectDB();
      process.exit(0);
    }

    console.log('Clearing database...');

    // Delete all documents from each collection
    const results = {
      users: await User.deleteMany({}),
      content: await Content.deleteMany({}),
      feedback: await Feedback.deleteMany({}),
      challenges: await Challenge.deleteMany({}),
      leaderboard: await Leaderboard.deleteMany({}),
      alerts: await Alert.deleteMany({}),
    };

    console.log('\n✅ Database cleared!');
    console.log('Deleted:');
    console.log(`  - Users: ${results.users.deletedCount}`);
    console.log(`  - Content: ${results.content.deletedCount}`);
    console.log(`  - Feedback: ${results.feedback.deletedCount}`);
    console.log(`  - Challenges: ${results.challenges.deletedCount}`);
    console.log(`  - Leaderboard: ${results.leaderboard.deletedCount}`);
    console.log(`  - Alerts: ${results.alerts.deletedCount}`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    await disconnectDB();
    process.exit(1);
  }
}

clearDB();

