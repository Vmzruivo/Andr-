# Build limpo

O projeto não usa scripts `patch-*` para modificar o código durante o build.

## Local

```bash
npm ci
npm run build
```

O resultado deve conter `dist/index.html`.

## GitHub Pages

O workflow `.github/workflows/deploy.yml` executa instalação limpa, build e validação do artefato antes do deploy.

A variável `VITE_SUPABASE_URL` é pública. A `VITE_SUPABASE_PUBLISHABLE_KEY` deve ser configurada como secret do repositório quando o workflow estiver configurado para consumi-la.
