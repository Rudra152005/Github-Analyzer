import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env';
import { User } from './src/models/User';
import { Repository } from './src/models/Repository';
import { Report } from './src/models/Report';

async function clean() {
  await mongoose.connect(env!.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const seededUsernames = ['sarahcodes', 'devmaster', 'codewizard', 'alexjohnson'];

  // Find user IDs of seeded users
  const seededUsers = await User.find({ username: { $in: seededUsernames } }).select('_id').lean();
  const seededUserIds = seededUsers.map(u => String(u._id));

  // 1. Delete seeded users
  const userResult = await User.deleteMany({ username: { $in: seededUsernames } });
  console.log(`🧹 Deleted ${userResult.deletedCount} seeded users.`);

  // 2. Delete repositories linked to those user IDs or starting with 'r'
  const repoResult = await Repository.deleteMany({
    $or: [
      { userId: { $in: seededUserIds } },
      { githubId: { $in: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] } },
      { fullName: { $regex: /^(alexjohnson|sarahcodes|devmaster|codewizard)\//i } }
    ]
  });
  console.log(`🧹 Deleted ${repoResult.deletedCount} repositories associated with seeded data.`);

  // 3. Delete reports linked to seeded users
  const reportResult = await Report.deleteMany({ userId: { $in: seededUserIds } });
  console.log(`🧹 Deleted ${reportResult.deletedCount} reports.`);

  console.log('🎉 Database cleaned successfully!');
  await mongoose.disconnect();
}

clean().catch((err) => {
  console.error('Clean script failed:', err);
  throw err;
});
