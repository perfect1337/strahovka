ALTER TABLE kasko_applications
ADD COLUMN IF NOT EXISTS policy_id BIGINT,
ADD CONSTRAINT fk_kasko_applications_policy
    FOREIGN KEY (policy_id)
    REFERENCES insurance_policies(id); 