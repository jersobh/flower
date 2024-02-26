FROM node:latest

WORKDIR /flower

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "test"]

