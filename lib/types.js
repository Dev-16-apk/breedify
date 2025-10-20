// User roles for the livestock classification system
export const USER_ROLES = {
  ADMIN: "admin",
  FIELD_OFFICER: "field_officer",
  VETERINARIAN: "veterinarian",
}

// Animal types supported by the system
export const ANIMAL_TYPES = {
  CATTLE: "cattle",
  BUFFALO: "buffalo",
}

// Analysis status types
export const ANALYSIS_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
}

// Physical trait categories for scoring
export const TRAIT_CATEGORIES = {
  BODY_LENGTH: "body_length",
  HEIGHT_AT_WITHERS: "height_at_withers",
  CHEST_WIDTH: "chest_width",
  RUMP_ANGLE: "rump_angle",
  UDDER_QUALITY: "udder_quality",
  OVERALL_CONFORMATION: "overall_conformation",
}
