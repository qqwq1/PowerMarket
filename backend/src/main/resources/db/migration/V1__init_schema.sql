-- V1: Initial schema
CREATE TABLE IF NOT EXISTS lots (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(19, 2),
    unit VARCHAR(50),
    capacity VARCHAR(100),
    location VARCHAR(255),
    contacts VARCHAR(255),
    executor_session_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lots_category ON lots(category);
CREATE INDEX IF NOT EXISTS idx_lots_location ON lots(location);
CREATE INDEX IF NOT EXISTS idx_lots_title ON lots(title);
CREATE INDEX IF NOT EXISTS idx_lots_executor_session ON lots(executor_session_id);

CREATE INDEX IF NOT EXISTS idx_sessions_role ON user_sessions(role);
