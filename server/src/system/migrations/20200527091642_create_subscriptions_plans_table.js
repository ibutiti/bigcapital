
exports.up = function(knex) {
  return knex.schema.createTable('subscriptions_plans', table => {
    table.increments();

    table.string('name');
    table.string('description');
    table.decimal('price');
    table.decimal('signup_fee');
    table.string('currency', 3);

    table.integer('trial_period');
    table.string('trial_interval');
    
    table.integer('invoice_period');
    table.string('invoice_interval');

    table.timestamps();
  }).then(() => {
    return knex.seed.run({
      specific: 'seed_subscriptions_plans.js'
    })
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('subscriptions_plans')
};
