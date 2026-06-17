import rateLimit from "express-rate-limit"

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skip: () => process.env.NODE_ENV === "test",
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const otpRequestRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 OTP requests per window
  skip: () => process.env.NODE_ENV === "test",
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Terlalu banyak permintaan OTP. Coba lagi dalam 10 menit.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const otpVerifyRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 verification attempts per window
  skip: () => process.env.NODE_ENV === "test",
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Terlalu banyak percobaan verifikasi OTP. Coba lagi dalam 10 menit.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const moduleLaunchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 launches per window
  skip: () => process.env.NODE_ENV === "test",
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Terlalu banyak percobaan membuka modul. Coba lagi dalam 5 menit.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})
