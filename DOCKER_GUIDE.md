# 🐳 Folksart IAM Frontend - Docker & GCP Cloud Run Deployment Guide

Panduan ini berisi langkah-langkah **step-by-step** untuk membangun (build), menguji di komputer lokal, dan mengimplementasikan aplikasi frontend React + Vite ini ke **Google Cloud Platform (GCP) Cloud Run** menggunakan file `Dockerfile`, `nginx.conf`, dan `.dockerignore` yang saat ini berada di root folder proyek Anda.

---

## 📂 Berkas Docker di Root Folder (Docker Files at Root Directory)

Berikut berkas-berkas yang telah disiapkan di root folder:
1.  **`/Dockerfile`**: Konfigurasi Multi-Stage Build. Tahap build menggunakan Node.js 20-alpine untuk menghasilkan static asset (`npm run build`), dan tahap runner menggunakan Nginx Alpine yang super ringan (~20MB) yang mematangkan performa serta memangkas beban sumber daya.
2.  **`/nginx.conf`**: Konfigurasi server Nginx yang menangani Client-Side Routing (Single Page App routing fallback). Jika pengguna melakukan *reload* halaman di sub-menu (misal `/kyc`), Nginx akan secara otomatis mengarahkan ke `index.html` dan diselesaikan dengan mulus oleh router React.
3.  **`/.dockerignore`**: Menghalangi berkas tidak perlu seperti `node_modules` lokal, logs, dan git masuk ke dalam image Docker.

---

## 💻 Bagian 1: Pengujian Docker di Komputer Lokal (Local Testing)

Pastikan Docker Desktop sudah aktif di komputer Anda, lalu buka terminal di root folder project Anda:

### 1. Build Docker Image Frontend
```bash
docker build -t folksart-iam-frontend:latest .
```

### 2. Jalankan Container Secara Lokal
Kami memetakan Nginx port internal `8080` ke port eksternal `8080` laptop Anda:
```bash
docker run -d -p 8080:8080 --name folksart-frontend folksart-iam-frontend:latest
```

### 3. Lakukan Pengujian
*   **Akses UI:** Buka browser Anda di `http://localhost:8080`
*   **Periksa daftar container aktif:** `docker ps`
*   **Lihat log kustom Nginx:** `docker logs -f folksart-frontend`
*   **Berhenti/Hapus container pengujian:** 
    ```bash
    docker stop folksart-frontend
    docker rm folksart-frontend
    ```

---

## ☁️ Bagian 2: Implementasi ke Google Cloud Platform (GCP Cloud Run)

Layanan **Google Cloud Run** adalah pilihan terbaik untuk menayangkan container aplikasi React Anda dengan dukungan HTTPS instan, kustom domain, scaling otomatis, serta biaya super hemat.

### 📋 Prasyarat Mandat GCP CLI
1. Pastikan Anda telah menginstal [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Login ke akun Google Cloud Anda:
   ```bash
   gcloud auth login
   ```
3. Setel ID proyek GCP target Anda:
   ```bash
   gcloud config set project ID_PROYEK_GCP_ANDA
   ```

---

### Step 1: Aktifkan Cloud run & Artifact Registry Services
Lakukan sekali di awal jika layanan ini belum pernah diaktifkan:
```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com
```

---

### Step 2: Buat Wadah Repositori Docker (Artifact Registry)
Buat repositori container bernama `folksart-repo` di region terdekat Anda (misal `asia-southeast1` untuk Singapore/Jakarta):
```bash
gcloud artifacts repositories create folksart-repo \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Repository Docker untuk Frontend Folksart IAM"
```

---

### Step 3: Konfigurasi Akses Autentikasi Docker Ke GCP
Izinkan utilitas Docker lokal Anda untuk mengirimkan container image ke server GCP Artifact Registry:
```bash
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

---

### Step 4: Tag Image Sesuai Struktur Registry GCP
Tandai image lokal Anda dengan pointing URL tujuan repositori cloud Artifact Registry:
```bash
docker tag folksart-iam-frontend:latest asia-southeast1-docker.pkg.dev/ID_PROYEK_GCP_ANDA/folksart-repo/folksart-frontend:latest
```

---

### Step 5: Kirim Image Docker ke Cloud (Push Image to Artifact Registry)
Saat melakukan proses push ini, Docker akan mentransfer asset terkompilasi Anda ke cloud secara aman:
```bash
docker push asia-southeast1-docker.pkg.dev/ID_PROYEK_GCP_ANDA/folksart-repo/folksart-frontend:latest
```

---

### Step 6: Deploy Layanan di Cloud Run
Jalankan instruksi deploy berikut untuk mengaktifkan URL publik aplikasi frontend Anda di internet:
```bash
gcloud run deploy folksart-iam-frontend \
  --image=asia-southeast1-docker.pkg.dev/ID_PROYEK_GCP_ANDA/folksart-repo/folksart-frontend:latest \
  --platform=managed \
  --region=asia-southeast1 \
  --allow-unauthenticated \
  --port=8080
```

*Setelah perintah selesai, terminal Anda akan menampilkan URL aktif dari Cloud Run (seperti `https://folksart-iam-frontend-xxxx-as.a.run.app`) yang bisa diakses langsung dari seluruh belahan dunia!*

---

*Disiapkan dengan standar industri DevOps terakreditasi oleh Senior Mobile & Full-stack Engineer Anda.*
