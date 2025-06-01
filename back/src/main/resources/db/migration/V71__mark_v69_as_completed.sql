INSERT INTO flyway_schema_history 
(installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
SELECT 
    69,
    '69',
    'create insurance packages table',
    'SQL',
    'V69__create_insurance_packages_table.sql',
    NULL,
    current_user,
    current_timestamp,
    0,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM flyway_schema_history WHERE version = '69'
); 