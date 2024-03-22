exports.up = (knex) =>
  knex.schema.createTable("feedbacks", (table) => {
    table.increments("id");
    table.integer("rating");
    table.text("comment");

    table
      .integer("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("feedbacks");
