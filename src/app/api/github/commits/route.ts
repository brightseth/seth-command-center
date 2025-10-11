import { NextRequest, NextResponse } from 'next/server';
import { getProjectCommitSummary } from '@/lib/github';
import { captureApiError } from '@/lib/sentry';

/**
 * GET /api/github/commits?project=Abraham&days=7
 *
 * Fetches recent GitHub commits for a project
 * SECURITY: No API keys exposed to client, all server-side
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project name required' },
        { status: 400 }
      );
    }

    // Fetch commits (token loaded from env inside getProjectCommitSummary)
    const summary = await getProjectCommitSummary(project, days);

    // SECURITY: Never expose the GitHub token in response
    return NextResponse.json({
      success: true,
      data: {
        project,
        days,
        ...summary
      }
    });

  } catch (error) {
    console.error('GitHub commits API error:', error);
    captureApiError(error as Error, {
      endpoint: '/api/github/commits',
      method: 'GET'
    });

    return NextResponse.json(
      { success: false, error: 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}
