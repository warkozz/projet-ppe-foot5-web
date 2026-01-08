-- Script SQL pour créer les tables de l'application
-- Base de données: foot5

USE foot5;

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'client') DEFAULT 'client' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Table terrains  
CREATE TABLE IF NOT EXISTS terrains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    capacity INT DEFAULT 10 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    image_url VARCHAR(500),
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- Table reservations
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    terrain_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending' NOT NULL,
    notes TEXT,
    contact_phone VARCHAR(20),
    participants_count INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (terrain_id) REFERENCES terrains(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_terrain_id (terrain_id),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
);

-- Insérer quelques données de test
INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@foot5.com', '$2b$12$K8QrXzJQn0xqYc.TlFjJ3uMQx0iRv5F5wVH9yZ7QkCJj4BgJzJ8EW', 'Admin', 'System', 'admin'),
('client1', 'client1@example.com', '$2b$12$K8QrXzJQn0xqYc.TlFjJ3uMQx0iRv5F5wVH9yZ7QkCJj4BgJzJ8EW', 'Jean', 'Dupont', 'client');

INSERT IGNORE INTO terrains (name, description, location, price_per_hour, capacity, amenities) VALUES
('Terrain A', 'Terrain de football synthétique avec éclairage', 'Stade Municipal, Rue des Sports', 50.00, 10, '{"eclairage": true, "vestiaires": true, "parking": true}'),
('Terrain B', 'Terrain gazon naturel', 'Centre Sportif, Avenue du Sport', 45.00, 10, '{"vestiaires": true, "parking": false}'),
('Terrain C', 'Terrain couvert', 'Complexe Indoor, Boulevard du Foot', 60.00, 8, '{"couvert": true, "chauffage": true, "vestiaires": true}');

SELECT 'Tables created successfully!' as message;