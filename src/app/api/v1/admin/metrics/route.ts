import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import { getAdminMetrics } from '@/features/admin/server';

export async function GET() {
  try {
    await requireAdmin();
    const metrics = await getAdminMetrics();
    return NextResponse.json({ data: { metrics } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'METRICS_FAILED', message: 'Unable to load metrics' } },
      { status: 500 }
    );
  }
}
