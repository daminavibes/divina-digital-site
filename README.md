# Site da Divina Digital

Site estático (HTML, CSS e JavaScript puro, com GSAP pelo CDN). Não precisa de servidor nem de build para funcionar: é só publicar esta pasta.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Início: herói com a Faísca espiando, os três serviços, painel de amostra, processo, perguntas e chamada |
| `sites.html` | Criação e reformulação de sites, painel de velocidade e conversão, métricas explicadas e padrão de qualidade |
| `trafego.html` | Tráfego pago, relatório da campanha (funil e gráfico), métricas explicadas, simulador e padrão |
| `programacao.html` | Sistemas e apps sob medida, painel de tempo e erro, métricas explicadas e padrão |
| `contato.html` | Formulário que monta a mensagem e abre o WhatsApp (nada é enviado pelo site) |
| `404.html` | Página de erro usada automaticamente pelo GitHub Pages |

`servicos.html`, `resultados.html` e `metodo.html` são endereços antigos: só redirecionam para a página nova equivalente.

## A Faísca

`assets/js/faisca.js` monta a mascote em qualquer `<div data-faisca>`:

- o corpo vem de `assets/img/faisca-corpo.webp` (a estrela sem olhos) e os olhos são desenhados em SVG por cima;
- os olhos seguem o cursor (ou o dedo, no celular) e piscam sozinhos; sem cursor, ela olha em volta;
- com `data-entrada="espiada"` ela entra como nos reels: mãozinhas na borda, espia, olha pros lados e sobe;
- atributos: `data-espelho` (vira para o outro lado), `data-maos` (mostra as mãos), `data-sobe` (quanto fica escondido, em %);
- quem usa "reduzir movimento" no sistema vê tudo parado, no estado final.

A arte sem olhos e as medidas dos olhos saem de `tools/make_site_assets.py`, no projeto da marca.

## Como editar

Os textos ficam em `tools/site_src/` no projeto da marca (um arquivo por página). Depois de editar, rode:

```
cd tools
python build_site.py
```

Para ver no computador: `python -m http.server 8090 --directory site` e abra http://localhost:8090.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `divina-digital-site`).
2. Envie esta pasta para ele:
   ```
   git remote add origin https://github.com/SEU-USUARIO/divina-digital-site.git
   git push -u origin main
   ```
3. No GitHub: **Settings > Pages > Build and deployment > Source: Deploy from a branch**, branch `main`, pasta `/ (root)`.
4. Em alguns minutos o site fica em `https://SEU-USUARIO.github.io/divina-digital-site/`.
5. Domínio próprio (opcional): em **Settings > Pages > Custom domain**, informe o domínio e crie no seu provedor um registro CNAME apontando para `SEU-USUARIO.github.io`.

Depois de ter o endereço final, preencha `SITE` em `tools/site_src/base.py` e rode o build de novo: isso liga o link canônico e a imagem de compartilhamento com endereço completo.

## Antes de divulgar, confirme

Esses pontos estão no site como compromisso da marca. Ajuste se algum não valer:

- primeira resposta em até 1 dia útil no WhatsApp;
- relatório semanal para clientes de tráfego;
- prazos de referência: página de vendas 1 a 2 semanas, site institucional 2 a 4 semanas;
- contas, domínio e código no nome do cliente;
- meta de carregamento abaixo de 2,5 s.

Os painéis e gráficos usam **dados de exemplo** e estão marcados assim. Quando tiver resultados reais (com autorização do cliente), dá para trocar por casos de verdade.
