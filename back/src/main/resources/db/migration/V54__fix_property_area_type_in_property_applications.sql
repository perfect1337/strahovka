-- Change property_area column type in property_applications
ALTER TABLE property_applications
    ALTER COLUMN property_area TYPE NUMERIC(10,2); 