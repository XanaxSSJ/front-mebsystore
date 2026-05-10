-- Índice para consultas de expiración de órdenes (cron). IF NOT EXISTS: seguro si ya existía por db push.
CREATE INDEX IF NOT EXISTS "orders_status_expires_at_idx" ON "orders"("status", "expires_at");
