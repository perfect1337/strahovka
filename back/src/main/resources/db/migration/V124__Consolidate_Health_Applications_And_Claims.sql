-- Claims related changes
ALTER TABLE claim_attachments
    ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS file_path VARCHAR(255);

ALTER TABLE claim_comments
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE claim_messages
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;

-- Health applications related changes
CREATE TABLE IF NOT EXISTS health_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chronic_diseases_details TEXT,
    cover_emergency BOOLEAN,
    cover_maternity BOOLEAN,
    cover_vision BOOLEAN,
    disabilities_details TEXT,
    family_doctor_needed BOOLEAN,
    has_chronic_diseases BOOLEAN,
    has_disabilities BOOLEAN,
    passport_number VARCHAR(255),
    preferred_clinic VARCHAR(255),
    smoking_status VARCHAR(50)
);

ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS chronic_diseases_details TEXT,
    ADD COLUMN IF NOT EXISTS cover_emergency BOOLEAN,
    ADD COLUMN IF NOT EXISTS cover_maternity BOOLEAN,
    ADD COLUMN IF NOT EXISTS cover_vision BOOLEAN,
    ADD COLUMN IF NOT EXISTS disabilities_details TEXT,
    ADD COLUMN IF NOT EXISTS family_doctor_needed BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_chronic_diseases BOOLEAN,
    ADD COLUMN IF NOT EXISTS has_disabilities BOOLEAN,
    ADD COLUMN IF NOT EXISTS passport_number VARCHAR(255),
    ADD COLUMN IF NOT EXISTS preferred_clinic VARCHAR(255),
    ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(50); 