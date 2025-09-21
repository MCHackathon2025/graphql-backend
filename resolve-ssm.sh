#!/bin/bash

source ./development.properties
OUTPUT_FILE="parameters.properties"

function resolveSSM() {
    declare -A params
    params["UserIdTableName"]="/$SS/$ENV/$SN/dynamodb/user-id-table/table-name"
    params["EventIdTableName"]="/$SS/$ENV/$SN/dynamodb/event-id-table/table-name"

    if [ -f "$OUTPUT_FILE" ] ; then
        rm "$OUTPUT_FILE"
    fi

    for key in "${!params[@]}"
    do
        value=${params[$key]}
        res=$(aws ssm get-parameter --name "$value" --query Parameter.Value --region ap-east-2)
        if [ -n "$res" ]; then
            echo "Retrived parameter: $key=$res"
            echo "$key"="$res" >> "$OUTPUT_FILE"
        else
            echo "Error: Failed to retrive: $key"
        fi
    done
}

resolveSSM
