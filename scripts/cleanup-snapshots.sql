-- scripts/cleanup-snapshots.sql
-- PROPÓSITO: Eliminar todos los price_snapshots históricos contaminados.
-- Todos los snapshots anteriores a este fix tienen in_stock = true incorrectamente.
--
-- CUÁNDO EJECUTAR:
-- 1. Solo después de verificar que scripts/scraper.ts detecta stock correctamente.
-- 2. Correr el scraper en modo debug con 2-3 productos conocidos.
-- 3. Verificar en Supabase que los nuevos snapshots tienen in_stock correcto.
-- 4. Recién entonces ejecutar este DELETE en el SQL editor de Supabase.
--
-- DESPUÉS de ejecutar este DELETE:
-- Correr el scraper completo inmediatamente para repoblar con datos limpios:
--   npx tsx --env-file=.env.local scripts/scraper.ts

DELETE FROM price_snapshots;
