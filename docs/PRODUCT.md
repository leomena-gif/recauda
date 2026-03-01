Recauda.net — Documento Base de Conocimiento (MVP)
1. Resumen Ejecutivo
Recauda.net es una plataforma web SaaS que digitaliza la recaudación de fondos comunitarios (rifas y venta de comida) para clubes, escuelas, comisiones vecinales y organizaciones sin fines de lucro.
 Su misión es reemplazar el caos de planillas y WhatsApp por una gestión simple, transparente y profesional accesible desde cualquier celular.

2. Problema y Oportunidad
Problema:
 Las organizaciones comunitarias gestionan sus eventos con herramientas manuales (papel, Excel, WhatsApp), generando:
Desorden y pérdida de información.
Dificultad para controlar ventas y cobros.
Oportunidad:
 Ofrecer una herramienta extremadamente simple, adaptada al contexto LATAM (baja conectividad, usuarios no técnicos), que profesionalice la recaudación y devuelva confianza y control a las comunidades.

3. Propuesta de Valor (MVP)
"Ayudamos a comunidades y organizaciones a recaudar fondos con confianza y sin caos, desde una única plataforma web fácil de usar."
Para la Organizadora (Susana): visión 360° en tiempo real, balances automáticos, control del dinero y vendedores.
Para el Vendedor (Carlos): herramienta ultra-simple sin contraseñas para registrar ventas y cobros.
Para la Compradora (Ana): comprobante digital al instante que genera confianza y transparencia.



4. Tipos de Usuario y Experiencia
👩‍💼 Organizadora (Susana)
Objetivo: Tener control total del evento sin estrés manual.

Flujo:
Crea una cuenta (organización o evento).
Define el producto a vender (rifa o comida).
Carga vendedores y les asigna stock.
Envía a cada uno su Magic Link.
Monitorea progreso en el Dashboard (ventas, cobros, pendientes).
Cierra el evento y genera el Balance PDF.


Necesidades:
Ver progreso global en tiempo real.
Saber cuánto dinero está recaudado vs. pendiente.
Reducir errores y tiempos de rendición.


Feature Clave:

 📊 Dashboard de Campaña
% Vendido / % Cobrado.
Totales por vendedor.
Balance automático descargable.



👨‍🔧 Vendedor (Carlos)
Objetivo: Registrar sus ventas sin talonarios ni estrés.
 
Flujo:
Recibe un Magic Link (sin login).
Ve su stock asignado.
Marca cada ítem como:
Disponible
Vendido
Cobrado
Ingresa nombre y WhatsApp del comprador.
El sistema envía el comprobante automáticamente.
Entrega el dinero al organizador y obtiene PDF de rendición.


Necesidades:
Simplicidad absoluta.
Seguridad en la rendición.
Registro claro de ventas y cobros.


Feature Clave:
 📱 Panel de Vendedor Liviano
Total vendido / cobrado.
Botón “Marcar Venta”.
Generación instantánea de comprobante PDF.

👩 Compradora (Ana)
Objetivo: Confiar en que su compra fue registrada.

 Flujo:
Le da su WhatsApp al vendedor.
Recibe un mensaje con su comprobante PDF.
Guarda el comprobante o lo comparte.
Necesidades:
Confianza.
Comprobante inmediato.
Facilidad (sin registrarse).


Feature Clave:
 💬 Comprobante Automático
Integración con WhatsApp API (envío de PDF + mensaje estándar).
Datos: nombre del evento, número/producto, vendedor y fecha.

5. Flujos Principales (Mapa General)
Círculo de Confianza:
Organizadora crea evento y vendedores.
Sistema genera Magic Links.
Vendedor vende y marca ítem.
Comprador recibe comprobante.
Dashboard se actualiza en tiempo real.
Vendedor rinde dinero → se genera PDF de cierre.
Organizadora valida y cierra campaña.

6. Funcionalidades del MVP
Área
Feature
Usuario
Prioridad
Gestión de Campañas
Crear/editar/finalizar evento, definir producto, asignar stock
Organizadora
🟢 Alta
Magic Links
Acceso sin login a panel de vendedor
Vendedor
🟢 Alta
Gestión de Ventas
Estados: Disponible → Vendido → Cobrado
Vendedor
🟢 Alta
Comprobante Automático
Generación y envío de PDF vía WhatsApp
Vendedor/Comprador
🟡 Media
Dashboard de Seguimiento
Progreso, totales y balances por vendedor
Organizadora
🟢 Alta
Balance Final (PDF)
Cierre automático del evento
Organizadora
🟡 Media


7. Métricas de Éxito (MVP)
Activación: % de vendedores que registran al menos una venta.
Finalización: % de campañas completadas con balance cerrado.
Confianza: Nº total de PDFs generados (ventas + rendiciones).
Retención: Organizadores que crean un segundo evento.
NPS: Satisfacción de organizadores y vendedores.

8. Riesgos y Supuestos

Riesgo

Mitigación
Adopción baja de vendedores no técnicos
Magic Link + interfaz minimalista
Envío de comprobantes fallido
Fallback: descarga local del PDF
Falta de pago integrado
Mantener mecánica “Cobrado manual” en MVP
Competencia indirecta (Excel/WhatsApp)
Foco en confianza y profesionalización


9. Modelo de Negocio (MVP)
Modelo híbrido
Freemium + Pago por uso/evento (post-evento) + Servicios puntuales + Patrocinadores solidarios

Características principales:
Acceso libre y gratuito a funciones básicas.
Cobro posterior al evento según el nivel de uso o las funciones premium activadas.
Emisión automática de factura u orden de pago post-evento (sin pasarela).
Patrocinadores o fundaciones pueden cubrir parte del costo del uso.
Comunicación centrada en la reciprocidad y el propósito social.

Flujo operativo sugerido

Creación del evento (uso libre)
La ONG accede sin fricción a todas las funciones básicas.
Ejecución del evento
Se usan herramientas de gestión, comunicación, registro o reportes.
Cierre automático del evento
El sistema calcula el uso (voluntarios, inscriptos, reportes, etc.).
Generación de orden de pago post-uso
Envío de factura o link de cobro vía correo/WhatsApp.
Plazo flexible (7–15 días) para abonar con los fondos del evento.
Liberación del siguiente evento
El pago o compromiso activa la creación de nuevos eventos.
Refuerza cultura de confianza y reciprocidad.
