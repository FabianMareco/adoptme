FROM node:20-alpine

LABEL maintainer="AdoptMe Dev Team"
LABEL description="AdoptMe API - Coderhouse Backend III"

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "src/app.js"]
