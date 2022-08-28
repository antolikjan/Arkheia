FROM node:8

RUN mkdir -p /usr/src/Arkheia

#RUN npm install -g yo gulp-cli gulp


WORKDIR /usr/src/Arkheia

COPY . /usr/src/Arkheia
RUN chown -R node:node /usr/src/Arkheia

RUN apt-get install python3 python3-dev python3-pip python3-setuptools
# python3-tk python-nose subversion git libopenmpi-dev g++ libjpeg8 libjpeg8-dev libfreetype6 libfreetype6-dev zlib1g-dev libpng++-dev libncurses5 libncurses5-dev libreadline-dev liblapack-dev libblas-dev gfortran libgsl0-dev openmpi-bin python-tk cmake libboost-all-dev
# RUN pip3 install numpy scipy mpi4py matplotlib quantities lazyarray interval Pillow param==1.5.1 parameters neo cython pynn psutil future requests elephant pytest-xdist pytest-timeout junitparser

USER node

RUN source mozaik/bin/activate
RUN npm --production install
RUN npm install --global gulp@3.9.0
RUN npm link gulp

ENV NODE_ENV=production

EXPOSE 3000
RUN gulp serve

# change to whatever port is to be used
# EXPOSE 8080
# CMD ["node", "./server" ]