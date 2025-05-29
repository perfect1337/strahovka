-- Drop existing check constraint
ALTER TABLE kasko_applications DROP CONSTRAINT IF EXISTS kasko_applications_status_check;

-- Add new check constraint with updated status values
ALTER TABLE kasko_applications 
ADD CONSTRAINT kasko_applications_status_check 
CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEED_INFO', 'PAID', 'ACTIVE', 'CANCELLED', 'COMPLETED')); 