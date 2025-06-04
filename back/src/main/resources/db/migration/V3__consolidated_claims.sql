-- Consolidated claims changes

-- Drop existing tables if they exist
DROP TABLE IF EXISTS claim_comments CASCADE;
DROP TABLE IF EXISTS claim_messages CASCADE;
DROP TABLE IF EXISTS claim_attachments CASCADE;

-- Update claims table structure
ALTER TABLE insurance_claims
    ADD COLUMN IF NOT EXISTS claim_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS claim_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS incident_date DATE,
    ADD COLUMN IF NOT EXISTS incident_location TEXT,
    ADD COLUMN IF NOT EXISTS incident_description TEXT,
    ADD COLUMN IF NOT EXISTS estimated_damage_amount DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS approved_amount DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255);

-- Add claim status history
CREATE TABLE IF NOT EXISTS claim_status_history (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Add claim documents
CREATE TABLE IF NOT EXISTS claim_documents (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_path TEXT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    verified_by VARCHAR(255)
);

-- Add claim reviews
CREATE TABLE IF NOT EXISTS claim_reviews (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    reviewer_id BIGINT REFERENCES users(id),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_status VARCHAR(50) NOT NULL,
    comments TEXT,
    recommendation VARCHAR(50),
    action_taken VARCHAR(50),
    action_date TIMESTAMP
);

-- Add claim attachments
CREATE TABLE IF NOT EXISTS claim_attachments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_data OID,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add claim comments with explicit user_id column
DROP TABLE IF EXISTS claim_comments CASCADE;
CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_claim_comments_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id),
    CONSTRAINT fk_claim_comments_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_claim_comments_user_id ON claim_comments(user_id);

-- Add claim messages with explicit user_id column
DROP TABLE IF EXISTS claim_messages CASCADE;
CREATE TABLE claim_messages (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_claim_messages_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id),
    CONSTRAINT fk_claim_messages_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_claim_messages_user_id ON claim_messages(user_id); 