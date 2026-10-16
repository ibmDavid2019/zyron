import type { ActivityGeo, EventGeo, LngLat, RouteGeo } from "@/types/map";

/** Ibirapuera Park, São Paulo — default map center (matches CURRENT_USER's city). */
export const DEFAULT_MAP_CENTER: LngLat = [-46.6576, -23.5874];
export const DEFAULT_MAP_ZOOM = 12.5;

// Hand-authored coordinate paths near real São Paulo / Rio landmarks. Not
// snapped to actual streets — a future pass could route these through the
// Mapbox Directions API for road-accurate paths.
export const MOCK_ROUTE_GEO: Record<string, RouteGeo> = {
  r1: {
    // Volta do Ibirapuera — loop around Ibirapuera Park
    path: [
      [-46.6621, -23.5827],
      [-46.6578, -23.5809],
      [-46.6533, -23.5836],
      [-46.6524, -23.5883],
      [-46.6558, -23.5924],
      [-46.6608, -23.5918],
      [-46.6635, -23.5875],
      [-46.6621, -23.5827],
    ],
    rating: 4.8,
  },
  r2: {
    // Ciclofaixa da Orla — Copacabana to Ipanema, Rio
    path: [
      [-43.1822, -22.9711],
      [-43.1888, -22.9789],
      [-43.1965, -22.9838],
      [-43.2033, -22.9868],
      [-43.2103, -22.9878],
    ],
    rating: 4.6,
  },
  r3: {
    // Trilha do Pico do Jaraguá
    path: [
      [-46.7712, -23.4589],
      [-46.7695, -23.4572],
      [-46.7676, -23.4561],
      [-46.7658, -23.4556],
      [-46.7641, -23.4548],
    ],
    rating: 4.9,
  },
  r4: {
    // Parque Villa-Lobos — loop
    path: [
      [-46.7238, -23.5432],
      [-46.7204, -23.5418],
      [-46.7178, -23.5443],
      [-46.7189, -23.5474],
      [-46.7223, -23.5480],
      [-46.7245, -23.5456],
      [-46.7238, -23.5432],
    ],
    rating: 4.5,
  },
  r5: {
    // Serra da Cantareira
    path: [
      [-46.6338, -23.4183],
      [-46.6312, -23.4201],
      [-46.6284, -23.4224],
      [-46.6251, -23.4238],
      [-46.6219, -23.4257],
    ],
    rating: 4.7,
  },
  r6: {
    // Orla de Copacabana — shorter stretch
    path: [
      [-43.1822, -22.9711],
      [-43.1861, -22.9756],
      [-43.1903, -22.9798],
    ],
    rating: 4.4,
  },
  r7: {
    // Orla do Rio Cachoeira — Joinville downtown riverside boardwalk
    path: [
      [-48.8487, -26.3021],
      [-48.8465, -26.3033],
      [-48.8442, -26.3042],
      [-48.8418, -26.3049],
      [-48.8394, -26.3056],
    ],
    rating: 4.5,
  },
  r8: {
    // Ciclovia da Ferroviária — Joinville bike-path corridor
    path: [
      [-48.8558, -26.3132],
      [-48.8521, -26.3095],
      [-48.8489, -26.3057],
      [-48.8462, -26.3018],
      [-48.8438, -26.2978],
      [-48.8415, -26.2940],
    ],
    rating: 4.7,
  },
  r9: {
    // Trilha do Morro do Iririú — Iririú neighborhood hill trail
    path: [
      [-48.8267, -26.2812],
      [-48.8251, -26.2798],
      [-48.8233, -26.2789],
      [-48.8214, -26.2783],
      [-48.8196, -26.2779],
    ],
    rating: 4.8,
  },
  r10: {
    // Volta do Parque da Cidade — Parque Zoobotânico loop
    path: [
      [-48.8352, -26.2961],
      [-48.8329, -26.2949],
      [-48.8309, -26.2958],
      [-48.8304, -26.2978],
      [-48.8321, -26.2993],
      [-48.8344, -26.2988],
      [-48.8352, -26.2961],
    ],
    rating: 4.6,
  },
  r11: {
    // Ciclovia da Avenida Beira-Rio — long riverside bike corridor stretching south
    path: [
      [-48.8558, -26.3132],
      [-48.8535, -26.3168],
      [-48.8501, -26.3201],
      [-48.8464, -26.3227],
      [-48.8422, -26.3244],
      [-48.8379, -26.3252],
      [-48.8336, -26.3248],
    ],
    rating: 4.5,
  },
  r12: {
    // Circuito Ciclístico do América — loop through the América neighborhood
    path: [
      [-48.8611, -26.2937],
      [-48.8578, -26.2915],
      [-48.8541, -26.2918],
      [-48.8517, -26.2944],
      [-48.8524, -26.2976],
      [-48.8558, -26.2991],
      [-48.8595, -26.2978],
      [-48.8611, -26.2937],
    ],
    rating: 4.4,
  },
  r13: {
    // Ciclofaixa do Centro — short downtown loop
    path: [
      [-48.8459, -26.3038],
      [-48.8434, -26.3023],
      [-48.8408, -26.3033],
      [-48.8406, -26.3057],
      [-48.8430, -26.3070],
      [-48.8457, -26.3062],
      [-48.8459, -26.3038],
    ],
    rating: 4.3,
  },
  r14: {
    // Volta do Petrópolis — loop through the Petrópolis neighborhood
    path: [
      [-48.8296, -26.2954],
      [-48.8271, -26.2939],
      [-48.8248, -26.2951],
      [-48.8251, -26.2975],
      [-48.8277, -26.2985],
      [-48.8296, -26.2954],
    ],
    rating: 4.6,
  },
  r15: {
    // Ciclofaixa da Dona Francisca — Centro to Petrópolis corridor
    path: [
      [-48.8459, -26.3038],
      [-48.8410, -26.3010],
      [-48.8360, -26.2985],
      [-48.8310, -26.2965],
      [-48.8280, -26.2948],
      [-48.8296, -26.2954],
    ],
    rating: 4.5,
  },
  r16: {
    // Ciclofaixa do Petrópolis — short loop just south of the Volta do Petrópolis
    path: [
      [-48.8310, -26.2960],
      [-48.8288, -26.2945],
      [-48.8265, -26.2955],
      [-48.8267, -26.2978],
      [-48.8292, -26.2988],
      [-48.8310, -26.2960],
    ],
    rating: 4.4,
  },
  r17: {
    // Giro Ciclístico do Petrópolis — small loop further east, near Boa Vista
    path: [
      [-48.8258, -26.2932],
      [-48.8238, -26.2920],
      [-48.8218, -26.2930],
      [-48.8220, -26.2950],
      [-48.8242, -26.2958],
      [-48.8258, -26.2932],
    ],
    rating: 4.2,
  },
};

export const MOCK_ACTIVITY_GEO: Record<string, ActivityGeo> = {
  p1: { position: [-46.6558, -23.5865] }, // Ibirapuera
  p2: { position: [-46.6598, -23.5891] }, // Ibirapuera, near David
  p3: { position: [-46.7208, -23.5450] }, // Villa-Lobos
  p4: { position: [-46.6919, -23.5558] }, // Vila Madalena
  p5: { position: [-46.6236, -23.5732] }, // Parque da Aclimação
};

export const MOCK_EVENT_GEO: Record<string, EventGeo> = {
  e1: { position: [-46.6576, -23.5874] }, // Ibirapuera
  e2: { position: [-43.1786, -22.5053] }, // Petrópolis
  e3: { position: [-46.7208, -23.5450] }, // Villa-Lobos
  e4: { position: [-46.7658, -23.4556] }, // Pico do Jaraguá
  e5: { position: [-43.1822, -22.9711] }, // Copacabana
};
