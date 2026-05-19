import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

const variantInclude = {
  attributeLinks: {
    include: {
      attributeValue: { include: { attribute: true } },
    },
  },
} as const;

export const productFullInclude = {
  variants: { include: variantInclude },
  images: true,
} as const;

export type ProductLoaded = Prisma.ProductGetPayload<{ include: typeof productFullInclude }>;

function dec(d: Prisma.Decimal | null | undefined): number | null {
  if (d == null) return null;
  return Number(d);
}

export function mapProductToHttp(p: ProductLoaded) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    brandId: p.brandId,
    categoryId: p.categoryId,
    basePrice: dec(p.basePrice),
    active: p.active,
    createdAt: p.createdAt.toISOString(),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: dec(v.price),
      stock: v.stock,
      active: v.active,
      attributes: v.attributeLinks.map((link) => ({
        name: link.attributeValue.attribute.displayName,
        value: link.attributeValue.value,
        attributeValueId: link.attributeValueId,
      })),
    })),
    images: p.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        sortOrder: i.sortOrder,
        variantId: i.variantId,
      })),
  };
}

export async function listProductsPublic(params: {
  attributeValueIds: string[];
  inStockOnly: boolean;
  categoryId?: string;
  excludeProductId?: string;
  limit?: number;
}): Promise<ReturnType<typeof mapProductToHttp>[]> {
  const { attributeValueIds, inStockOnly, categoryId, excludeProductId, limit } = params;

  let where: Prisma.ProductWhereInput = { active: true };

  if (categoryId) {
    where = { ...where, categoryId };
  }
  if (excludeProductId) {
    where = { ...where, id: { not: excludeProductId } };
  }

  if (attributeValueIds.length > 0) {
    const idList = attributeValueIds.map((id) => Prisma.sql`${id}::uuid`);
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT p.id::text AS id
      FROM products p
      INNER JOIN product_variants v ON v.product_id = p.id
      INNER JOIN variant_attribute_values vav ON vav.variant_id = v.id
      WHERE p.active = true
        AND vav.attribute_value_id IN (${Prisma.join(idList)})
        ${inStockOnly ? Prisma.sql`AND v.stock > 0` : Prisma.empty}
    `;
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return [];
    where = { ...where, id: { in: ids } };
  } else if (inStockOnly) {
    where = {
      ...where,
      variants: { some: { stock: { gt: 0 } } },
    };
  }

  const take = limit != null && limit > 0 ? Math.min(limit, 50) : undefined;

  const products = await prisma.product.findMany({
    where,
    include: productFullInclude,
    orderBy: { createdAt: "desc" },
    ...(take ? { take } : {}),
  });

  return products.map(mapProductToHttp);
}

export async function listProductsAdmin(): Promise<ReturnType<typeof mapProductToHttp>[]> {
  const products = await prisma.product.findMany({
    include: productFullInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProductToHttp);
}

export async function getProductById(id: string, opts?: { activeOnly?: boolean }) {
  const p = await prisma.product.findFirst({
    where: { id, ...(opts?.activeOnly ? { active: true } : {}) },
    include: productFullInclude,
  });
  return p ? mapProductToHttp(p) : null;
}

type VariantInput = {
  sku: string;
  price?: number | null;
  stock: number;
  attributes?: string[];
};

type ImageInput = { imageUrl: string; sortOrder?: number | null; variantId?: string | null };

export async function createProduct(body: {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  basePrice?: number | null;
  variants?: VariantInput[];
  images?: ImageInput[];
}) {
  const brand = await prisma.brand.findUnique({ where: { id: body.brandId } });
  const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
  if (!brand) throw new Error("Brand not found");
  if (!category) throw new Error("Category not found");

  const productId = randomUUID();
  const slug = generateSlug(body.name);
  const basePrice =
    body.basePrice != null ? new Prisma.Decimal(body.basePrice) : new Prisma.Decimal(0);

  const variants = body.variants ?? [];
  const images = body.images ?? [];

  await prisma.product.create({
    data: {
      id: productId,
      name: body.name,
      description: body.description,
      slug,
      brandId: body.brandId,
      categoryId: body.categoryId,
      basePrice,
      variants: {
        create: variants.map((v) => {
          const vid = randomUUID();
          return {
            id: vid,
            sku: v.sku,
            price: v.price != null ? new Prisma.Decimal(v.price) : null,
            stock: v.stock,
            active: true,
            attributeLinks: {
              create: (v.attributes ?? []).map((attributeValueId) => ({ attributeValueId })),
            },
          };
        }),
      },
      images: {
        create: images.map((im) => ({
          id: randomUUID(),
          imageUrl: im.imageUrl,
          sortOrder: im.sortOrder ?? 0,
          variantId: im.variantId ?? null,
        })),
      },
    },
  });

  const full = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: productFullInclude,
  });
  return mapProductToHttp(full);
}

export async function updateProduct(
  productId: string,
  body: {
    name?: string;
    description?: string;
    brandId?: string;
    categoryId?: string;
    basePrice?: number | null;
    active?: boolean;
    variants?: VariantInput[];
    images?: ImageInput[];
  },
) {
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: productFullInclude,
  });
  if (!existing) throw new Error("Product not found with id: " + productId);

  const name = body.name ?? existing.name;
  const description = body.description ?? existing.description;
  const brandId = body.brandId ?? existing.brandId;
  const categoryId = body.categoryId ?? existing.categoryId;
  const basePrice =
    body.basePrice !== undefined
      ? body.basePrice != null
        ? new Prisma.Decimal(body.basePrice)
        : null
      : existing.basePrice;
  const active = body.active !== undefined ? body.active : existing.active;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        brandId,
        categoryId,
        basePrice,
        active,
      },
    });

    if (body.variants) {
      await tx.variantAttributeValue.deleteMany({
        where: { variant: { productId } },
      });
      await tx.productVariant.deleteMany({ where: { productId } });
      for (const v of body.variants) {
        const vid = randomUUID();
        await tx.productVariant.create({
          data: {
            id: vid,
            productId,
            sku: v.sku,
            price: v.price != null ? new Prisma.Decimal(v.price) : null,
            stock: v.stock,
            active: true,
            attributeLinks: {
              create: (v.attributes ?? []).map((attributeValueId) => ({ attributeValueId })),
            },
          },
        });
      }
    }

    if (body.images && body.images.length > 0) {
      for (const im of body.images) {
        await tx.productImage.create({
          data: {
            id: randomUUID(),
            productId,
            imageUrl: im.imageUrl,
            sortOrder: im.sortOrder ?? 0,
            variantId: im.variantId ?? null,
          },
        });
      }
    }
  });

  const full = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: productFullInclude,
  });
  return mapProductToHttp(full);
}

export async function replaceProductAttributes(
  productId: string,
  defs: { name: string; displayName: string; values: string[] }[],
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found with id: " + productId);

  await prisma.productAttribute.deleteMany({ where: { productId } });

  const attributes: {
    id: string;
    name: string;
    displayName: string;
    values: { id: string; value: string }[];
  }[] = [];

  for (const def of defs) {
    const attrId = randomUUID();
    const valueRows = (def.values ?? []).map((val) => ({ id: randomUUID(), value: val }));
    await prisma.productAttribute.create({
      data: {
        id: attrId,
        productId,
        name: def.name,
        displayName: def.displayName,
        values: { create: valueRows },
      },
    });
    attributes.push({
      id: attrId,
      name: def.name,
      displayName: def.displayName,
      values: valueRows.map((v) => ({ id: v.id, value: v.value })),
    });
  }

  return { productId, attributes };
}

export async function getProductAttributes(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found with id: " + productId);

  const attrs = await prisma.productAttribute.findMany({
    where: { productId },
    include: { values: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    productId,
    attributes: attrs.map((a) => ({
      id: a.id,
      name: a.name,
      displayName: a.displayName,
      values: a.values.map((v) => ({ id: v.id, value: v.value })),
    })),
  };
}

export async function patchVariantStock(productId: string, variantId: string, stock: number) {
  const v = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!v) throw new Error("Variant not found");
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });
  const full = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: productFullInclude,
  });
  return mapProductToHttp(full);
}

export async function addProductImage(productId: string, variantId: string | null, imageUrl: string) {
  await prisma.productImage.create({
    data: {
      id: randomUUID(),
      productId,
      variantId,
      imageUrl,
      sortOrder: 0,
    },
  });
  const full = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: productFullInclude,
  });
  return mapProductToHttp(full);
}
