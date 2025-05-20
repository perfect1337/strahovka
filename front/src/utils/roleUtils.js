/**
 * Utility functions for checking user roles
 */

/**
 * Checks if a user has admin role, accounting for different formats (ADMIN, ROLE_ADMIN)
 * @param {string} role - The user role to check
 * @returns {boolean} - True if the user has admin privileges
 */
export const checkIfAdmin = (role) => {
  if (!role) return false;
  return role === 'ADMIN' || 
         role === 'ROLE_ADMIN' || 
         role.includes('ADMIN') || 
         role.includes('ROLE_ADMIN');
};

/**
 * Checks if a user has a specific role, accounting for the "ROLE_" prefix
 * @param {string} userRole - The user's role
 * @param {string} requiredRole - The role to check for
 * @returns {boolean} - True if the user has the required role
 */
export const hasRole = (userRole, requiredRole) => {
  if (!userRole) return false;
  
  return userRole === requiredRole || 
         userRole === `ROLE_${requiredRole}` || 
         userRole.includes(requiredRole) || 
         userRole.includes(`ROLE_${requiredRole}`);
}; 