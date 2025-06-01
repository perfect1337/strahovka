-- Create a join table for package applications with discriminator
CREATE TABLE package_applications (
    package_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    application_type VARCHAR(20) NOT NULL,
    PRIMARY KEY (package_id, application_id, application_type),
    FOREIGN KEY (package_id) REFERENCES insurance_packages(id) ON DELETE CASCADE,
    CONSTRAINT check_valid_type CHECK (
        application_type IN ('KASKO', 'OSAGO', 'PROPERTY', 'HEALTH', 'TRAVEL')
    )
);

-- Create foreign key constraints for each application type
ALTER TABLE package_applications
ADD CONSTRAINT fk_kasko_application 
FOREIGN KEY (application_id) 
REFERENCES kasko_applications(id) ON DELETE CASCADE;

ALTER TABLE package_applications
ADD CONSTRAINT fk_osago_application 
FOREIGN KEY (application_id)
REFERENCES osago_applications(id) ON DELETE CASCADE;

ALTER TABLE package_applications
ADD CONSTRAINT fk_property_application 
FOREIGN KEY (application_id)
REFERENCES property_applications(id) ON DELETE CASCADE;

ALTER TABLE package_applications
ADD CONSTRAINT fk_health_application 
FOREIGN KEY (application_id)
REFERENCES health_applications(id) ON DELETE CASCADE;

ALTER TABLE package_applications
ADD CONSTRAINT fk_travel_application 
FOREIGN KEY (application_id)
REFERENCES travel_applications(id) ON DELETE CASCADE;

-- Create a function to validate application type matches the referenced table
CREATE OR REPLACE FUNCTION validate_application_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_type = 'KASKO' AND EXISTS (
        SELECT 1 FROM kasko_applications ka WHERE ka.id = NEW.application_id
    ) THEN
        RETURN NEW;
    ELSIF NEW.application_type = 'OSAGO' AND EXISTS (
        SELECT 1 FROM osago_applications oa WHERE oa.id = NEW.application_id
    ) THEN
        RETURN NEW;
    ELSIF NEW.application_type = 'PROPERTY' AND EXISTS (
        SELECT 1 FROM property_applications pa WHERE pa.id = NEW.application_id
    ) THEN
        RETURN NEW;
    ELSIF NEW.application_type = 'HEALTH' AND EXISTS (
        SELECT 1 FROM health_applications ha WHERE ha.id = NEW.application_id
    ) THEN
        RETURN NEW;
    ELSIF NEW.application_type = 'TRAVEL' AND EXISTS (
        SELECT 1 FROM travel_applications ta WHERE ta.id = NEW.application_id
    ) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Application type does not match the referenced application';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to validate application type before insert or update
CREATE TRIGGER validate_application_type_trigger
BEFORE INSERT OR UPDATE ON package_applications
FOR EACH ROW
EXECUTE FUNCTION validate_application_type(); 