import { calcHealthScore, calcLeaderboardScore } from '../src/services/score.service';

describe('Score Calculator', () => {
  describe('calcHealthScore', () => {
    it('should give high score for recent, popular, well-documented repo', () => {
      const score = calcHealthScore({
        stars: 1000,
        forks: 200,
        issues: 5,
        description: 'A great open source project with full features',
        topics: ['typescript', 'react', 'dashboard'],
        commits: 500,
        contributors: 15,
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      });
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give low score for stale, undocumented repo', () => {
      const score = calcHealthScore({
        stars: 2,
        forks: 0,
        issues: 30,
        description: '',
        topics: [],
        commits: 5,
        contributors: 1,
        lastUpdated: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // over a year ago
      });
      expect(score).toBeLessThan(30);
    });

    it('should always return value between 0 and 100', () => {
      const cases = [
        { stars: 0, forks: 0, issues: 1000, description: '', topics: [], commits: 0, contributors: 1, lastUpdated: '2010-01-01' },
        { stars: 1000000, forks: 500000, issues: 0, description: 'Amazing', topics: ['a', 'b', 'c'], commits: 10000, contributors: 500, lastUpdated: new Date().toISOString() },
      ];
      cases.forEach(repo => {
        const score = calcHealthScore(repo);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('calcLeaderboardScore', () => {
    it('should give high score for active developer', () => {
      const score = calcLeaderboardScore({
        contributions: 4000,
        streak: 300,
        publicRepos: 100,
        followers: 3000,
        totalStars: 8000,
      });
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give low score for inactive developer', () => {
      const score = calcLeaderboardScore({
        contributions: 10,
        streak: 1,
        publicRepos: 2,
        followers: 5,
        totalStars: 0,
      });
      expect(score).toBeLessThan(10);
    });

    it('should return 0-100 range', () => {
      const score1 = calcLeaderboardScore({ contributions: 0, streak: 0, publicRepos: 0, followers: 0, totalStars: 0 });
      const score2 = calcLeaderboardScore({ contributions: 99999, streak: 999, publicRepos: 9999, followers: 99999, totalStars: 999999 });
      expect(score1).toBe(0);
      expect(score2).toBe(100);
    });
  });
});
