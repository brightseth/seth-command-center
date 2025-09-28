import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.DATABASE_URL = 'file:./test.db'
process.env.EDEN_BRIDGE_API_KEY = 'test-key'
process.env.NODE_ENV = 'test'
process.env.SKIP_ENV_VALIDATION = 'true'