import type { ResourceContentDictionary } from "../../types";
import { compareResourcesFr } from "./compare";
import { guidesFr } from "./guides";
import { integrationsFr } from "./integrations";

export const resourcesFr = {
  ...integrationsFr,
  ...guidesFr,
  ...compareResourcesFr,
} satisfies ResourceContentDictionary;
