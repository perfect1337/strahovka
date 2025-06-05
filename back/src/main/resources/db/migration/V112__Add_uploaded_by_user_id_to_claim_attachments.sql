ALTER TABLE claim_attachments
ADD COLUMN uploaded_by_user_id BIGINT;

ALTER TABLE claim_attachments
ADD CONSTRAINT fk_claim_attachments_uploaded_by_user
FOREIGN KEY (uploaded_by_user_id)
REFERENCES users(id); 