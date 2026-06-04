# Tupã - Weather & Climate Dashboard

O **Tupã** é um painel interativo de visualização de dados climáticos projetado para traduzir observações complexas da Terra em informações práticas e acessíveis para o planejamento de atividades ao ar livre (como caminhadas, viagens, pesca, etc.). 

O projeto foi desenvolvido originalmente como parte de um desafio do **NASA Space Apps Challenge**, focando em analisar e apresentar a probabilidade de condições climáticas extremas ("muito quente", "muito frio", "muito vento" ou "muito úmido").

---

## Funcionalidades

- **Busca por Localização Dinâmica**: Geocodificação integrada usando a API do *Nominatim (OpenStreetMap)* para buscar qualquer cidade do mundo.
- **Dados Históricos e Previsões**: Conexão direta com a API **NASA POWER (Prediction Of Worldwide Energy Resources)** para puxar dados meteorológicos diários de coordenadas precisas.
- **Indicadores Detalhados**:
  - Temperatura Média (com alertas visuais dinâmicos de cor: Vermelho para >30°C, Amarelo para 18-30°C, Azul para <18°C).
  - Umidade Relativa do Ar.
  - Velocidade do Vento (medida a 10 metros de altura).
  - Irradiação Solar acumulada (kWh/m²).
  - Pressão Atmosférica.
  - Probabilidade de Chuva calculada sob algoritmo próprio baseado na umidade, água precipitável e radiação solar.
- **Exportação de Dados**: Geração e download instantâneo de relatórios em formato **CSV** com as métricas do dia pesquisado.
- **Experiência Premium (Splash Screen)**: Tela de apresentação animada com salvamento de estado em `sessionStorage` para evitar exibições repetidas enquanto navega no site.
- **Design Glassmorphism Moderno**: Interface construída com efeitos de transparência (backdrop blur), sombras flutuantes e responsividade total usando Bootstrap 5.

---

## Tecnologias Utilizadas

- **Estrutura**: HTML5 (tags semânticas e acessibilidade).
- **Estilização**: CSS3 Vanilla (regras customizadas de Glassmorphic Design) e Bootstrap 5.3.3.
- **Ícones**: Bootstrap Icons.
- **Comportamento**: JavaScript Vanilla (ES6+, requisições assíncronas assíncronas `fetch`, geolocalização e manipulação do DOM).

---

## Créditos

Os dados de recursos de energia e meteorologia são fornecidos gentilmente pelo projeto **NASA Prediction Of Worldwide Energy Resources (POWER)**.
A aplicação foi projetada e refinada pelo time **Tupã** em colaboração com o espaço e desenvolvimento local.
