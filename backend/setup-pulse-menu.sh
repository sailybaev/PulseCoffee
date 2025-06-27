#!/bin/bash

# Pulse Coffee Menu Setup Script
echo "🚀 Setting up Pulse Coffee Menu..."

cd "$(dirname "$0")"

echo "📝 Generating Prisma client..."
npx prisma generate

echo "🗄️ Pushing schema changes to database..."
npx prisma db push

echo "🍕 Adding menu items via SQL..."
npx prisma db execute --file ./migrations/add_pulse_menu.sql --schema ./prisma/schema.prisma

echo "🧹 Removing additive products (they should be customizations)..."
npx prisma db execute --file ./migrations/remove_additive_products.sql --schema ./prisma/schema.prisma

echo "🎛️ Adding product customizations..."
npx ts-node scripts/seed-pulse-customizations.ts

echo "🏪 Making products available in all branches..."
npx ts-node scripts/seed-products-in-branches.ts

echo "✅ Verifying menu setup..."
npx ts-node scripts/verify-menu.ts

echo "🔍 Verifying customizations..."
npx ts-node scripts/verify-customizations.ts

echo "🎉 Pulse Coffee menu setup completed!"
echo ""
echo "📋 Summary:"
echo "   - Added new product categories: COLD_DRINKS, FRESH_JUICE, HOT_BEVERAGES, LEMONADES"
echo "   - Added 35+ menu items from Pulse Coffee menu (no longer including additives as separate products)"
echo "   - Added comprehensive customizations for all coffee products"
echo "   - Made all products available in all branches"
echo "   - Prices are set in Kazakhstani Tenge (KZT)"
echo "   - Additives are now properly configured as ProductCustomizations"
echo ""
echo "🌐 You can now view the products in Prisma Studio with:"
echo "   npx prisma studio"
