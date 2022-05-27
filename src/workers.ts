import { random, findIndex, union, List, toArray } from "lodash";

declare const KV_PIC: KVNamespace

export async function getKvIndex() {
    return new Promise(async resolve => {
        resolve(await isExistIndexKv());
    })
}

export async function isKvExist(key: string) {
    return new Promise(async resolve => {
        const data = await KV_PIC.get(key);
        if (data === null) {
            resolve({'bool': false});
        } else {
            resolve({'bool': true, 'data': data});
        }
    });
}

export async function updateKv(json_data: Object) {
    const update_data = JSON.parse(JSON.stringify(json_data));
    const update_keys = Object.keys(update_data);
    const data = JSON.parse(JSON.stringify(await isExistIndexKv()));
    const index_data = JSON.parse(data['data']);
    let total_num = index_data['total_num'];
    let map_total = index_data['map_total'];
    let map_num = index_data['map_num'];
    let map_list = index_data['map_list'];
    let map_update: { [k: string]: any; } = {};
    let map_kv: List<any> | null | undefined = [];
    for (let i = 0; i < map_list.length; i++) {
        map_kv = union(map_kv, toArray(Object.keys(JSON.parse(await KV_PIC.get(map_list[i]) as string))))
    }
    if (data['bool']) {
        for (let i = 0; i < update_keys.length; i++) {
            const key = update_keys[i]
            const value = update_data[update_keys[i]];
            let insert = true;
            if (map_kv.length !== 0) {
                if (findIndex(map_kv, key) !== -1) {
                    insert = false;
                }
            }
            if (insert) {
                const map_index = Math.floor(total_num / 100);
                if (map_index >= map_total) {
                    const map_key = (await hashTimestamp()) + i.toString();
                    map_update[map_key] = {};
                    map_list.push(map_key);
                    map_num.push(0);
                    map_total += 1;
                }
                if (map_update[map_list[map_index]] === null) {
                    map_update[map_list[map_index]] = JSON.parse((await KV_PIC.get(map_list[map_index])) as string);
                }
                if (map_update[map_list[map_index]] === undefined) {
                    map_update[map_list[map_index]] = {};
                }
                map_update[map_list[map_index]][key] = {};
                map_update[map_list[map_index]][key] = value;
                map_num[map_index] += 1;
                map_kv = union(map_kv, [key]);
                total_num += 1;
            }
        }
    }
    const map_update_key = Object.keys(map_update);
    for (let i = 0; i < map_update_key.length; i++) {
        await KV_PIC.put(map_update_key[i], JSON.stringify(map_update[map_update_key[i]]));
    }
    index_data['total_num'] = total_num;
    index_data['map_total'] = map_total;
    index_data['map_num'] = map_num;
    index_data['map_list'] = map_list;
    await KV_PIC.put("KV_INDEX", JSON.stringify(index_data));
}

export async function randKvValue() {
    return new Promise(async resolve => {
        const json_data = JSON.parse(JSON.stringify(await isExistIndexKv()));
        const data = JSON.parse(json_data['data']);
        const r_index = random(data['total_num'], false);
        const map = JSON.parse(await KV_PIC.get(data['map_list'][Math.floor(r_index / 100)]) as string);
        resolve(map[Object.keys(map)[Math.floor(r_index % 100) - 1]]);
    });
}

async function isExistIndexKv() {
    return new Promise(async resolve => {
        const data = await KV_PIC.get("KV_INDEX");
        if (data === null) {
            const map_key = await hashTimestamp();
            await KV_PIC.put(map_key, JSON.stringify({}));
            const data = {
                total_num: 0,
                map_total: 1,
                map_num: [0],
                map_list: [map_key],
            }
            const req = await KV_PIC.put("KV_INDEX", JSON.stringify(data));
            if (req === undefined) {
                resolve({'bool': true, 'data': data, 'msg': "index init success"})
            } else {
                resolve({'bool': false, 'data': req})
            }
        } else {
            resolve({'bool': true, 'data': data});
        }
    });
}


async function hashTimestamp() {
    const timestamp = new TextEncoder().encode((Math.floor(Date.now() / 1000)).toString());
    const hashDigest = await crypto.subtle.digest(
        {
            name: 'SHA-256',
        },
        timestamp
    );
    const hashArray = Array.from(new Uint8Array(hashDigest));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
