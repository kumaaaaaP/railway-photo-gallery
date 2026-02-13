import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
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
} from "../server/db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  gallery: router({
    companies: router({
      list: publicProcedure.query(async () => {
        return getCompanies();
      }),
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return getCompanyById(input.id);
        }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string(),
            nameJa: z.string(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          return createCompany(input);
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            nameJa: z.string().optional(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          const { id, ...data } = input;
          return updateCompany(id, data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          return deleteCompany(input.id);
        }),
    }),

    trainTypes: router({
      listByCompany: publicProcedure
        .input(z.object({ companyId: z.number() }))
        .query(async ({ input }) => {
          return getTrainTypesByCompanyId(input.companyId);
        }),
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return getTrainTypeById(input.id);
        }),
      create: protectedProcedure
        .input(
          z.object({
            companyId: z.number(),
            name: z.string(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          return createTrainType(input);
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          const { id, ...data } = input;
          return updateTrainType(id, data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          return deleteTrainType(input.id);
        }),
    }),

    formations: router({
      listByTrainType: publicProcedure
        .input(z.object({ trainTypeId: z.number() }))
        .query(async ({ input }) => {
          return getFormationsByTrainTypeId(input.trainTypeId);
        }),
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return getFormationById(input.id);
        }),
      create: protectedProcedure
        .input(
          z.object({
            trainTypeId: z.number(),
            name: z.string(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          return createFormation(input);
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          const { id, ...data } = input;
          return updateFormation(id, data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          return deleteFormation(input.id);
        }),
    }),

    photos: router({
      listByFormation: publicProcedure
        .input(z.object({ formationId: z.number() }))
        .query(async ({ input }) => {
          return getPhotosByFormationId(input.formationId);
        }),
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return getPhotoById(input.id);
        }),
      create: protectedProcedure
        .input(
          z.object({
            formationId: z.number(),
            imageUrl: z.string(),
            imageKey: z.string(),
            thumbnailUrl: z.string().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            shootDate: z.date().optional(),
            location: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          return createPhoto({ ...input, userId: ctx.user.id });
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().optional(),
            description: z.string().optional(),
            shootDate: z.date().optional(),
            location: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const photo = await getPhotoById(input.id);
          if (!photo || photo.userId !== ctx.user.id) {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          const { id, ...data } = input;
          return updatePhoto(id, data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const photo = await getPhotoById(input.id);
          if (!photo || photo.userId !== ctx.user.id) {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          return deletePhoto(input.id);
        }),
      listByUser: protectedProcedure.query(async ({ ctx }) => {
        return getPhotosByUserId(ctx.user.id);
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
