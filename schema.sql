CREATE OR REPLACE FUNCTION create_user_token () RETURNS trigger AS $$
BEGIN
    NEW.token = sign(
      json_build_object(
        'sub', NEW.id,
        'timestamp', current_timestamp,
        'aud', (
          SELECT value FROM environmental_variables WHERE name = 'CLIENT_' || NEW.role || '_ID'
        ),
        'role', NEW.role
      ),
      COALESCE(NEW.password, (
        SELECT value FROM environmental_variables WHERE name = 'CLIENT_SESSION_SECRET'
      ))
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_token () RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.password <> OLD.password THEN
  NEW.token = sign(
    json_build_object(
      'sub', NEW.id,
      'timestamp', current_timestamp,
      'aud', (
        SELECT value FROM environmental_variables WHERE name = 'CLIENT_' || NEW.role || '_ID'
      ),
      'role', NEW.role
    ),
    COALESCE(NEW.password, (
      SELECT value FROM environmental_variables WHERE name = 'CLIENT_SESSION_SECRET'
    ))
  );
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_thread () RETURNS trigger AS $$
BEGIN
  IF NEW.thread_id IS NULL THEN
    INSERT INTO threads (
      user_id
    )
    VALUES(NEW.user_id)
    RETURNING id INTO NEW.thread_id;
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_entities () RETURNS trigger AS $$
BEGIN
  IF NEW.source IS NOT NULL THEN
    WITH x AS (
      INSERT INTO entities(
        user_id,
        entity_type,
        email_address
      )
      VALUES(
        NEW.user_id,
        'SOURCE',
        NEW.source
      )
      RETURNING *
    )
    INSERT INTO messages_entities(
      message_id,
      entity_id
    )
    SELECT NEW.id, id FROM x;
  END IF;
  NEW.source = NULL;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gen_user_token_before_insert on users;
DROP TRIGGER IF EXISTS gen_user_token_before_update on users;
DROP TRIGGER IF EXISTS insert_thread_before_insert on messages;
DROP TRIGGER IF EXISTS insert_entities_after_insert on messages;

CREATE TRIGGER insert_thread_before_insert
BEFORE INSERT ON messages FOR EACH ROW
EXECUTE PROCEDURE insert_thread();

CREATE TRIGGER insert_entities_after_insert
AFTER INSERT ON messages FOR EACH ROW
EXECUTE PROCEDURE insert_entities();

CREATE TRIGGER gen_user_token_before_insert
BEFORE INSERT ON users FOR EACH ROW
EXECUTE PROCEDURE create_user_token();

CREATE TRIGGER gen_user_token_before_update
BEFORE INSERT ON users FOR EACH ROW
EXECUTE PROCEDURE update_user_token();