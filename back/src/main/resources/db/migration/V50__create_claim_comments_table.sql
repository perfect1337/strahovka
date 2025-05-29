CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES insurance_claims(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
); 