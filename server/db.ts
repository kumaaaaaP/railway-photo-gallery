import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, InsertCompany, trainTypes, InsertTrainType, formations, InsertFormation, photos, InsertPhoto } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Company Queries ============
export async function getCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(companies.name);
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(data);
  return result;
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(companies).set(data).where(eq(companies.id, id));
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(companies).where(eq(companies.id, id));
}

// ============ TrainType Queries ============
export async function getTrainTypesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainTypes).where(eq(trainTypes.companyId, companyId)).orderBy(trainTypes.name);
}

export async function getTrainTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trainTypes).where(eq(trainTypes.id, id)).limit(1);
  return result[0];
}

export async function createTrainType(data: InsertTrainType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(trainTypes).values(data);
}

export async function updateTrainType(id: number, data: Partial<InsertTrainType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(trainTypes).set(data).where(eq(trainTypes.id, id));
}

export async function deleteTrainType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(trainTypes).where(eq(trainTypes.id, id));
}

// ============ Formation Queries ============
export async function getFormationsByTrainTypeId(trainTypeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(formations).where(eq(formations.trainTypeId, trainTypeId)).orderBy(formations.name);
}

export async function getFormationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(formations).where(eq(formations.id, id)).limit(1);
  return result[0];
}

export async function createFormation(data: InsertFormation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(formations).values(data);
}

export async function updateFormation(id: number, data: Partial<InsertFormation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(formations).set(data).where(eq(formations.id, id));
}

export async function deleteFormation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(formations).where(eq(formations.id, id));
}

// ============ Photo Queries ============
export async function getPhotosByFormationId(formationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(photos).where(eq(photos.formationId, formationId)).orderBy(photos.createdAt);
}

export async function getPhotoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  return result[0];
}

export async function createPhoto(data: InsertPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(photos).values(data);
}

export async function updatePhoto(id: number, data: Partial<InsertPhoto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(photos).set(data).where(eq(photos.id, id));
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(photos).where(eq(photos.id, id));
}

export async function getPhotosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(photos).where(eq(photos.userId, userId)).orderBy(photos.createdAt);
}

// ============ Helper: Get formation with hierarchy ============
export async function getFormationWithHierarchy(formationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const formation = await getFormationById(formationId);
  if (!formation) return undefined;

  const trainType = await getTrainTypeById(formation.trainTypeId);
  if (!trainType) return undefined;

  const company = await getCompanyById(trainType.companyId);
  if (!company) return undefined;

  return { formation, trainType, company };
}
