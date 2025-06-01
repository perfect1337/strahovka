-- Recreate insurance_policies table
CREATE TABLE insurance_policies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    category_id BIGINT REFERENCES insurance_categories(id),
    guide_id BIGINT REFERENCES insurance_guides(id),
    policy_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    refund_amount DECIMAL(10, 2),
    cashback DECIMAL(10, 2) NOT NULL DEFAULT 0,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 