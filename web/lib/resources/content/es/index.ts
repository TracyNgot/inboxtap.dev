import type { ResourceContentDictionary } from "../../types";
import { compareResourcesEs } from "./compare";
import { guidesEs } from "./guides";
import { integrationsEs } from "./integrations";

export const resourcesEs = {
  ...integrationsEs,
  ...guidesEs,
  ...compareResourcesEs,
} satisfies ResourceContentDictionary;
