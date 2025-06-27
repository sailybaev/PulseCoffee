-- Remove additive products that should be customizations instead
DELETE FROM "ProductInBranch" WHERE "productId" IN (
  'syrup', 'milk-cream', 'alternative-milk', 'decaf',
  'syrup-kz', 'milk-honey-kz', 'alternative-milk-kz', 'decaf-kz'
);

DELETE FROM "Product" WHERE id IN (
  'syrup', 'milk-cream', 'alternative-milk', 'decaf',
  'syrup-kz', 'milk-honey-kz', 'alternative-milk-kz', 'decaf-kz'
);
