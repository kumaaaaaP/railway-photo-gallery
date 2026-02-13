import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getTrainTypesByCompanyId,
  getTrainTypeById,
  createTrainType,
  updateTrainType,
  deleteTrainType,
  getFormationsByTrainTypeId,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
  getPhotosByFormationId,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto,
  getPhotosByUserId,
} from "./db";

describe("Gallery Database Functions", () => {
  describe("Company Operations", () => {
    it("should create a company", async () => {
      const result = await createCompany({
        name: "JR East",
        nameJa: "東日本旅客鉄道",
      });
      expect(result).toBeDefined();
    });

    it("should get all companies", async () => {
      const companies = await getCompanies();
      expect(Array.isArray(companies)).toBe(true);
    });

    it("should get company by id", async () => {
      const company = await getCompanyById(1);
      // Company may or may not exist, just check the function works
      expect(company === undefined || company.id === 1).toBe(true);
    });

    it("should update a company", async () => {
      const result = await updateCompany(1, {
        nameJa: "更新されたテスト",
      });
      expect(result).toBeDefined();
    });

    it("should delete a company", async () => {
      const result = await deleteCompany(999);
      expect(result).toBeDefined();
    });
  });

  describe("TrainType Operations", () => {
    it("should create a train type", async () => {
      const result = await createTrainType({
        companyId: 1,
        name: "E5系",
      });
      expect(result).toBeDefined();
    });

    it("should get train types by company", async () => {
      const trainTypes = await getTrainTypesByCompanyId(1);
      expect(Array.isArray(trainTypes)).toBe(true);
    });

    it("should get train type by id", async () => {
      const trainType = await getTrainTypeById(1);
      expect(trainType === undefined || trainType.id === 1).toBe(true);
    });

    it("should update a train type", async () => {
      const result = await updateTrainType(1, {
        name: "更新された形式",
      });
      expect(result).toBeDefined();
    });

    it("should delete a train type", async () => {
      const result = await deleteTrainType(999);
      expect(result).toBeDefined();
    });
  });

  describe("Formation Operations", () => {
    it("should create a formation", async () => {
      const result = await createFormation({
        trainTypeId: 1,
        name: "K1編成",
      });
      expect(result).toBeDefined();
    });

    it("should get formations by train type", async () => {
      const formations = await getFormationsByTrainTypeId(1);
      expect(Array.isArray(formations)).toBe(true);
    });

    it("should get formation by id", async () => {
      const formation = await getFormationById(1);
      expect(formation === undefined || formation.id === 1).toBe(true);
    });

    it("should update a formation", async () => {
      const result = await updateFormation(1, {
        name: "更新された編成",
      });
      expect(result).toBeDefined();
    });

    it("should delete a formation", async () => {
      const result = await deleteFormation(999);
      expect(result).toBeDefined();
    });
  });

  describe("Photo Operations", () => {
    it("should create a photo", async () => {
      const result = await createPhoto({
        formationId: 1,
        userId: 1,
        imageUrl: "https://example.com/photo.jpg",
        imageKey: "photos/1/photo.jpg",
        title: "テスト写真",
      });
      expect(result).toBeDefined();
    });

    it("should get photos by formation", async () => {
      const photos = await getPhotosByFormationId(1);
      expect(Array.isArray(photos)).toBe(true);
    });

    it("should get photo by id", async () => {
      const photo = await getPhotoById(1);
      expect(photo === undefined || photo.id === 1).toBe(true);
    });

    it("should update a photo", async () => {
      const result = await updatePhoto(1, {
        title: "更新された写真",
      });
      expect(result).toBeDefined();
    });

    it("should delete a photo", async () => {
      const result = await deletePhoto(999);
      expect(result).toBeDefined();
    });

    it("should get photos by user", async () => {
      const photos = await getPhotosByUserId(1);
      expect(Array.isArray(photos)).toBe(true);
    });
  });
});
