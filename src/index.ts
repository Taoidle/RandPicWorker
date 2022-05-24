import { Router } from 'itty-router'
import { kvExistRequest, kvKeysRequest, kvNumRequest, kvRandValue, kvUpdateRequest } from "./handler";

const router = Router()

router.get('/', () => new Response('rand pic worker running'));

router.get('/api/kv_num', kvNumRequest);

router.get('/api/kv_keys', kvKeysRequest)

router.post('/api/kv_exist', kvExistRequest)

router.post('/api/kv_update', kvUpdateRequest);

router.get('/api/img', kvRandValue);

addEventListener('fetch', (event: FetchEvent) =>
    event.respondWith(router.handle(event.request))
)
