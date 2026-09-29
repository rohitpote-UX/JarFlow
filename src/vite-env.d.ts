/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_BUSINESS_NAME?: string;
  readonly VITE_OWNER_NAME?: string;
  readonly VITE_DEFAULT_PHONE?: string;
  readonly VITE_DEFAULT_UPI_ID?: string;
  readonly VITE_DEFAULT_ADDRESS?: string;
  readonly VITE_DEFAULT_JAR_RATE?: string;
  readonly VITE_DEFAULT_LANGUAGE?: string;
  readonly VITE_TOTAL_GODOWN_JARS?: string;
  readonly VITE_LOW_STOCK_THRESHOLD?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_PWA?: string;
  readonly VITE_ENABLE_PUSH_NOTIFICATIONS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
