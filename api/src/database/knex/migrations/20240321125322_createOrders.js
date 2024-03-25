exports.up = (knex) =>
  knex.schema.createTable("orders", (table) => {
    table.increments("id");

    table
      .enum(
        "status",
        ["received", "preparing", "delivering", "delivered", "canceled"],
        {
          useNative: true,
          enumName: "status",
        }
      )
      .notNullable()
      .default("received");

    table.decimal("amount").notNullable();
    table.text("paymentMethod").notNullable();

    table.integer("address_id").references("id").inTable("addresses");
    table.integer("user_id").references("id").inTable("users");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("orders");
