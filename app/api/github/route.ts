import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  const repos = req.nextUrl.searchParams.get("repos");

  if (!user) {
    return NextResponse.json({ error: "user parameter required." }, { status: 400 });
  }

  try {
    if (repos) {
      const repoRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "TerminalPortfolio/1.0",
          },
          next: { revalidate: 300 },
        }
      );

      if (!repoRes.ok) {
        return NextResponse.json({ error: "GitHub repos lookup failed." }, { status: repoRes.status });
      }

      const repoData = await repoRes.json();
      const normalized = Array.isArray(repoData)
        ? repoData.map((repo: {
            name: string;
            stargazers_count: number;
            description: string | null;
          }) => ({
            name: repo.name,
            stargazers_count: repo.stargazers_count,
            description: repo.description,
          }))
        : [];

      return NextResponse.json(normalized);
    }

    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "TerminalPortfolio/1.0",
        },
        next: { revalidate: 300 },
      }
    );

    if (!userRes.ok) {
      return NextResponse.json({ error: "GitHub user not found." }, { status: userRes.status });
    }

    const data = await userRes.json();
    return NextResponse.json({
      login: data.login,
      name: data.name,
      bio: data.bio,
      location: data.location,
      company: data.company,
      followers: data.followers,
      following: data.following,
      public_repos: data.public_repos,
    });
  } catch {
    return NextResponse.json({ error: "GitHub service unavailable." }, { status: 503 });
  }
}
