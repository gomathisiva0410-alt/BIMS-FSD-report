// Single source for the JWT signing secret so login and protected routes always agree.
const getJwtSecret = () => process.env.JWT_SECRET || 'ibms_super_secret_jwt_key_2026_secure';

module.exports = { getJwtSecret };
