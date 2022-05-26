import { Router } from 'itty-router'
import { kvExistRequest, kvIndexRequest, kvRandValue, kvUpdateRequest } from "./handler";

const router = Router()

router.get('/', () => new Response('rand pic worker running'));

router.get('/api/kv_index', kvIndexRequest);

router.post('/api/kv_exist', kvExistRequest)

router.post('/api/kv_update', kvUpdateRequest);

router.get('/api/img', kvRandValue);

addEventListener('fetch', (event: FetchEvent) =>
    event.respondWith(router.handle(event.request))
)
