// app/routes/calculate-shipping.jsx
import { json } from "@remix-run/node";
import axios from "axios";

export const loader = async ({ request }) => {
  const { destination, items } = await request.json();

  // Extraia o CEP de destino e o peso dos itens
  const cepDestino = destination.zip;
  const pesoTotal = items.reduce((total, item) => total + item.grams, 0);

  // Função para calcular o frete com a API dos Correios
  const calcularFrete = async (cepDestino, peso) => {
    const response = await axios.get(`URL_DA_API_DOS_CORREIOS`, {
      params: {
        sCepOrigem: "01001-000", // CEP de origem
        sCepDestino: cepDestino,
        nVlPeso: peso / 1000, // Peso em kg
        nCdServico: "41106,40010", // Código dos serviços PAC e Sedex
        // Outros parâmetros exigidos pela API dos Correios
      },
    });

    // Extrai os valores de PAC e Sedex
    const pac = response.data.valorPAC;
    const sedex = response.data.valorSedex;

    return { pac, sedex };
  };

  // Calcula as tarifas de frete usando a API dos Correios
  const freteCorreios = await calcularFrete(cepDestino, pesoTotal);

  // Retorna as taxas formatadas para o Shopify
  return json({
    rates: [
      {
        service_name: "Correios - PAC",
        service_code: "PAC",
        total_price: freteCorreios.pac * 100, // Converte para centavos
        currency: "BRL",
        min_delivery_date: "2024-11-10",
        max_delivery_date: "2024-11-15",
      },
      {
        service_name: "Correios - Sedex",
        service_code: "SEDEX",
        total_price: freteCorreios.sedex * 100, // Converte para centavos
        currency: "BRL",
        min_delivery_date: "2024-11-08",
        max_delivery_date: "2024-11-10",
      },
    ],
  });
};
