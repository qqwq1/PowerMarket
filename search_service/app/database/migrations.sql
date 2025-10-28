-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address TEXT,
    company_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    inn TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('supplier', 'tenant', 'admin')),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица услуг/мощностей (services)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    capacity TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    location TEXT,
    price_per_day DECIMAL(10, 2),
    technical_specs TEXT,
    title TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица заявок на аренду (rental_requests)
CREATE TABLE IF NOT EXISTS rental_requests (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    message TEXT,
    rejection_reason TEXT,
    responded_at TIMESTAMP,
    start_date TIMESTAMP,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    total_price DECIMAL(10, 2),
    updated_at TIMESTAMP DEFAULT NOW(),
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица аренд (rentals)
CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    start_date TIMESTAMP,
    total_price DECIMAL(10, 2),
    rental_request_id INTEGER REFERENCES rental_requests(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица доступности услуг (service_availability)
CREATE TABLE IF NOT EXISTS service_availability (
    id SERIAL PRIMARY KEY,
    available_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_reserved BOOLEAN DEFAULT FALSE,
    reserved_by_rental_id INTEGER REFERENCES rentals(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE
);

-- Таблица сообщений в чатах
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    related_entity_id INTEGER,
    title TEXT,
    type TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица синонимов (для поиска)
CREATE TABLE IF NOT EXISTS synonyms (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL,
    synonym TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_synonym UNIQUE (word, synonym)
);

-- Индексы для поиска
CREATE INDEX IF NOT EXISTS idx_services_title ON services USING GIN(to_tsvector('russian', title));
CREATE INDEX IF NOT EXISTS idx_services_description ON services USING GIN(to_tsvector('russian', description));
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_location ON services(location);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_synonyms_word ON synonyms(LOWER(word));

-- Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_requests_updated_at 
    BEFORE UPDATE ON rental_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Тестовые синонимы
INSERT INTO synonyms (word, synonym) VALUES
    ('трактор', 'мтз'),
    ('трактор', 'беларус'),
    ('трактор', 'агротягач'),
    ('станок', 'чпу'),
    ('фрезерный', 'станок'),
    ('упаковка', 'фасовка'),
    ('линия', 'упаковка')
ON CONFLICT (word, synonym) DO NOTHING;