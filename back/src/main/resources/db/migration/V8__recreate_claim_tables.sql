-- Drop existing tables if they exist
DROP TABLE IF EXISTS claim_messages CASCADE;
DROP TABLE IF EXISTS claim_comments CASCADE;
DROP TABLE IF EXISTS claim_attachments CASCADE;
DROP TABLE IF EXISTS claim_reviews CASCADE;
DROP TABLE IF EXISTS claim_documents CASCADE;
DROP TABLE IF EXISTS claim_status_history CASCADE;

-- Add claim status history
CREATE TABLE claim_status_history (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    status VARCHAR(50) NOT NULL,
    changed_by BIGINT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Add claim documents
CREATE TABLE claim_documents (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_path TEXT,
    uploaded_by BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    verified_by BIGINT REFERENCES users(id)
);

-- Add claim reviews
CREATE TABLE claim_reviews (
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
CREATE TABLE claim_attachments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add claim comments
CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by BIGINT REFERENCES users(id)
);

-- Add claim messages
CREATE TABLE claim_messages (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    CONSTRAINT fk_claim_messages_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id),
    CONSTRAINT fk_claim_messages_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add indexes for better performance
CREATE INDEX idx_claim_attachments_claim_id ON claim_attachments(claim_id);
CREATE INDEX idx_claim_comments_claim_id ON claim_comments(claim_id);
CREATE INDEX idx_claim_documents_claim_id ON claim_documents(claim_id);
CREATE INDEX idx_claim_messages_claim_id ON claim_messages(claim_id);
CREATE INDEX idx_claim_reviews_claim_id ON claim_reviews(claim_id);
CREATE INDEX idx_claim_status_history_claim_id ON claim_status_history(claim_id); 