// app/routes/auth.$.jsx
import { json } from "@remix-run/node";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { authenticate } from "../shopify.server"; // Certifique-se de que authenticate está configurado corretamente

export const loader = async ({ request }) => {
  // Realiza a autenticação do usuário
  const session = await authenticate.admin(request);

  // Cria o serviço de transporte personalizado (Carrier Service) no Shopify
  await shopifyApp.CarrierService.create({
    session,
    name: "Correios Shipping",
    callback_url: `${process.env.HOST}/calculate-shipping`, // URL do endpoint de cálculo de frete
    service_discovery: true,
  });

  return json({ success: true });
};
