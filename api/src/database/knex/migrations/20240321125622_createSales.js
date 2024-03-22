exports.up = (knex) =>
  knex.schema.createTable("sales", (table) => {
    table.increments("id");
    table.integer("quantity");
    table
      .integer("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");

    table.integer("product_id").references("id").inTable("products");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("sales");
