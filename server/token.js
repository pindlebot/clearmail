const client = require('postgres-tools')

module.exports = async ({
  token = ''
}) => {
  let sub = (token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8')).sub) || ''
  let command = `
    WITH get_user AS (
      SELECT
        users.*,
        auth.valid
        FROM
      users,
        LATERAL(
          SELECT valid FROM verify(
            (SELECT COALESCE('${token}', NULL)),
            (SELECT COALESCE(
              (SELECT password FROM users WHERE id = uuid_or_null('${sub}')),
              (SELECT value FROM environmental_variables WHERE name = 'CLIENT_SESSION_SECRET')
            ))
          )
        ) AS auth
      WHERE id = uuid_or_null('${sub}')
    ),
    create_user AS (
      INSERT INTO users(role) SELECT 'SESSION' WHERE NOT EXISTS (
        SELECT * FROM get_user
      )
      RETURNING * 
    )
    SELECT create_user.*, true AS valid FROM create_user
    UNION ALL
    SELECT * FROM get_user
  `
  console.log(command)
  let user = await client.query(command, { head: true })
  console.log({ user })
  return user
}
