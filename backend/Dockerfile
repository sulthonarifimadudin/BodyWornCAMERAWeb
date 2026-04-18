FROM node:20-alpine

WORKDIR /app

# Install dependencies first (untuk memanfaat cache layer docker)
COPY package*.json ./
RUN npm install --production

# Salin sisa kode backend
COPY . .

# Buat folder uploads jika belum ada
RUN mkdir -p uploads

# Expose port backend
EXPOSE 3000

CMD ["node", "server.js"]
