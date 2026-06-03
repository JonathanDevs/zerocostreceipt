/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit to handle large base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Secure API endpoint for processing receipt images through Gemini
app.post('/api/process-receipt', async (req, res) => {
  try {
    const { image, customApiKey } = req.body;

    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({ error: 'A valid image object with data (base64) and mimeType is required.' });
    }

    // Determine which API key to use (custom key supplied by user or server fallback)
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'No Gemini API Key found. Please configure your API key in the Settings tab or on the server side.',
      });
    }

    // Initialize Gemini Client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const imagePart = {
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    };

    const textPart = {
      text: 'Extract all receipt details including emission date, seller name, tax identification matching RIF (V- or J- prefix in Venezuela, or local equivalent), items (description, quantity, price), subtotal, taxes, total, currency (such as USD, VES, EUR, etc.), and suggest a category matching the goods (Alimentación, Servicios, Transporte, Tecnología, Salud, Entretenimiento, Hogar, Educación, Otros). Return strictly formatted JSON matching the schema.',
    };

    // Use gemini-3.5-flash for maximum cost-effectiveness, speed, and standard vision
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fecha_emision: {
              type: Type.STRING,
              description: 'Fecha de emisión en formato YYYY-MM-DD. Si no tiene, estima basándose en la fecha actual u omite',
            },
            comercio: {
              type: Type.STRING,
              description: 'Nombre del comercio o establecimiento',
            },
            rif_o_identificacion_fiscal: {
              type: Type.STRING,
              description: 'RIF, NIT, RFC, NIF o identificación fiscal del comercio. Null si no se encuentra.',
            },
            subtotal: {
              type: Type.NUMBER,
              description: 'Subtotal neto antes de impuestos.',
            },
            impuestos: {
              type: Type.NUMBER,
              description: 'Suma de impuestos aplicados (IVA, etc.).',
            },
            total: {
              type: Type.NUMBER,
              description: 'Monto total final facturado.',
            },
            moneda: {
              type: Type.STRING,
              description: 'Código de moneda de tres letras (USD, VES, EUR, COP, etc.). Si no estás seguro, asume USD o la moneda visible.',
            },
            categoria_sugerida: {
              type: Type.STRING,
              description: 'Debe ser estrictamente una de estas opciones: Alimentación, Servicios, Transporte, Tecnología, Salud, Entretenimiento, Hogar, Educación, Otros',
            },
            items: {
              type: Type.ARRAY,
              description: 'Listado completo de ítems individuales.',
              items: {
                type: Type.OBJECT,
                properties: {
                  descripcion: { type: Type.STRING, description: 'Breve nombre o descripción del producto o servicio' },
                  cantidad: { type: Type.NUMBER, description: 'Cantidad comprada (por defecto 1)' },
                  precio_unitario: { type: Type.NUMBER, description: 'Precio unitario de este ítem' },
                },
                required: ['descripcion', 'cantidad', 'precio_unitario'],
              },
            },
          },
          required: [
            'fecha_emision',
            'comercio',
            'subtotal',
            'impuestos',
            'total',
            'moneda',
            'categoria_sugerida',
            'items',
          ],
        },
      },
    });

    const parsedText = response.text || '{}';
    const jsonResult = JSON.parse(parsedText.trim());

    return res.json(jsonResult);
  } catch (error: any) {
    console.error('Error processing receipt with Gemini:', error);
    return res.status(500).json({
      error: 'Failed to analyze the receipt with Gemini API.',
      details: error?.message || String(error),
    });
  }
});

// Configure Vite middleware or static files depending on mode
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZeroCostReceipt] Server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
