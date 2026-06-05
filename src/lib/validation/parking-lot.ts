import { z } from "zod";

import { PRIORITY_OPTIONS } from "@/lib/enums";

export const parkingLotSchema = z.object({
  id: z.string().optional(),
  topic: z.string().min(3, "Topic is required"),
  whyParked: z.string().optional(),
  followUp: z.string().optional(),
  priority: z.enum(PRIORITY_OPTIONS).optional(),
  suggestedForum: z.string().optional(),
  ownerText: z.string().optional(),
});

export type ParkingLotFormValues = z.infer<typeof parkingLotSchema>;
