FROM node:22-alpine

WORKDIR /usr/app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN touch .env

CMD ["npm", "start"]
