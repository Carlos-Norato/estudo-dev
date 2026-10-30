import database from "infra/database.js";
import pgMigrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  switch (request.method) {
    case "GET":
      const pendingMigrations = await pgMigrationRunner(
        defaultMigrationOptions,
      );
      await dbClient.end();
      return response.status(200).json(pendingMigrations);
    case "POST":
      const migratedMigrations = await pgMigrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      await dbClient.end();
      const statusCode = migratedMigrations.length > 0 ? 201 : 200;
      return response.status(statusCode).json(migratedMigrations);
    default:
      return response.status(405).end();
  }
}
