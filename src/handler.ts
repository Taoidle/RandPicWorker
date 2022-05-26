import { getKvIndex, isKvExist, randKvValue, updateKv } from "./workers";
import { map_validator, key_validator } from "./schema";

declare global {
    const JSDELIVR_URL: string;
    const GITHUB_USER: string;
    const GITHUB_REPO: string;
    const GITHUB_REPO_BRANCH: string;
}

export async function kvIndexRequest() {
    const kv_index = await getKvIndex();
    const json_data = JSON.stringify(kv_index);
    return new Response(json_data, {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}


export async function kvExistRequest(request: Request) {
    try {
        const content = await request.json();
        const json_data = JSON.parse(JSON.stringify(content));
        const result = key_validator.validate(json_data);
        if (result.valid) {
            const kv_keys = await isKvExist(json_data['key']);
            return new Response(JSON.stringify(kv_keys), {
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                },
            });
        } else {
            return r401();
        }
    } catch (e) {
        console.log("kv check exist error");
    }
}

export async function kvUpdateRequest(request: Request) {
    try {
        const content = await request.json();
        const json_data = JSON.parse(JSON.stringify(content));
        const result = map_validator.validate(json_data);
        if (result.valid) {
            await updateKv(json_data)
            return new Response(JSON.stringify({msg: "ok"}), {
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                },
            })
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
    } catch (e) {
        console.log("kv rand value false");
    }
}

function r401() {
    const json_data = {
        statusCode: 401,
        msg: "type error"
    };
    return new Response(JSON.stringify(json_data), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}
