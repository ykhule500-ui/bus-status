
-- Create Database
CREATE DATABASE IF NOT EXISTS nagpur_transit;
USE nagpur_transit;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Passengers Table
CREATE TABLE IF NOT EXISTS passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id VARCHAR(20) PRIMARY KEY, -- Using BUS001 style IDs
    name VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    total_seats INT NOT NULL,
    status ENUM('active', 'delayed', 'cancelled') DEFAULT 'active'
);

-- 4. Bus Routes Table (Normalized for stops)
CREATE TABLE IF NOT EXISTS bus_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id VARCHAR(20),
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT,
    bus_id VARCHAR(20),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES passengers(id),
    FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- Seed Admin
INSERT INTO admins (name, phone, password) VALUES ('Main Admin', '9999999999', 'admin123');

-- Seed Buses
INSERT INTO buses (id, name, departure_time, arrival_time, fare, total_seats, status) VALUES 
('BUS001', 'Sitabuldi-MIHAN Express', '06:00:00', '07:30:00', 45.00, 42, 'active'),
('BUS002', 'Dharampeth-Sadar Shuttle', '07:00:00', '07:45:00', 25.00, 30, 'active'),
('BUS003', 'Airport-Railway Connect', '08:00:00', '09:00:00', 60.00, 40, 'active'),
('BUS004', 'Wardhaman Nagar-Wadi Line', '09:00:00', '10:30:00', 50.00, 45, 'active'),
('BUS005', 'Indora-Nandanvan Local', '10:00:00', '11:15:00', 30.00, 38, 'delayed'),
('BUS006', 'Khamla-Jaripatka StarBus', '11:00:00', '12:30:00', 35.00, 42, 'active');

-- Seed Routes (Stops for each bus)
INSERT INTO bus_routes (bus_id, stop_name, stop_order) VALUES
-- BUS001: Sitabuldi to MIHAN
('BUS001', 'Sitabuldi Interchange', 1),
('BUS001', 'Ajni Square', 2),
('BUS001', 'Pratap Nagar', 3),
('BUS001', 'Airport South', 4),
('BUS001', 'MIHAN SEZ', 5),

-- BUS002: Dharampeth to Sadar
('BUS002', 'Dharampeth', 1),
('BUS002', 'Laxmi Nagar', 2),
('BUS002', 'Variety Square', 3),
('BUS002', 'Sadar Bazar', 4),

-- BUS003: Airport to Railway Station
('BUS003', 'Dr. Babasaheb Ambedkar Airport', 1),
('BUS003', 'Hotel Pride', 2),
('BUS003', 'Rahate Colony', 3),
('BUS003', 'Sitabuldi', 4),
('BUS003', 'Nagpur Railway Station', 5),

-- BUS004: Wardhaman Nagar to Wadi
('BUS004', 'Wardhaman Nagar', 1),
('BUS004', 'Telephone Exchange Square', 2),
('BUS004', 'Agrasen Square', 3),
('BUS004', 'Sitabuldi', 4),
('BUS004', 'Gittikhadan', 5),
('BUS004', 'Wadi Bypass', 6),

-- BUS005: Indora to Nandanvan
('BUS005', 'Indora Square', 1),
('BUS005', 'Kamal Square', 2),
('BUS005', 'Dahibazar Bridge', 3),
('BUS005', 'Nandanvan', 4),

-- BUS006: Khamla to Jaripatka
('BUS006', 'Khamla Market', 1),
('BUS006', 'Deo Nagar', 2),
('BUS006', 'Orange City Hospital', 3),
('BUS006', 'Mount Road', 4),
('BUS006', 'Jaripatka', 5);
