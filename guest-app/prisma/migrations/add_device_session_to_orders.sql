-- Add deviceSessionId to Order table for device-specific order tracking
-- This ensures each device only sees their own orders, even at the same table

ALTER TABLE "Order" 
ADD COLUMN "deviceSessionId" TEXT;

-- Create index for faster queries
CREATE INDEX "Order_deviceSessionId_idx" ON "Order"("deviceSessionId");

-- Create composite index for table + device session queries
CREATE INDEX "Order_tableId_deviceSessionId_idx" ON "Order"("tableId", "deviceSessionId");
