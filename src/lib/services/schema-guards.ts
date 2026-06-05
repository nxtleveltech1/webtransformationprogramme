import { prisma } from "@/lib/db";

const tableCache = new Map<string, Promise<boolean>>();
const columnCache = new Map<string, Promise<boolean>>();

export function hasTable(tableName: string): Promise<boolean> {
  const cached = tableCache.get(tableName);
  if (cached) return cached;

  const query = prisma
    .$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
      ) AS "exists"
    `
    .then((rows) => Boolean(rows[0]?.exists));

  tableCache.set(tableName, query);
  return query;
}

export function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const key = `${tableName}.${columnName}`;
  const cached = columnCache.get(key);
  if (cached) return cached;

  const query = prisma
    .$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = ${columnName}
      ) AS "exists"
    `
    .then((rows) => Boolean(rows[0]?.exists));

  columnCache.set(key, query);
  return query;
}
