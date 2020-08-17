FROM node AS BUILDER

WORKDIR /usr/src/app

COPY ./package.json .

RUN yarn

COPY . .

RUN yarn build

FROM node

WORKDIR /usr/src/app

COPY ./package.json ./

RUN yarn --prod

COPY --from=BUILDER /usr/src/app/dist/ . 

COPY --from=BUILDER /usr/src/app/index.sh .

CMD ["yarn", "docker"]
