exports.up = (knex) =>
  knex.schema.createTable("cards", (table) => {
    table.increments("id");

    table.text("nickname").notNullable();

    table
      .enum("type", ["credit", "debit"], {
        useNative: true,
        enumName: "types",
      })
      .notNullable();

    table.text("number").notNullable();
    table.timestamp("expirationDate").notNullable();
    table.text("holderName").notNullable();
    table.text("securityCode").notNullable();
    table.text("cpf").notNullable();

    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("cards");
