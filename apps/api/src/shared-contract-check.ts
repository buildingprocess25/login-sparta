import {
  SPARTA_MODULE_IDS,
  type ApiSuccess,
  type SpartaSessionDto,
} from "@sparta/shared"

export const API_SHARED_MODULE_IDS = SPARTA_MODULE_IDS

export type ApiSessionResponse = ApiSuccess<SpartaSessionDto>
