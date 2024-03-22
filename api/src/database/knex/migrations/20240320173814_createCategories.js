exports.up = (knex) =>
  knex.schema.createTable("categories", (table) => {
    table.increments("id");
    table.text("name").notNullable();
    table
      .integer("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("categories");
