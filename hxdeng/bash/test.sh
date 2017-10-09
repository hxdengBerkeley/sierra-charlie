#!/bin/sh

#2017-10-08T14:03:18.000Z UTC to update data

rm -rf ./test/osm_data_new/*
#download file
target_URL="https://s3.amazonaws.com/metro-extracts.mapzen.com/san-francisco_california.imposm-geojson.zip"
wget -b -q -P ./test/osm_data_new/ ${target_URL}

#sync files to AWS S3
aws s3 sync ./test/osm_data_new/. s3://osm-ucb/

#unzip the zips in data_new
#wait $!
#unzip -o ./test/osm_data_new/* -d ./test/osm_data_now/

echo "hello world"
