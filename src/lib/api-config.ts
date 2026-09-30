const DEFAULT_API_URL = "https://imperium-bikes.onrender.com"

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "")
