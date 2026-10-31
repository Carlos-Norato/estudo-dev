import database from "infra/database.js";
import pgMigrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
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
        return response.status(200).json(pendingMigrations);
      case "POST":
        const migratedMigrations = await pgMigrationRunner({
          ...defaultMigrationOptions,
          dryRun: false,
        });
        const statusCode = migratedMigrations.length > 0 ? 201 : 200;
        return response.status(statusCode).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
