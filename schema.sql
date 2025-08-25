-- This is a placeholder for your database schema creation script.
-- You would typically have CREATE TABLE statements here.
-- However, Flask-SQLAlchemy's `db.create_all()` handles this automatically based on the models.

-- Example for manual creation:
/*
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    qr_code VARCHAR(120)
);

CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    timestamp DATETIME,
    FOREIGN KEY(user_id) REFERENCES user(id)
);
*/
