import { z } from "zod";

export const markReadSchema = z.object({
  id: z.string().min(1),
  read: z.boolean().default(true),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;
