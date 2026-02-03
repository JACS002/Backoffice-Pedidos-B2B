USE challenges_db;

-- Insertar un cliente de prueba
INSERT INTO customers (name, email, phone) VALUES 
('Empresa ACME', 'ops@acme.com', '+59399999999');

-- Insertar productos de prueba
INSERT INTO products (sku, name, price_cents, stock) VALUES 
('PROD-001', 'Laptop Developer', 150000, 10),
('PROD-002', 'Monitor 4K', 40000, 20),
('PROD-003', 'Teclado Mecánico', 12000, 50);