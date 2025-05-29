ALTER TABLE insurance_policies
    ADD COLUMN cancelled_at TIMESTAMP,
    ADD COLUMN cancellation_reason TEXT,
    ADD COLUMN refund_amount DECIMAL(10, 2); 