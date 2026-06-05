import { z } from "zod";

export const assumptionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, "Description is required"),
  areaImpacted: z.string().optional(),
  validationRequired: z.string().optional(),
  riskIfWrong: z.string().optional(),
  validatorPersonId: z.string().optional(),
  validatorText: z.string().optional(),
});

export type AssumptionFormValues = z.infer<typeof assumptionSchema>;
