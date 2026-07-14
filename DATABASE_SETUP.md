# StudySpark MySQL Database Setup

StudySpark uses MySQL as the CA2 database foundation. 



StudySpark base/backend
```

## 1. Install And Start MySQL

Install MySQL locally, or run it using your team's preferred Docker setup later.

## 2. Create The Database

Create a database called:


studyspark
```

## 3. Run The Schema

Run this schema file in MySQL:


StudySpark base/backend/src/database/schema.sql
```

## 4. Create backend/.env

Create this file locally:


StudySpark base/backend/.env
```

Use `StudySpark base/.env.example` as the template.

Required database variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=studyspark
```

Do not commit `StudySpark base/backend/.env`.

## 5. Test The Database Routes

Start the backend:

```bash
cd "StudySpark base/backend"
npm run dev
```

Open:


http://localhost:5000/api/database/test
http://localhost:5000/api/database/tables
```
