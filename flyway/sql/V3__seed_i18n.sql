INSERT INTO locales (code, name) VALUES
('en','English'), ('th','ไทย')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO translations (namespace, t_key, locale_code, t_value) VALUES
('auth','auth.login.title','en','Sign in'),
('auth','auth.login.title','th','เข้าสู่ระบบ'),
('common','common.save','en','Save'),
('common','common.save','th','บันทึก')
ON DUPLICATE KEY UPDATE t_value=VALUES(t_value), updated_at=CURRENT_TIMESTAMP;
