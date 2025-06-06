ALTER TABLE insurance_policies ADD COLUMN application_id BIGINT;

ALTER TABLE insurance_policies
ADD CONSTRAINT fk_policy_application
FOREIGN KEY (application_id) REFERENCES base_applications(id); 