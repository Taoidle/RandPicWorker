import { getKvKeys, getKvNum, isPicExist, randKvValue, updateKv } from "./workers";
import { Validator } from "@cfworker/json-schema";

declare global {
    const JSDELIVR_URL: string;
    const GITHUB_USER: string;
    const GITHUB_REPO: string;
    const GITHUB_REPO_BRANCH: string;
}

export async function kvNumRequest() {
    const kv_num = await getKvNum();
    const data = {
        kv_num: kv_num,
    };
    const json_data = JSON.stringify(data, null, 2);
    return new Response(json_data, {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}

export async function kvKeysRequest() {
    try {
        const kv_keys = await getKvKeys();
        return new Response(JSON.stringify(kv_keys));
    } catch (e) {
        console.log("kv get keys error");
    }
}

export async function kvExistRequest(request: Request) {
    try {
        const validator = new Validator({
            type: "object",
            required: ['hash'],
            properties: {
                hash: {type: "string"}
            }
        });
        const content = await request.json();
        const json_data = JSON.parse(JSON.stringify(content));
        const result = validator.validate(json_data);
        if (result.valid) {
            const kv_keys = await isPicExist(json_data['hash']);
            return new Response(JSON.stringify(kv_keys));
        } else {
            return r401();
        }
    } catch (e) {
        console.log("kv check exist error");
    }
}

export async function kvUpdateRequest(request: Request) {
    try {
        const validator = new Validator({
            type: "object",
            patternProperties: {
                "^.*$": {type: "string"}
            }
        });
        const content = await request.json();
        const json_data = JSON.parse(JSON.stringify(content));
        const result = validator.validate(json_data);
        if (result.valid) {
            const json_keys = Object.keys(json_data);
            for (let i = 0; i < json_keys.length; i++) {
                await updateKv(json_keys[i], json_data[json_keys[i]]);
            }
            return new Response(JSON.stringify({msg: "ok"}))
        } else {
            return r401();
        }
    } catch (e) {
        console.log("kv update error");
    }
}

export async function kvRandValue() {
    try {
        const url = JSDELIVR_URL + GITHUB_USER + '/' + GITHUB_REPO + '@' + GITHUB_REPO_BRANCH + '/';
        const img_url = await randKvValue();
        const jsdelivr_url = url + img_url;
        return Response.redirect(jsdelivr_url);
    }catch (e) {
        console.log("kv rand value false");
    }
}

function r401() {
    const json_data = {
        statusCode: 401,
        msg: "type error"
    };
    return new Response(JSON.stringify(json_data));
}
