import { NextResponse } from 'next/server';
import { parseShopSearchParams } from '@/features/catalog';
import { queryProductsAsync } from '@/features/catalog/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseShopSearchParams(searchParams);
  const products = await queryProductsAsync(filters);

  return NextResponse.json({
    data: products,
    meta: { count: products.length, filters },
  });
}
