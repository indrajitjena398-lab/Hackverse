export interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  location: string | null;
  email: string | null;
  htmlUrl: string;
  createdAt: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  updatedAt: string;
  topics: string[];
  inferredSkills: string[];
}

export interface VerifiedSkill {
  name: string;
  category: 'core_language' | 'framework' | 'domain' | 'infrastructure' | 'cybersecurity';
  masteryLevel: 'Mastered' | 'Advanced' | 'Proficient';
  confidenceScore: number;
  evidenceRepos: string[];
  primaryLanguage: string;
  provenanceTag: string;
}

export interface LanguageDistribution {
  language: string;
  repoCount: number;
  percentage: number;
  color: string;
}

export interface GitHubVerificationReport {
  user: GitHubUserProfile;
  totalReposScanned: number;
  repositories: GitHubRepository[];
  verifiedSkills: VerifiedSkill[];
  languages: LanguageDistribution[];
  verificationIndex: number; // 0 - 100
  auditHash: string;
  scannedAt: string;
}
