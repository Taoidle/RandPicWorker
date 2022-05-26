import { random, findIndex } from "lodash";

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
    if (data['bool']) {
        for (let i = 0; i < update_keys.length; i++) {
            const key = update_keys[i]
            const value = update_data[update_keys[i]];
            let insert = true;
            for (let i = 0; i < map_list.length; i++) {
                const map_get = await KV_PIC.get(map_list[i]);
                const map = JSON.parse(map_get as string);
                if (Object.keys(map).length !== 0) {
                    const map_keys = Object.keys(map);
                    if (findIndex(map_keys, key) !== -1) {
                        insert = false;
                    }
                }
            }
            if (insert) {
                total_num += 1;
                const map_index = Math.floor(total_num / 100);
                if (map_index > map_total) {
                    const map_key = await hashTimestamp();
                    await KV_PIC.put(map_key, JSON.stringify({}));
                    map_list.push(map_key);
                    map_num.push(0);
                    map_total += 1;
                }
                let map_insert: { [k: string]: any; } = JSON.parse((await KV_PIC.get(map_list[map_index])) as string);
                map_insert[key] = value;
                await KV_PIC.put(map_list[map_index], JSON.stringify(map_insert));
                map_num[map_index] += 1;
            }
        }
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
