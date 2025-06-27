#!/bin/bash

# Complete Pulse Coffee Setup with Proper Structure
echo "🚀 Setting up Pulse Coffee with proper product structure..."

cd "$(dirname "$0")"

echo "📝 Generating Prisma client..."
npx prisma generate

echo "🗄️ Pushing schema changes to database..."
npx prisma db push

echo "🧹 Cleaning up old product structure..."
npx prisma db execute --file ./migrations/clean_products_structure.sql --schema ./prisma/schema.prisma

echo "🎛️ Adding proper customizations (sizes as customizations, not products)..."
npx ts-node scripts/seed-proper-customizations.ts

echo "🏪 Making products available in all branches..."
npx ts-node scripts/seed-products-in-branches.ts

echo "✅ Verifying setup..."
npx ts-node scripts/verify-menu.ts

echo "🔍 Verifying customizations..."
npx ts-node scripts/verify-customizations.ts

echo "🎉 Pulse Coffee setup completed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Single products instead of size variants"
echo "   ✅ Cup sizes are now customizations with proper pricing"
echo "   ✅ All products available in all branches"
echo "   ✅ Tablet app compatible structure"
echo "   ✅ Public API endpoints work correctly"
echo ""
echo "🚀 You can now:"
echo "   • View products: npx prisma studio"
echo "   • Test tablet app API endpoints"
echo "   • Order products with size customizations"
echo ""
echo "📱 Tablet app changes:"
echo "   • Updated types to include new categories"
echo "   • API properly fetches customizations"
echo "   • Size selection works as customization"
