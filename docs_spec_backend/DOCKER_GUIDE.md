# 🐳 Folksart IAM - Docker Deployment & GCP Cloud Run Guide

Panduan ini berisi langkah-langkah **step-by-step** untuk membangun (build), menguji di komputer lokal, dan mengimplementasikannya ke layanan cloud **Google Cloud Platform (GCP)**—khususnya **Cloud Run**—menggunakan file `Dockerfile` dan `.dockerignore` yang telah disediakan.

---

## 📂 Di mana Berkas Docker Disimpan? (Where are these Docker files stored?)

Semua berkas docker ini disimpan di folder **`docs_spec_backend/`**:
1.  **`docs_spec_backend/Dockerfile`**: File konfigurasi Multi-Stage Build Node.js + TypeScript ultra-ringkas dan aman.
2.  **`docs_spec_backend/.dockerignore`**: Menghindari pengunggahan file sampah seperti `node_modules` lokal, logs, dan kunci rahasia/credentials ke dalam container image.

> **💡 Tips Integrasi:** Saat tim Backend mulai mengodekan aplikasinya, silakan pindahkan file `Dockerfile` dan `.dockerignore` ini ke root folder proyek repositori backend Anda.

---

## 💻 Bagian 1: Pengujian Docker di Komputer Lokal (Local Testing)

Pastikan Docker Desktop sudah aktif di komputer Anda, lalu jalankan perintah berikut dari root proyek backend Anda:

### 1. Build Docker Image Secara Lokal
```bash
docker build -t folksart-iam-backend:1.0.0 -f docs_spec_backend/Dockerfile .
```

### 2. Jalankan Container Secara Lokal
```bash
docker run -d \
  -p 8080:8080 \
  --name folksart-backend \
  -e GEMINI_API_KEY="masukkan_api_key_gemini_anda" \
  -e APP_URL="http://localhost:8080" \
  folksart-iam-backend:1.0.0
```

### 3. Memeriksa Container Status & Logs
*   **Periksa status berjalan:** `docker ps`
*   **Lihat log sistem:** `docker logs -f folksart-backend`
*   **Uji endpoint HTTP Gateway:** Buka browser atau Postman ke `http://localhost:8080/api/v1/health`

---

## ☁️ Bagian 2: Implementasi ke Google Cloud Platform (GCP Cloud Run)

Layanan **Google Cloud Run** sangat direkomendasikan karena bersifat *serverless* (skala otomatis dari nol, hemat biaya, dan memiliki pertahanan SSL bawaan).

### 📋 Prasyarat Mandat GCP
1. Pastikan Anda telah menginstal [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Login ke akun Google Cloud Anda:
   ```bash
   gcloud auth login
   ```
3. Atur ID proyek aktif sesuai dengan Target GCP Project Anda:
   ```bash
   gcloud config set project ID_PROYEK_GCP_ANDA
   ```

---

### Step 1: Aktifkan API Layanan GCP yang Diperlukan
Lakukan sekali di awal proyek untuk membuka akses Artifact Registry, Cloud Build, dan Cloud Run:
```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com
```

---

### Step 2: Buat Repositori Penyimpanan di Artifact Registry
Buat repositori bertipe Docker dengan wilayah regional terdekat (contoh: `asia-southeast1` untuk Jakarta/Singapore):
```bash
gcloud artifacts repositories create folksart-repo \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Repository Docker untuk Backend Folksart IAM"
```

---

### Step 3: Konfigurasi Otentikasi Docker Ke GCP
Izinkan Docker lokal mengirimkan image langsung ke Artifact Registry milik GCP:
```bash
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

---

### Step 4: Build dan Tag Image untuk GCP Cloud Run
Beri tag khusus agar tertuju dengan aman ke repositori cloud Artifact Registry Anda:
```bash
# Tag Local Image Anda
docker tag folksart-iam-backend:1.0.0 asia-southeast1-docker.pkg.dev/ID_PROYEK_GCP_ANDA/folksart-repo/folksart-backend:latest
```

---

### Step 5: Unggah Docker Image ke GCP (Push Image)
```bash
docker push asia-southeast1-docker.pkg.dev/ID_PROYEK_GCP_ANDA/folksart-repo/folksart-backend:latest
```

---

### Step 6: Deploy ke Cloud Run dengan Konfigurasi Aman
Jalankan perintah di bawah ini untuk merilis container image tersebut langsung sebagai endpoint HTTPS yang aktif:
```bash
gcloud run deploy folksart-iam-api \
  --image=asia-southeast1-docker.pkg.dev/ID_PROYEK_GCP_ANDA/folksart-repo/folksart-backend:latest \
  --platform=managed \
  --region=asia-southeast1 \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,APP_URL=https://folksart-iam-api-xxxx.run.app" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY_SECRET_NAME:latest"
```

> **🔒 Catatan Keamanan Produksi:**  
> Selalu gunakan fitur **Cloud Secret Manager** GCP (`--set-secrets`) saat memetakan API Keys (seperti `GEMINI_API_KEY`), jangan menulis langsung plain-text pada argumen `--set-env-vars` untuk menghindari kebocoran kredensial di log GCP.

---

*Disiapkan dengan standar keamanan DevOps terakreditasi oleh Senior Mobile & Full-stack Engineer Anda.*
