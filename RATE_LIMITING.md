# Rate limiting

Protección contra abuso que queme la cuota de Vercel (Hobby) y de Supabase.
**Toda la limitación vive en el edge (Vercel WAF) — no hay código de rate limiting en el repo.**
Publicado: 2026-06-03.

## Por qué WAF y no middleware

- El WAF bloquea **antes** de invocar la función → el exceso no consume cuota de Vercel ni
  llega a `proxy.ts` (que hace 1 llamada a Supabase Auth por request).
- Rate limiting en middleware se ejecuta *después* de invocar la función: protege la DB pero
  no la cuota de Vercel. Se descartó (y contadores in-memory no sobreviven en Fluid Compute).
- Login/signup **no pasan por Vercel**: `login/page.tsx` llama a Supabase Auth directo desde
  el browser (`*.supabase.co`). Esa superficie la protegen los rate limits de Supabase Auth
  (ver abajo), no el WAF.

## Reglas activas (Vercel WAF, plan Hobby)

Hobby permite 3 custom rules, de las cuales máx. 1 de rate limit. Usamos 2:

| # | Regla | Condición | Acción |
|---|-------|-----------|--------|
| 1 | `Deny exploit probes` | path empieza con `/wp-admin`, `/wp-login`, `/.env`, `/.git`, `/phpmyadmin` o `/xmlrpc.php` | `deny` (403) |
| 2 | `Rate limit app (per IP)` | path NO empieza con `/_next/` | `rate_limit`: **300 req / 60 s por IP** (fixed window) → 429 al exceder |

Notas:
- El límite se subió de 100 a **300 req/60s** el 2026-06-04: 100/min era apretado para
  navegación rápida con prefetch de Next.js y para IPs compartidas (CGNAT, oficinas).
  300/min ≈ 5 req/s sostenidos — ningún uso humano lo alcanza, un bot sigue capado.
- **Excepción a "ningún uso humano lo alcanza" (2026-06-04)**: el prefetch automático de
  `<Link>` no va a ritmo humano — cada card que entra al viewport dispara requests RSC
  (`/movie/123?_rsc=...`), que NO empiezan con `/_next/` y sí cuentan. Scrollear grillas
  grandes (ranking, watchlist, search) generaba cientos de prefetches y 429 a usuarios
  legítimos. Fix en la app, no en el WAF: `prefetch={false}` en los `<Link>` de los
  componentes de item repetido (`MovieCard`, `MovieListRow`, `RankingList`). Además
  ahorra cuota: cada prefetch era una invocación de función que casi nunca se usaba.
- Los contadores del WAF son **por región** — un atacante distribuido puede exceder el límite ~N× regiones. Aceptable para esta app.
- La respuesta 429 la genera el WAF y no es personalizable desde nuestra config (no se le
  pueden añadir headers como `Retry-After`). La ventana es de 60 s.
- Además, la mitigación DDoS automática de Vercel (gratuita, siempre activa) desafía bursts
  agresivos antes de que la regla llegue a contar (`x-vercel-mitigated: challenge`, 403).
- Requests bloqueadas en edge **no se facturan**. Hobby incluye 1M de "allowed requests"
  evaluadas por la regla de rate limit por mes.

## Cómo ver / ajustar

```bash
vercel firewall rules list --expand        # ver reglas y condiciones
vercel firewall rules inspect "Rate limit app (per IP)"

# Ajustar el límite (ej. 500 req/60s) — OJO: edit reemplaza TODAS las condiciones,
# hay que repetirlas:
vercel firewall rules edit "Rate limit app (per IP)" \
  --condition '{"type":"path","op":"pre","value":"/_next/","neg":true}' \
  --action rate_limit \
  --rate-limit-window 60 \
  --rate-limit-requests 500 \
  --rate-limit-keys ip \
  --rate-limit-action rate_limit \
  --yes

vercel firewall diff                       # revisar cambios staged
vercel firewall publish --yes              # publicar
vercel firewall discard --yes              # descartar drafts
```

Rollback rápido: `vercel firewall rules disable "Rate limit app (per IP)" --yes && vercel firewall publish --yes`.

Tráfico de las reglas: dashboard → proyecto `directors-vault` → Firewall.

## Supabase Auth (login / signup / brute-force)

El WAF no puede ver estas requests (van browser → Supabase). Aplican los rate limits
integrados de Supabase Auth (por defecto, p. ej. ~30 req/5 min por IP en el endpoint de
token; emails limitados por hora). Ajustables en:

**Dashboard → Authentication → Rate Limits** (proyecto `vfywbuhnxtatqppzhjtx`).

Si algún día hay abuso real de login, el siguiente paso es habilitar CAPTCHA
(Turnstile/hCaptcha) en Authentication → Attack Protection.

## Verificación realizada (2026-06-03)

- `/wp-admin` y `/.env` → 403 (regla 1).
- Regla 2 demostrada bajando temporalmente el límite a 5/60s: request #5 → `HTTP/2 429` con
  `x-vercel-mitigated: deny` (sin header `Retry-After` — el WAF no lo envía). Restaurado
  inmediatamente después (el límite vigente es el de la tabla de arriba).
- Burst rápido (~10 req/s) → la mitigación DDoS automática desafía ANTES de que la regla
  cuente (403 + `x-vercel-mitigated: challenge`) y deja la IP marcada varios minutos —
  tenerlo en cuenta al probar contra producción.
- `/login` normal → 200; navegación autenticada intacta (no se tocó código).
