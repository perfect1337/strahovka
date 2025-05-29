ALTER TABLE osago_applications
    ADD COLUMN policy_id BIGINT,
    ADD CONSTRAINT fk_osago_policy
        FOREIGN KEY (policy_id)
            REFERENCES insurance_policies(id)
            ON DELETE SET NULL; 