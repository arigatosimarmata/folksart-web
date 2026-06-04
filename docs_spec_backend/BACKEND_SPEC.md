# Folksart Identity & Access Management - Backend System Specification

This document provides a **complete, 1:1 blueprint** and **AI Generator Prompt** to build a robust, secure, and production-ready backend service that integrates perfectly with the Folksart IAM frontend application.

---

## 💾 Di mana Prompt Ini Disimpan? (Where is this Prompt Stored?)

> **Lokasi File:** File ini disimpan secara permanen di root workspace Anda dengan nama **`/BACKEND_SPEC.md`**.
> Anda dapat menyalin seluruh isi file ini, atau mengunduhnya langsung melalui panel berkas untuk diberikan ke Developer Backend Anda atau diumpankan ke model AI (seperti Gemini, ChatGPT, atau Claude) untuk menghasilkan kode backend secara instan!

---

# 🤖 PART 1: The Master AI Backend Generator Prompt
*Salin seluruh teks di bawah ini dan tempelkan ke asisten AI pilihan Anda (Gemini, ChatGPT, atau Claude) untuk menghasilkan kode backend lengkap:*

```text
You are an expert Lead Backend Engineer. You are tasked with generating a production-proof, highly secure, performance-optimized, and fully documented backend service that matches 1:1 with the Folksart Identity & Access Management (IAM) Frontend.

### Technical Stack Options (Choose one or provide option for both):
1. Node.js with Express and TypeScript (with Prisma ORM or MongoDB Mongoose)
2. Go (Golang) with Gin and GORM

Please generate the entire codebase following these architectural principles:
- Robust JWT or Opaque Bearer Token security mechanism.
- Database validation matching the provided JSON Schema.
- Standard RESTful HTTP Status Codes.
- CORS enabled, security headers via helmet, and rate limiting.
- Fluent logging of all operations directly to an audit-log repository/table.
- Complete 1:1 endpoint routing configuration for:
  - Authentication & SSO (Gateway endpoints)
  - IAM User Lifecycle Management (Admin Console)
  - KYC Hub Uploads & Document Processing workflows
  - Developer Tools (API key resolution, simulations, telemetry logs)
  - User Profiles & Active Sessions Management

Refer to the database schema, type signatures, and OpenAPI 3.0 specification detailed below. Provide ready-to-run code, seed scripts to generate initial dummy identities, and instruction on setting up environment variables.
```

---

# 📊 PART 2: Database Schema (Relational/NoSQL Structure)

Berikut adalah skema tabel/koleksi database yang direkomendasikan untuk memfasilitasi seluruh menu dengan sempurna:

### 1. `identities` (Tabel User Utama)
*   `id` (VARCHAR(64) / UUID, Primary Key): ID unik dengan prefiks `usr_`.
*   `name` (VARCHAR(100)): Nama lengkap subjek.
*   `username` (VARCHAR(50), Unique): Username untuk sign-in.
*   `email` (VARCHAR(150), Unique): Email utama.
*   `phone` (VARCHAR(20)): Nomor telepon.
*   `avatar` (TEXT / URL): Tautan foto profil.
*   `role` (ENUM): `'Administrator'`, `'Operator'`, `'Security Officer'`, `'End User'`.
*   `status` (ENUM): `'Active'`, `'Deactivated'`, `'Banned'`.
*   `kycStatus` (ENUM): `'Verified'`, `'Pending Review'`, `'Not Started'`, `'Action Required'`.
*   `mfaEnabled` (BOOLEAN, Default: false): Status autentikasi dua faktor.
*   `mfaMethods` (JSON Array): Metode MFA yang diaktifkan (misal: `["authenticator_app", "sms"]`).
*   `ssoProvider` (VARCHAR(20), Nullable): `'Google'`, `'Apple'`, atau `NULL`.
*   `department` (VARCHAR(100)): Departemen penugasan.
*   `createdAt` (TIMESTAMP, Default: NOW)
*   `lastActive` (TIMESTAMP, Default: NOW)
*   `riskScore` (INT, Range: 0-100): Metrik kepatuhan risiko akses keamanan.
*   `opaqueToken` (VARCHAR(255), Unique): Token otorisasi payload pembawa rahasia untuk simulasi sandbox API.

### 2. `active_sessions` (Sesi Aktif Guna Mencegah Session Hijacking)
*   `id` (VARCHAR(64) / UUID, Primary Key): ID unik prefiks `ses_`.
*   `userId` (VARCHAR(64), Foreign Key -> `identities.id` ON DELETE CASCADE)
*   `device` (VARCHAR(100)): Jenis perangkat (misal: `"Apple MacBook Pro"`).
*   `browser` (VARCHAR(100)): Nama peramban (misal: `"Chrome v124"`).
*   `ip` (VARCHAR(45)): Alamat IP klien.
*   `location` (VARCHAR(100)): Geomapping lokasi (misal: `"Jakarta, ID"`).
*   `isCurrent` (BOOLEAN, Default: false)
*   `lastActive` (TIMESTAMP, Default: NOW)

### 3. `kyc_documents` (Daftar Validasi Dokumen Identitas)
*   `id` (VARCHAR(64) / UUID, Primary Key): ID unik prefiks `kyc_doc_`.
*   `userId` (VARCHAR(64), Foreign Key -> `identities.id` ON DELETE CASCADE)
*   `type` (ENUM): `'Passport'`, `'Driver License'`, `'National ID'`.
*   `fileName` (VARCHAR(255)): Tautan URL berkas/nama berkas asli.
*   `fileSize` (VARCHAR(50)): Ukuran visual berkas (misal: `"1.4 MB"`).
*   `uploadDate` (TIMESTAMP, Default: NOW)
*   `status` (ENUM): `'Idle'`, `'Processing'`, `'Approved'`, `'Rejected'`.
*   `validationMessage` (TEXT, Nullable): Feedback jika status ditolak.

### 4. `audit_logs` (Rekam Jejak Kepatuhan & Keamanan Sektoral)
*   `id` (VARCHAR(64) / UUID, Primary Key): ID unik prefiks `log_`.
*   `timestamp` (TIMESTAMP, Default: NOW)
*   `actor` (VARCHAR(150)): Siapa yang melakukan aksi (name/email).
*   `action` (VARCHAR(100)): Aksi (misal: `MFA_ENABLED_EMAIL`, `USER_DEACTIVATED`, `KYC_APPROVED`).
*   `target` (VARCHAR(255)): Entitas terdampak target.
*   `ipAddress` (VARCHAR(45)): Alamat IP pelaku.
*   `severity` (ENUM): `'info'`, `'warning'`, `'critical'`.

---

# 🗺️ PART 3: OpenAPI 3.0 Specification (JSON Spec)

Berikut adalah spesifikasi JSON API lengkap dengan format terstandarisasi untuk mempermudah pengerjaan dan integrasi di sisi Backend:

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Folksart IAM Central API Gateway",
    "description": "API Gateway terpadu untuk platform Folksart Identity & Access Management. Mendukung Manajemen Identitas, Audit Log Kepatuhan Risiko, Validasi Berkas KYC, dan SDK Kredensial Pengembang.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "/api/v1",
      "description": "Sandbox/Production Gateway"
    }
  ],
  "paths": {
    "/auth/login": {
      "post": {
        "summary": "Membuka autentikasi identitas dengan multi-identifier",
        "description": "Menyelesaikan validasi login menggunakan email, username, atau telepon ditambah kata sandi.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["identifier", "password"],
                "properties": {
                  "identifier": { "type": "string", "example": "tony.stark" },
                  "password": { "type": "string", "example": "••••••••••••" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Autentikasi Berhasil",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": { "type": "string", "example": "fol_at_3m9K2gH9u..." },
                    "mfaRequired": { "type": "boolean", "example": false },
                    "user": { "$ref": "#/components/schemas/IAMUser" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/identities": {
      "get": {
        "summary": "Mendapatkan daftar subjek identitas terdaftar",
        "parameters": [
          { "name": "search", "in": "query", "schema": { "type": "string" } },
          { "name": "role", "in": "query", "schema": { "type": "string" } },
          { "name": "status", "in": "query", "schema": { "type": "string" } },
          { "name": "kycStatus", "in": "query", "schema": { "type": "string" } },
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 10 } }
        ],
        "responses": {
          "200": {
            "description": "Koneksi Berhasil",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "users": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/IAMUser" }
                    },
                    "total": { "type": "integer", "example": 84 },
                    "page": { "type": "integer", "example": 1 },
                    "pages": { "type": "integer", "example": 9 }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Penyediaan subjek identitas (Provisioning) baru",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "email", "role", "department"],
                "properties": {
                  "name": { "type": "string" },
                  "email": { "type": "string" },
                  "role": { "type": "string" },
                  "department": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User Berhasil Ditambahkan",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/IAMUser" }
              }
            }
          }
        }
      }
    },
    "/identities/{id}": {
      "put": {
        "summary": "Memperbarui data identitas subjek",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/IAMUserUpdate" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Berhasil Diperbaharui",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/IAMUser" }
              }
            }
          }
        }
      },
      "delete": {
        "summary": "Menghapus/De-provisioning identitas subjek",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "description": "Identitas Berhasil Dihapus"
          }
        }
      }
    },
    "/identities/me": {
      "get": {
        "summary": "Melihat detail info user yang sedang aktif",
        "security": [{ "BearerAuth": [] }],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/IAMUser" }
              }
            }
          }
        }
      }
    },
    "/kyc/upload": {
      "post": {
        "summary": "Unggah Dokumen Verifikasi KYC",
        "description": "Menerima unggahan berkas gambar/PDF berupa Paspor, SIM, atau KTP untuk kemudian dijadwalkan verifikasi OCR.",
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "type": { "type": "string", "enum": ["Passport", "Driver License", "National ID"] },
                  "file": { "type": "string", "format": "binary" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Dokumen Berhasil Dikirim",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/KYCDocument" }
              }
            }
          }
        }
      }
    },
    "/kyc/review/{id}": {
      "post": {
        "summary": "Memproses persetujuan/penolakan KYC",
        "description": "Hanya diakses oleh Operator / Security Officer untuk memvalidasi syarat kelayakan subjek identitas.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["decision"],
                "properties": {
                  "decision": { "type": "string", "enum": ["Approved", "Rejected"] },
                  "validationMessage": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Status KYC berhasil diulas"
          }
        }
      }
    },
    "/audit-logs": {
      "get": {
        "summary": "Ekstraksi dan Pemantauan Seluruh Log Audit Kepatuhan",
        "parameters": [
          { "name": "search", "in": "query", "schema": { "type": "string" } },
          { "name": "severity", "in": "query", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/AuditLog" }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "Opaque/JWT"
      }
    },
    "schemas": {
      "IAMUser": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "example": "usr_9J2fK8xP" },
          "name": { "type": "string", "example": "Tony Stark" },
          "username": { "type": "string", "example": "tony.stark" },
          "email": { "type": "string", "example": "tony@stark.corp" },
          "phone": { "type": "string", "example": "+1-202-555-0143" },
          "avatar": { "type": "string", "example": "https://img.avatar" },
          "role": { "type": "string", "enum": ["Administrator", "Operator", "Security Officer", "End User"] },
          "status": { "type": "string", "enum": ["Active", "Deactivated", "Banned"] },
          "kycStatus": { "type": "string", "enum": ["Verified", "Pending Review", "Not Started", "Action Required"] },
          "mfaEnabled": { "type": "boolean" },
          "mfaMethods": { "type": "array", "items": { "type": "string" } },
          "ssoProvider": { "type": "string", "nullable": true },
          "department": { "type": "string", "example": "Quantum Engineering" },
          "createdAt": { "type": "string", "format": "date-time" },
          "lastActive": { "type": "string", "format": "date-time" },
          "riskScore": { "type": "integer", "minimum": 0, "maximum": 100 },
          "opaqueToken": { "type": "string" }
        }
      },
      "IAMUserUpdate": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "phone": { "type": "string" },
          "role": { "type": "string" },
          "status": { "type": "string" },
          "department": { "type": "string" },
          "mfaEnabled": { "type": "boolean" }
        }
      },
      "KYCDocument": {
        "type": "object",
        "properties": {
          "type": { "type": "string", "enum": ["Passport", "Driver License", "National ID"] },
          "fileName": { "type": "string" },
          "fileSize": { "type": "string" },
          "uploadDate": { "type": "string", "format": "date-time" },
          "status": { "type": "string", "enum": ["Idle", "Processing", "Approved", "Rejected"] },
          "validationMessage": { "type": "string" }
        }
      },
      "AuditLog": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "example": "log_8k4m3n9P" },
          "timestamp": { "type": "string", "format": "date-time" },
          "actor": { "type": "string", "example": "Security Daemon" },
          "action": { "type": "string", "example": "ACCESS_GRANTED" },
          "target": { "type": "string", "example": "usr_9J2fK8xP" },
          "ipAddress": { "type": "string", "example": "127.0.0.1" },
          "severity": { "type": "string", "enum": ["info", "warning", "critical"] }
        }
      }
    }
  }
}
```

---

# 🔗 PART 4: Migration / Cara Menghubungkan Frontend

Untuk mengubah aplikasi ini dari Mode Simulasi ke Live Database Backend, lakukan 3 langkah mudah berikut di Front-End Anda:

### 1. Buat Service Fetcher API terpusat (`/src/lib/api.ts`):
```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-iam.folksart.corp/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('folksart_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'API request failed');
  }
  return response.json();
}
```

### 2. Hubungkan state di `App.tsx`:
Ganti load/save state local storage di file `/src/App.tsx` dengan memanggil service `fetchWithAuth`:
```typescript
// Ganti state local / react state dengan fetch useSWR / react-query atau useEffect biasa
useEffect(() => {
  async function loadUsers() {
    try {
      const data = await fetchWithAuth('/identities');
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to load live backend users:", err);
    }
  }
  loadUsers();
}, []);
```

### 3. Aktifkan Environment Variable:
Tambahkan nilai endpoint di file `.env` sistem backend maupun frontend Anda:
```env
VITE_API_URL=https://alamat-domain-server-backend.com/api/v1
```

---

*Disiapkan dengan penuh dedikasi oleh Senior Mobile & Full-stack Engineer Anda untuk jaminan skalabilitas andal.*
