# Full Stack Application

Ứng dụng full stack sử dụng React + Material-UI cho frontend và Node.js + Express + PostgreSQL cho backend.

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- PostgreSQL
- npm hoặc yarn

## Cài đặt

### Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo database PostgreSQL:
```sql
CREATE DATABASE myapp;
```
4. Chạy file sql init.sql

5. Cập nhật thông tin kết nối database trong file `.env`

6. Chạy server:
```bash
npm run dev
```

### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng:
```bash
npm run dev
```

## Cấu trúc dự án

```
code/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   └── reportWebVitals.js
    └── package.json
```

## Truy cập ứng dụng

- Frontend: http://localhost:3458
- Backend API: http://localhost:5173
