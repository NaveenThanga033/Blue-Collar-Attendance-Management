-- Create database
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Users table (for admin authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'supervisor') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers table
CREATE TABLE workers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(15),
    email VARCHAR(100),
    worker_type ENUM('daily', 'contract') NOT NULL,
    daily_wage DECIMAL(10, 2) NOT NULL,
    overtime_rate DECIMAL(10, 2) DEFAULT 0,
    address TEXT,
    joining_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'half-day', 'leave') NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    overtime_hours DECIMAL(4, 2) DEFAULT 0,
    notes TEXT,
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (worker_id, attendance_date)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    payment_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    advance_paid DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('paid', 'unpaid', 'partial') DEFAULT 'unpaid',
    payment_method ENUM('cash', 'bank', 'upi') DEFAULT 'cash',
    notes TEXT,
    paid_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(id)
);

-- Advances table
CREATE TABLE advances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    advance_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'adjusted', 'refunded') DEFAULT 'pending',
    given_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (given_by) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_worker ON attendance(worker_id);
CREATE INDEX idx_worker_status ON workers(status);
CREATE INDEX idx_payment_status ON payments(payment_status);
CREATE INDEX idx_payment_worker ON payments(worker_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@attendance.com', '$2a$10$8K1p/a0dL0R9x/qN2nC8OuYqO6Qv5jFGhC8P5K3pQxY7xV9/3Qw4S', 'admin');

-- Sample workers data
INSERT INTO workers (name, contact, email, worker_type, daily_wage, overtime_rate, address, joining_date, status) VALUES
('Rajesh Kumar', '9876543210', 'rajesh@email.com', 'daily', 500.00, 75.00, '123 Worker Colony', '2024-01-15', 'active'),
('Suresh Patel', '9876543211', 'suresh@email.com', 'daily', 550.00, 80.00, '456 Labor Street', '2024-02-01', 'active'),
('Mahesh Singh', '9876543212', 'mahesh@email.com', 'contract', 600.00, 90.00, '789 Site Road', '2024-01-10', 'active'),
('Ramesh Yadav', '9876543213', NULL, 'daily', 480.00, 70.00, '321 Worker Area', '2024-03-01', 'active'),
('Dinesh Sharma', '9876543214', 'dinesh@email.com', 'daily', 520.00, 75.00, '654 Site Colony', '2024-02-15', 'active');