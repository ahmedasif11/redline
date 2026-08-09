import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import {
  AdminError,
  deleteAdminProduct,
  productUpsertSchema,
  upsertAdminProduct,
} from '@/features/admin/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = productUpsertSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid product payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const product = await upsertAdminProduct(parsed.data);
    return NextResponse.json({ data: { product } });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    console.error(error);
    return NextResponse.json(
      {
        error: { code: 'PRODUCT_UPDATE_FAILED', message: 'Unable to update product' },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await deleteAdminProduct(id);
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: { code: 'PRODUCT_DELETE_FAILED', message: 'Unable to delete product' },
      },
      { status: 500 }
    );
  }
}
