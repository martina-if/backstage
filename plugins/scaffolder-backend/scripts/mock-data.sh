#!/usr/bin/env bash

for URL in \
  'react-ssr-template' \
  'springboot-grpc-template' \
  'create-react-app' \
; do \
  curl \
    --location \
    --request POST 'https://backend.backstage-demo.roadie.io/catalog/locations' \
    --header 'Content-Type: application/json' \
    --data-raw "{\"type\": \"github\", \"target\": \"https://github.com/spotify/backstage/blob/master/plugins/scaffolder-backend/sample-templates/${URL}/template.yaml\"}"
  echo
done
