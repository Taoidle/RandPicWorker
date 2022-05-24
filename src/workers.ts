import { random } from "lodash";

declare const KV_PIC: KVNamespace

export async function getKvNum() {
    return new Promise(async resolve => {
        resolve((await KV_PIC.list()).keys.length);
    })
}

export async function getKvKeys() {
    return new Promise(async resolve => {
        let json_data: { [key: string]: any } = {};
        const kv_list = await KV_PIC.list();
        const kv_keys = kv_list.keys;
        for (let i = 0; i < kv_keys.length; i++) {
            json_data[i] = JSON.parse(JSON.stringify(kv_keys[i]))['name'];
        }
        resolve(json_data);
    });
}

export async function isPicExist(hash: string) {
    return new Promise(async resolve => {
        const data = await KV_PIC.get(hash);
        if (data === null) {
            resolve({'bool': false});
        } else {
            resolve({'bool': true});
        }
    });
}

export async function updateKv(hash: string, value: string) {
    return new Promise(async resolve => {
        const is_exist = JSON.parse(JSON.stringify(await isPicExist(hash)))['bool'];
        if (!is_exist) {
            const data = await KV_PIC.put(hash, value);
            if (data === undefined) {
                resolve({'bool': true});
            } else {
                resolve({'bool': false, 'data': data})
            }
        } else {
            resolve({'bool': false})
        }
    });
}

export async function randKvValue() {
    return new Promise(async resolve => {
        const kv_keys = JSON.parse(JSON.stringify(await getKvKeys()));
        const kv_keys_len = (await KV_PIC.list()).keys.length;
        const index = random(kv_keys_len, false);
        resolve(await KV_PIC.get(kv_keys[index]));
    });
}
