FROM node:lts

RUN apt-get update && apt-get install -y stress-ng

RUN  curl -L -O https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-oss-7.4.1-linux-x86_64.tar.gz && \
     tar xzvf metricbeat-oss-7.4.1-linux-x86_64.tar.gz && \
     rm metricbeat-oss-7.4.1-linux-x86_64.tar.gz
COPY ./metricbeat.yml /metricbeat-7.4.1-linux-x86_64/metricbeat.yml

WORKDIR /user/app
COPY ./src ./src
COPY ./config ./config
COPY run.sh ./run.sh
RUN chmod +x run.sh

COPY package*.json ./
RUN  npm install --production

CMD ./run.sh
