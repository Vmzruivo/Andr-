# Segurança e manutenção

- O frontend nunca deve ser a única camada de autorização; operações administrativas e dados privados devem ser protegidos por RLS/RPC no Supabase.
- Não colocar chaves secretas, service-role keys ou credenciais administrativas no código do navegador.
- Alterações estruturais devem ser feitas no código principal ou em migrações versionadas, não por scripts que reescrevem o código durante `npm run build`.
- Validar entradas no cliente para UX e no banco/API para segurança.
- Mudanças críticas devem ser verificadas pelo build antes de serem consideradas publicadas.
- O cargo administrativo deve ser verificado no servidor/banco; esconder um botão não é autorização.
