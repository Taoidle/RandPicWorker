# rand-pic-worker

## 介绍

本项目是一个使用cloudflare worker和kv部署的随机图api，需要搭配 rand-pic-client(正在开发)使用

## 实现

### 随机图接口

由于cloudflare kv的免费额度限制，write、delete、list 每天只有1000次，而read有10万次， 所以尽可能将kv操作使用read来实现。

kv中存储了一个index数据，用来查找数据，如下：

```json
{
  "KV_INDEX": {
    "total_num": 300,
    "map_total": 3,
    "map_num": [
      "MAP_1_NUM",
      "MAP_2_NUM",
      "MAP_3_NUM"
    ],
    "map_list": [
      "MAP_KEY_1",
      "MAP_KEY_2",
      "MAP_KEY_3"
    ]
  }
}
```

存储了若干个表，表如下

```json
{
  "MAP_KEY_1": {
    "pic_1_hash": "pic_1_path",
    "pic_2_hash": "pic_2_path",
    "pic_3_hash": "pic_3_path",
    "pic_99_hash": "pic_99_path",
    "pic_100_hash": "pic_100_path"
  }
}
```
```json
{
  "MAP_KEY_2": {
    "pic_101_hash": "pic_101_path",
    "pic_102_hash": "pic_102_path",
    "pic_103_hash": "pic_103_path",
    "pic_199_hash": "pic_199_path",
    "pic_200_hash": "pic_200_path"
  }
}
```

```json
{
  "MAP_KEY_3": {
    "pic_201_hash": "pic_201_path",
    "pic_202_hash": "pic_202_path",
    "pic_203_hash": "pic_203_path",
    "pic_299_hash": "pic_299_path",
    "pic_300_hash": "pic_300_path"
  }
}
```

于是每次随机一张图会产生两次read操作，一次从索引中拿到map_key,一次从map中取数据
