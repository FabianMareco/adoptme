FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "--experimental-vm-modules", "src/app.js"]
