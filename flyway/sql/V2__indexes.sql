ALTER TABLE refresh_tokens ADD INDEX idx_user_rev (user_id, revoked_at);
ALTER TABLE files ADD INDEX idx_created (created_at);
ALTER TABLE translations ADD INDEX idx_ns_key (namespace, t_key);
