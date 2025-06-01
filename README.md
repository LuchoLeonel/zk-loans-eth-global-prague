
## 🚀 How to run locally

#### 1. Setup environment variables

Explicas que estas son las variables que no estan en el .env.example del front.

NEXT_PUBLIC_OPENAI_API_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_VLAYER_API_TOKEN=
---

#### 2. Backend setup (NestJS)

```bash
cd backend
cp .env.example .env
```

##### Then run the backend:

```bash
yarn install
yarn start:dev
```

---

#### 3. Frontend setup (Next.js)

```bash
cd frontend
cp .env.example .env
yarn install
yarn dev
```

> 🎉 Once both servers are running, open [http://localhost:3000](http://localhost:3000) in your browser.  
> You should see ZK-Loans — congrats, it's live! 🚀

---