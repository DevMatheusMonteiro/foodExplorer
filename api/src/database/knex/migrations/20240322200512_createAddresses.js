exports.up = (knex) =>
  knex.schema.createTable("addresses", (table) => {
    table.increments("id");

    table.boolean("selected").default(true);

    table
      .enum("type", ["home", "work", "general"], {
        useNative: true,
        enumName: "types",
      })
      .notNullable()
      .default("general");

    table.text("street").notNullable();
    table.integer("number").notNullable();
    table.text("neighborhood").notNullable();
    table.text("complement").notNullable();
    table.text("city").notNullable();
    table.text("state").notNullable();
    table.text("zipCode").notNullable();

    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("addresses");
