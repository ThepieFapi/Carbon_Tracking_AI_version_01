FROM node:latest AS development

COPY . .
WORKDIR ./backend

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
