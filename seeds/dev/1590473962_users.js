exports.seed = async (knex) => {
  await knex('users').del()

  return knex('users').insert([
    {
      username: 'test',
      salt: 'knMiidjiEEEeecpY',
      password_hash:
        'nx80DhVFq1qWM9py1TptJSh2vvJmz/3cUyy8tDL+6tgJyxTmvZpV5tYK/JGeDJFV4iSEh5/m01d55CKn',
    },
  ])
}
