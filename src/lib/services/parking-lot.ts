import type { ParkingLotItem } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ParkingLotRow = ParkingLotItem;

export async function getParkingLot(): Promise<ParkingLotRow[]> {
  return prisma.parkingLotItem.findMany({
    orderBy: { externalId: "asc" },
  });
}
