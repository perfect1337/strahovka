DROP TABLE IF EXISTS claim_comments;
DROP TABLE IF EXISTS claim_messages;
DROP TABLE IF EXISTS claim_attachments;
DROP TABLE IF EXISTS insurance_claims;

CREATE TABLE insurance_claims (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT REFERENCES insurance_policies(id),
    description TEXT NOT NULL,
    amount_requested DOUBLE PRECISION,
    amount_approved DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE claim_attachments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_at TIMESTAMP NOT NULL
);

CREATE TABLE claim_messages (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    sender_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    user_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
); 