import { NextResponse } from 'next/server';
import {
  AuthError,
  requireUser,
  updateProfileName,
  profileUpdateSchema,
} from '@/features/auth/server';

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid profile',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const updated = await updateProfileName(user.id, parsed.data.name);
    return NextResponse.json({ data: { user: updated } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'PROFILE_UPDATE_FAILED', message: 'Unable to update' } },
      { status: 500 }
    );
  }
}
