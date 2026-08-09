import { NextResponse } from 'next/server';
import {
  getProductBySlugAsync,
  getRelatedProductsAsync,
} from '@/features/catalog/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Product "${slug}" not found`,
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: product,
    meta: { related: await getRelatedProductsAsync(product) },
  });
}
