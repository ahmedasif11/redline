import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import {
  AdminError,
  listAdminProducts,
  productUpsertSchema,
  upsertAdminProduct,
} from '@/features/admin/server';

export async function GET() {
  try {
    await requireAdmin();
    const products = await listAdminProducts();
    return NextResponse.json({ data: { products } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: { code: 'PRODUCTS_FAILED', message: 'Unable to load products' },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = productUpsertSchema.safeParse(body);
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
    return NextResponse.json({ data: { product } }, { status: 201 });
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
        error: { code: 'PRODUCT_CREATE_FAILED', message: 'Unable to create product' },
      },
      { status: 500 }
    );
  }
}
