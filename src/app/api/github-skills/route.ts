import { NextRequest, NextResponse } from 'next/server';
import { 
  GitHubUserProfile, 
  GitHubRepository, 
  VerifiedSkill, 
  LanguageDistribution, 
  GitHubVerificationReport 
} from '@/lib/types/github';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  Java: '#b07219',
  Solidity: '#AA6746',
  Shell: '#89e051',
  PostgreSQL: '#336791',
};

// Map known patterns in repositories to industry-recognized technical skills
function inferSkillsFromRepo(repo: {
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
}): string[] {
  const skills = new Set<string>();
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();

  // Language based
  if (repo.language) {
    skills.add(repo.language);
    if (repo.language === 'TypeScript') {
      skills.add('React / Next.js');
      skills.add('Full-Stack Web Architecture');
    }
    if (repo.language === 'JavaScript') {
      skills.add('Modern JavaScript (ES6+)');
    }
    if (repo.language === 'Python') {
      skills.add('Data Science & Scripting');
    }
  }

  // Domain & keywords
  if (text.includes('cyber') || text.includes('security') || text.includes('fdia')) {
    skills.add('Cybersecurity & Threat Detection');
    skills.add('Industrial IoT / Smart Grid Security');
  }

  if (text.includes('smartgrid') || text.includes('smart-grid') || text.includes('grid')) {
    skills.add('Smart Grid Power Systems');
  }

  if (text.includes('bitcoin') || text.includes('blockchain') || text.includes('crypto')) {
    skills.add('Blockchain & Cryptographic Protocols');
  }

  if (text.includes('supabase') || text.includes('postgres') || text.includes('sql') || text.includes('db')) {
    skills.add('Relational Databases (PostgreSQL)');
    skills.add('Supabase BaaS Architecture');
  }

  if (text.includes('hackathon') || text.includes('sih') || text.includes('hackverse')) {
    skills.add('Rapid Prototyping & System Design');
    skills.add('Autonomous Career Intelligence');
  }

  if (text.includes('robo') || text.includes('robot')) {
    skills.add('Embedded Systems & Robotics');
  }

  return Array.from(skills);
}

function extractUsername(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed === 'https://github.com' || trimmed === 'https://github.com/' || trimmed === 'http://github.com' || trimmed === 'http://github.com/') {
    return '';
  }
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
  if (match && match[1]) return match[1];
  const cleaned = trimmed.replace(/^https?:\/\//i, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
  if (cleaned.toLowerCase() === 'github.com') return '';
  return cleaned;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawParam = searchParams.get('username') || '';
  const targetUser = extractUsername(rawParam);
  const token = searchParams.get('token') || process.env.GITHUB_TOKEN || '';

  if (!targetUser) {
    return NextResponse.json({ success: false, error: 'Please provide a valid GitHub username to scan.' }, { status: 400 });
  }

  return handleGitHubScan(targetUser, token);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawParam = body.username || '';
    const targetUser = extractUsername(rawParam);
    const token = body.token || process.env.GITHUB_TOKEN || '';

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Please provide a valid GitHub username to scan.' }, { status: 400 });
    }

    return handleGitHubScan(targetUser, token);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON request payload' }, { status: 400 });
  }
}

async function handleGitHubScan(username: string, token: string) {
  const headers: Record<string, string> = {
    'User-Agent': 'AURA-Career-OS-GitHub-Verification-Engine',
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 1. Fetch GitHub User Profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ success: false, error: `GitHub user "${username}" not found` }, { status: 404 });
      }
      if (userRes.status === 401 || userRes.status === 403) {
        return NextResponse.json({ 
          success: false, 
          error: 'GitHub API authentication failed or rate limit exceeded. Verify token permissions.' 
        }, { status: userRes.status });
      }
      throw new Error(`GitHub API returned status ${userRes.status}`);
    }
    const userData = await userRes.json();

    // 2. Fetch User's Repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers }
    );
    if (!reposRes.ok) {
      throw new Error(`Failed to fetch repositories for ${username}`);
    }
    const rawRepos = await reposRes.json();

    // 3. Transform Repositories & Infer Skills
    const languageCounts: Record<string, number> = {};
    const skillRepoMap: Record<string, { repos: string[]; lang: string; category: VerifiedSkill['category'] }> = {};

    interface RawGitHubRepo {
      id: number;
      name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      updated_at: string;
      topics?: string[];
    }

    const repositories: GitHubRepository[] = (rawRepos as RawGitHubRepo[]).map((r) => {
      const lang = r.language || 'Documentation / Config';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;

      const inferred = inferSkillsFromRepo({
        name: r.name,
        description: r.description,
        language: r.language,
        topics: r.topics || [],
      });

      inferred.forEach((skill) => {
        if (!skillRepoMap[skill]) {
          let category: VerifiedSkill['category'] = 'core_language';
          if (skill.includes('Security') || skill.includes('FDIA')) category = 'cybersecurity';
          else if (skill.includes('React') || skill.includes('Next') || skill.includes('Database')) category = 'framework';
          else if (skill.includes('IoT') || skill.includes('Grid') || skill.includes('Blockchain')) category = 'domain';
          else if (skill.includes('Architecture') || skill.includes('Prototyping')) category = 'infrastructure';

          skillRepoMap[skill] = { repos: [], lang: r.language || 'Multi-language', category };
        }
        if (!skillRepoMap[skill].repos.includes(r.name)) {
          skillRepoMap[skill].repos.push(r.name);
        }
      });

      return {
        id: r.id,
        name: r.name,
        description: r.description,
        htmlUrl: r.html_url,
        language: r.language,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        updatedAt: r.updated_at,
        topics: r.topics || [],
        inferredSkills: inferred,
      };
    });

    // 4. Calculate Language Distribution Percentages
    const totalCounted = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
    const languages: LanguageDistribution[] = Object.entries(languageCounts)
      .map(([lang, count]) => ({
        language: lang,
        repoCount: count,
        percentage: Math.round((count / totalCounted) * 100),
        color: LANGUAGE_COLORS[lang] || '#818cf8',
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // 5. Structure Verified Skills with Confidence & Provenance
    const verifiedSkills: VerifiedSkill[] = Object.entries(skillRepoMap).map(([name, meta]) => {
      const repoWeight = meta.repos.length;
      let masteryLevel: VerifiedSkill['masteryLevel'] = 'Proficient';
      let confidence = 75;

      if (repoWeight >= 3) {
        masteryLevel = 'Mastered';
        confidence = 96;
      } else if (repoWeight === 2) {
        masteryLevel = 'Advanced';
        confidence = 88;
      }

      return {
        name,
        category: meta.category,
        masteryLevel,
        confidenceScore: confidence,
        evidenceRepos: meta.repos,
        primaryLanguage: meta.lang,
        provenanceTag: `[VERIFIED_GITHUB_CODE:${meta.repos.slice(0, 2).join('+')}]`,
      };
    }).sort((a, b) => b.confidenceScore - a.confidenceScore);

    // 6. Overall Verification Index
    const verificationIndex = Math.min(
      98,
      Math.max(60, 60 + repositories.length * 2 + (userData.public_repos > 5 ? 10 : 5))
    );

    // Deterministic audit hash
    const auditHash = `0x${Math.abs(
      repositories.reduce((acc, r) => acc + r.id, userData.id)
    ).toString(16).padStart(12, '0')}`;

    const report: GitHubVerificationReport = {
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        location: userData.location,
        email: userData.email,
        htmlUrl: userData.html_url,
        createdAt: userData.created_at,
      },
      totalReposScanned: repositories.length,
      repositories,
      verifiedSkills,
      languages,
      verificationIndex,
      auditHash,
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: unknown) {
    console.error('Error in GitHub skill verification scan:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to scan GitHub profile' },
      { status: 500 }
    );
  }
}
