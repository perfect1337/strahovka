-- Fix claim_comments table structure
DROP TABLE IF EXISTS claim_comments CASCADE;

CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_claim_comments_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id),
    CONSTRAINT fk_claim_comments_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_claim_comments_user_id ON claim_comments(user_id); 