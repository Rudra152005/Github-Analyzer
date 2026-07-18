import { Request, Response } from 'express';
import { Repository } from '../models/Repository';
import { User } from '../models/User';
import { reviewRepo } from '../services/gemini.service';
import { fetchRepoContentsForAI } from '../services/github.service';
import { AppError } from '../middleware/errorHandler';
import { decrypt } from '../utils/encryption';

export async function getAIReview(req: Request, res: Response): Promise<void> {
  const { repoId } = req.params;
  const repo = await Repository.findById(repoId);
  if (!repo) throw new AppError('Repository not found', 404);

  // Verify ownership
  if (repo.userId !== req.session.userId) {
    const user = await User.findById(req.session.userId);
    if (!user || String(user._id) !== repo.userId) {
      throw new AppError('Unauthorized', 403);
    }
  }

  // Check cache first!
  if (repo.aiReview) {
    try {
      const parsed = JSON.parse(repo.aiReview);
      res.json({ review: parsed });
      return;
    } catch {
      // If parsing fails, proceed to generate a fresh one
    }
  }

  // Fetch token and username for API integration
  const user = await User.findById(req.session.userId);
  if (!user) throw new AppError('User not found', 404);

  const token = decrypt(user.githubAccessToken);
  let aiData = null;

  if (token && token !== 'mock_github_token_for_seeding') {
    const ownerName = repo.fullName.split('/')[0] || user.username || '';
    aiData = await fetchRepoContentsForAI(token, ownerName, repo.name);
  }

  const reviewRaw = await reviewRepo({
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stars,
    forks: repo.forks,
    issues: repo.issues,
    topics: repo.topics,
    healthScore: repo.healthScore,
    readme: aiData?.readme,
    files: aiData?.files,
    commitMsgs: aiData?.commitMsgs,
  });

  // Try parsing to verify it's valid JSON
  try {
    const parsed = JSON.parse(reviewRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    repo.aiReview = JSON.stringify(parsed);
    await repo.save();
    res.json({ review: parsed });
  } catch (err) {
    // If Gemini returned non-JSON/raw string, compile fallback structured response
    const fallbackReview = {
      strengths: ['Clear project purpose', 'Proper primary language configuration'],
      weaknesses: ['Missing unit tests or verification steps', 'Readme could be expanded'],
      suggestions: [
        'Write unit tests using standard frameworks',
        'Add a license and contribution guidelines',
        'Configure GitHub Actions for automated linting'
      ],
      valueAssessment: reviewRaw.trim()
    };
    repo.aiReview = JSON.stringify(fallbackReview);
    await repo.save();
    res.json({ review: fallbackReview });
  }
}
