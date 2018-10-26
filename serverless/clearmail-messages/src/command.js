module.exports = ({
  messageId,
  destination,
  source,
  subject,
  snippet,
  html,
  text,
  thread,
  user
}) => `
  WITH data(
    subject,
    text,
    snippet,
    labels,
    message_id
  ) AS (
    VALUES(
      text '${subject}',
      text '${text}',
      text '${snippet}',
      '{INBOX}'::label[],
      text '${messageId}'
    )
  ),
  threads_instance AS (
    ${thread
    ? `SELECT '${thread}'::text AS thread_id`
    : `INSERT INTO threads(user_id) VALUES(text '${user}') RETURNING id AS thread_id`}
  ),
  messages_instance AS (
    INSERT INTO messages(
      user_id,
      subject,
      text,
      snippet,
      labels,
      message_id,
      thread_id
    )
    SELECT
      (SELECT '${user}'::text AS user_id),
      data.subject,
      data.text,
      data.snippet,
      data.labels,
      data.message_id,
      thread_id
    FROM
      data,
      threads_instance
    RETURNING *
  ),
  messages_content_instance AS (
    INSERT into messages_content (
      message_id,
      content
    )
    SELECT id, '${html}'
      FROM messages_instance
    RETURNING *
  ),
  get_source_entity AS (
    SELECT * FROM entities
    WHERE email_address = ANY('{${source.join(',')}}'::text[])
    AND entity_type = 'SOURCE'::entity_type
  ),
  create_source_entity AS (
    INSERT INTO entities(
      email_address,
      entity_type,
      user_id
    )
    SELECT
      unnest(
        '{${source.join(',')}}'::text[]
      ) AS email_address,
      'SOURCE'::entity_type,
      '${user}'::text
    WHERE NOT EXISTS(
      SELECT * FROM get_source_entity
    )
    RETURNING *
  ),
  source_instance AS (
    SELECT * FROM get_source_entity UNION SELECT * FROM create_source_entity
  ),
  get_destination_entity AS (
    SELECT * FROM entities
    WHERE email_address = ANY('{${destination.join(',')}}')
    AND entity_type = 'DESTINATION'::entity_type
  ),
  create_destination_entity AS (
    INSERT INTO entities(
      email_address,
      entity_type,
      user_id
    )
    SELECT
      unnest(
        '{${destination.join(',')}}'::text[]
      ) AS email_address,
      'DESTINATION'::entity_type,
      '${user}'::text
    WHERE NOT EXISTS(
      SELECT * FROM get_destination_entity
    )
    RETURNING *
  ),
  destination_instance AS (
    SELECT * FROM get_destination_entity UNION SELECT * FROM create_destination_entity
  ),
  source_connection AS (
    INSERT INTO messages_entities(
      message_id,
      entity_id
    )
    SELECT messages_instance.id, source_instance.id
    FROM messages_instance, source_instance
    RETURNING *
  ),
  destination_connection AS (
    INSERT INTO messages_entities(
      message_id,
      entity_id
    )
    SELECT messages_instance.id, destination_instance.id
    FROM messages_instance, destination_instance
    RETURNING *
  )
  SELECT
    messages_instance.*,
    (select json_agg(
      json_build_object(
          'id', source_instance.id,
          'emailAddress', source_instance.email_address,
          'name', source_instance.name,
          'entityType', source_instance.entity_type
        )
    ) from source_instance) as source,
    (select json_agg(
      json_build_object(
          'id', destination_instance.id,
          'emailAddress', destination_instance.email_address,
          'name', destination_instance.name,
          'entityType', destination_instance.entity_type
        )
    ) from destination_instance) as destination
  FROM
    messages_instance
`
