import type { ResourceContentDictionary } from "../../types";
import { compareResourcesEn } from "./compare";
import { guidesEn } from "./guides";
import { integrationsEn } from "./integrations";

export const resourcesEn = {
  ...integrationsEn,
  ...guidesEn,
  ...compareResourcesEn,
} satisfies ResourceContentDictionary;
