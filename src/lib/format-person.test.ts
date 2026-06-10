import { describe, expect, it } from "vitest";

import {
  formatOwnerDisplay,
  formatPersonName,
  formatWorkstreamLead,
} from "./format-person";

describe("formatPersonName", () => {
  it("joins displayName and surname", () => {
    expect(formatPersonName({ displayName: "Natalie", surname: "Patel" })).toBe("Natalie Patel");
  });

  it("uses displayName when surname is missing", () => {
    expect(formatPersonName({ displayName: "Natalie", surname: null })).toBe("Natalie");
  });

  it("falls back to the provided string when no person", () => {
    expect(formatPersonName(null, "Team Alpha")).toBe("Team Alpha");
  });

  it("returns Unassigned when nothing is available", () => {
    expect(formatPersonName(null, null)).toBe("Unassigned");
  });
});

describe("formatOwnerDisplay (Person wins)", () => {
  it("prefers the assigned Person over a stale free-text copy (the reported bug)", () => {
    // ownerText is the stale multi-name string; ownerPerson is the reassigned owner.
    expect(
      formatOwnerDisplay("Natalie Patel; Bernice Bryce; Justin Evans", {
        displayName: "Gareth",
        surname: "Bew",
      }),
    ).toBe("Gareth Bew");
  });

  it("uses multi-owner free-text when no Person is assigned", () => {
    expect(
      formatOwnerDisplay("Natalie Patel; Bernice Bryce; Justin Evans", null),
    ).toBe("Natalie Patel; Bernice Bryce; Justin Evans");
  });

  it("uses single free-text when no Person is assigned", () => {
    expect(formatOwnerDisplay("External Vendor", null)).toBe("External Vendor");
  });

  it("returns Unassigned when neither is set", () => {
    expect(formatOwnerDisplay(null, null)).toBe("Unassigned");
    expect(formatOwnerDisplay("   ", undefined)).toBe("Unassigned");
  });
});

describe("formatWorkstreamLead (Person wins)", () => {
  it("prefers the assigned lead Person over stale leadText (the reported bug)", () => {
    expect(
      formatWorkstreamLead("Natalie Patel; Bernice Bryce; Justin Evans", {
        displayName: "Gareth",
        surname: "Bew",
      }),
    ).toBe("Gareth Bew");
  });

  it("uses free-text lead when no Person is assigned", () => {
    expect(
      formatWorkstreamLead("Bernice Bryce", null),
    ).toBe("Bernice Bryce");
  });

  it("returns Unassigned when neither is set", () => {
    expect(formatWorkstreamLead(null, null)).toBe("Unassigned");
  });
});
