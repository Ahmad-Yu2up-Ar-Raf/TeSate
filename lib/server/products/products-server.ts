// lib/server/Products/Products-server.ts
import { Product, ProductResponse } from '@/type/product-type';

const BASE_URL = 'https://dummyjson.com/';

/**
 * fetchAllProducts
 */
export async function fetchAllProducts(base_url: string): Promise<Product[]> {
  const url = base_url;
  const res = await fetch(url);
  ``;

  if (!res.ok) {
    throw new Error(`fetchAllProducts failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as ProductResponse | null;
  if (!json || !Array.isArray(json.products)) {
    throw new Error('fetchAllProducts: unexpected response shape');
  }

  return json.products;
}

/**
 * Fetch single product by ID
 */
export async function fetchProductById(id: number): Promise<Product> {
  const url = `${BASE_URL}/products/${id}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch product`);
    }

    const data = (await response.json()) as Product;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch product ${id}: ${error.message}`);
    }
    throw new Error(`Failed to fetch product ${id}: Unknown error`);
  }
}
