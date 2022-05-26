import { Schema, Validator } from "@cfworker/json-schema";

const KEY_SCHEMA: Schema = {
    type: "object",
    required: ['key'],
    properties: {
        key: {type: "string"}
    }
}

const MAP_SCHEMA: Schema = {
    type: "object",
    patternProperties: {
        "^.*$": {type: "string"}
    }
};

const INDEX_SCHEMA: Schema = {
    type: "object",
    required: ['index'],
    properties: {
        total_num: {type: "number"},
        map_total: {type: "number"},
        map_num: {
            type: "array",
            items: {type: "number"}
        },
        map_list: {
            type: "array",
            items: {type: "string"}
        }
    }
}

export const key_validator = new Validator(KEY_SCHEMA);
export const map_validator = new Validator(MAP_SCHEMA);
export const index_validator = new Validator(INDEX_SCHEMA);
