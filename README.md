# Página de vídeo em tela cheia

Página estática preparada para publicação no GitHub Pages. O vídeo é carregado
diretamente do repositório, com reprodução automática, em loop e sem controles.
O autoplay começa silencioso e o áudio do vídeo principal é habilitado no
primeiro toque. Uma camada transparente impede que o toque pause o vídeo.

## Arquivo de vídeo

O arquivo utilizado pela página está em:

```text
assets/video.mp4
```

## Visualizar localmente

Abra o projeto por meio de um servidor HTTP local. Por exemplo:

```bash
python3 -m http.server 8000
```

Depois, acesse `http://localhost:8000` no navegador.
