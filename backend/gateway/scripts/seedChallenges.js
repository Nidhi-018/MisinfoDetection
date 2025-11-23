require('dotenv').config();
const { connectDB, disconnectDB } = require('../db/connection');
const challengeService = require('../db/services/challengeService');

const challenges = [
  {
    title: 'Miracle Cure Claim',
    mediaType: 'text',
    prompt: 'Scientists discover miracle cure for all diseases!',
    correctAnswer: 'fake',
    explanation: 'Claims of "miracle cures" are typically false. Real medical breakthroughs go through rigorous testing and peer review.',
    difficulty: 1,
  },
  {
    title: 'WHO Handwashing Recommendation',
    mediaType: 'text',
    prompt: 'The World Health Organization recommends washing hands regularly to prevent disease spread.',
    correctAnswer: 'real',
    explanation: 'This is a well-established public health recommendation from WHO, supported by scientific evidence.',
    difficulty: 1,
  },
  {
    title: 'Celebrity Endorsement Image',
    mediaType: 'image',
    prompt: 'A photo showing a celebrity endorsing a product',
    imageUrl: '/samples/celebrity-endorsement.jpg',
    correctAnswer: 'fake',
    explanation: 'Celebrity endorsements in images can be manipulated or taken out of context. Always verify from official sources.',
    difficulty: 2,
  },
  {
    title: 'Election Results Premature',
    mediaType: 'text',
    prompt: 'Breaking: Major election results announced before polls close!',
    correctAnswer: 'fake',
    explanation: 'Election results are never announced before polls officially close. This violates electoral procedures.',
    difficulty: 2,
  },
  {
    title: 'NASA Exoplanet Discovery',
    mediaType: 'text',
    prompt: 'NASA confirms new exoplanet discovery using James Webb Space Telescope.',
    correctAnswer: 'real',
    explanation: 'NASA regularly announces exoplanet discoveries through official channels and peer-reviewed publications.',
    difficulty: 3,
  },
  {
    title: 'Vaccine Conspiracy',
    mediaType: 'text',
    prompt: 'Vaccines contain microchips for tracking people.',
    correctAnswer: 'fake',
    explanation: 'This is a widely debunked conspiracy theory. Vaccines are thoroughly tested and do not contain tracking devices.',
    difficulty: 1,
  },
  {
    title: 'Climate Change Denial',
    mediaType: 'text',
    prompt: 'Climate change is a hoax created by scientists for funding.',
    correctAnswer: 'fake',
    explanation: 'Climate change is supported by overwhelming scientific evidence from multiple independent sources worldwide.',
    difficulty: 2,
  },
  {
    title: 'Verified News Source',
    mediaType: 'text',
    prompt: 'Reuters reports breaking news from verified sources with official statements.',
    correctAnswer: 'real',
    explanation: 'Reuters is a reputable news agency known for fact-checking and verification before publishing.',
    difficulty: 3,
  },
  {
    title: 'Deepfake Video',
    mediaType: 'image',
    prompt: 'A video showing a politician saying something controversial',
    imageUrl: '/samples/deepfake-video.jpg',
    correctAnswer: 'fake',
    explanation: 'Deepfake technology can create convincing fake videos. Always verify from official sources and check for inconsistencies.',
    difficulty: 4,
  },
  {
    title: 'Peer-Reviewed Study',
    mediaType: 'text',
    prompt: 'A study published in Nature journal after peer review shows new findings.',
    correctAnswer: 'real',
    explanation: 'Peer-reviewed publications in reputable journals like Nature undergo rigorous scientific scrutiny.',
    difficulty: 4,
  },
  {
    title: 'Social Media Rumor',
    mediaType: 'text',
    prompt: 'Unverified claim shared on social media without sources or citations.',
    correctAnswer: 'fake',
    explanation: 'Social media posts without credible sources or citations should be treated with skepticism.',
    difficulty: 1,
  },
  {
    title: 'Government Health Advisory',
    mediaType: 'text',
    prompt: 'CDC issues official health advisory based on epidemiological data.',
    correctAnswer: 'real',
    explanation: 'Government health agencies like CDC provide evidence-based recommendations from official sources.',
    difficulty: 3,
  },
  {
    title: 'Photoshopped Image',
    mediaType: 'image',
    prompt: 'An image showing unrealistic proportions or signs of manipulation',
    imageUrl: '/samples/photoshopped.jpg',
    correctAnswer: 'fake',
    explanation: 'Digital manipulation tools can create convincing fake images. Look for inconsistencies in lighting, shadows, and proportions.',
    difficulty: 3,
  },
  {
    title: 'Academic Research Paper',
    mediaType: 'text',
    prompt: 'Research paper published in Science journal with methodology and data.',
    correctAnswer: 'real',
    explanation: 'Academic research in reputable journals includes methodology, data, and peer review for verification.',
    difficulty: 4,
  },
  {
    title: 'Clickbait Headline',
    mediaType: 'text',
    prompt: 'You won\'t believe what happens next! Shocking revelation!',
    correctAnswer: 'fake',
    explanation: 'Sensationalist headlines designed to generate clicks often lack substance and credible sources.',
    difficulty: 1,
  },
];

async function seedChallenges() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Seeding challenges...');
    let created = 0;
    let skipped = 0;

    for (const challengeData of challenges) {
      try {
        // Check if challenge with same prompt exists
        const existing = await challengeService.listChallenges(1, 1, {
          prompt: challengeData.prompt,
        });

        if (existing.challenges.length > 0) {
          console.log(`Skipping duplicate: ${challengeData.title}`);
          skipped++;
          continue;
        }

        await challengeService.createChallenge(challengeData);
        created++;
        console.log(`Created: ${challengeData.title}`);
      } catch (error) {
        console.error(`Error creating challenge "${challengeData.title}":`, error.message);
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`Created: ${created} challenges`);
    console.log(`Skipped: ${skipped} duplicates`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
}

seedChallenges();

