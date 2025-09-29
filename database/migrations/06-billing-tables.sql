-- Migration to add missing columns to billing tables

-- Add missing columns to invoices table
ALTER TABLE billing.invoices 
ADD COLUMN IF NOT EXISTS stamp_duty_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS stamp_duty_applied BOOLEAN DEFAULT false;
