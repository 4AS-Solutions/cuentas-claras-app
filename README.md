💰 Cuentas Claras

Controla tus finanzas personales con claridad.

Cuentas Claras es una aplicación web moderna para el control personal de ingresos y gastos.
Está diseñada para ofrecer una experiencia simple, clara y visualmente atractiva para gestionar finanzas personales de forma eficiente.

La plataforma permite registrar movimientos financieros, analizar gastos por categorías, visualizar estadísticas y administrar métodos de pago desde una interfaz moderna inspirada en aplicaciones fintech.

🚀 Demo

(Puedes agregar aquí cuando la despliegues)

https://cuentasclaras.app
📸 Screenshots

(Aquí puedes agregar capturas después)

Dashboard
Transactions
Cards
Analytics

✨ Características
📊 Dashboard financiero

KPIs de Ingresos, Gastos y Balance

Gráficas de gastos por categoría

Gráficas de gastos por mes

Insights automáticos de gasto

💸 Registro de movimientos

Ingresos y gastos

Categorías personalizadas

Métodos de pago

Asociación con tarjetas

Historial completo de movimientos

💳 Gestión de tarjetas

Tarjetas de crédito y débito

Diseño visual estilo fintech

Identificación por color

Últimos 4 dígitos

📈 Visualización de datos

Gráficas dinámicas

Análisis de hábitos financieros

Distribución de gastos

🔐 Autenticación

Registro de usuario

Inicio de sesión

Gestión de sesión segura con Supabase

📱 Diseño responsive

UI optimizada para desktop

UI optimizada para mobile

Componentes reutilizables

Experiencia moderna tipo fintech

🧠 Filosofía del proyecto

Cuentas Claras nace con un objetivo simple:

Darle a las personas claridad sobre su dinero.

Muchas aplicaciones financieras son complejas o poco intuitivas.
Cuentas Claras busca resolver esto con:

simplicidad

visualización clara

experiencia moderna

🛠️ Tecnologías utilizadas
Tecnología	Uso
Next.js 14	Framework principal
React	UI
TypeScript	Tipado
Supabase	Base de datos y autenticación
TailwindCSS	Estilos
Recharts	Gráficas
Lucide Icons	Iconografía
📦 Arquitectura del proyecto

El proyecto sigue una arquitectura modular basada en componentes reutilizables.

app/
  dashboard
  transactions
  cards
  auth

components/
  ui/
  cards/
  auth/

shared/
  supabase/

public/
  assets/
UI System

Se creó un pequeño design system interno para mantener consistencia visual.

Componentes principales:

components/ui/

Button.tsx
Card.tsx
IconButton.tsx
Input.tsx
Select.tsx
Textarea.tsx
PageContainer.tsx

Esto permite:

consistencia visual

reutilización

mantenimiento más fácil

⚙️ Instalación

Clonar repositorio

git clone https://github.com/tuusuario/cuentas-claras.git

Entrar al proyecto

cd cuentas-claras

Instalar dependencias

npm install

Crear archivo .env.local

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Correr el proyecto

npm run dev
🗄️ Base de datos

El proyecto utiliza Supabase (PostgreSQL).

Tablas principales:

users
transactions
categories
payment_methods
cards

Relaciones principales:

users
 └── transactions
      ├── categories
      ├── payment_methods
      └── cards
🧩 Funcionalidades actuales

✔ Autenticación
✔ Dashboard financiero
✔ Registro de ingresos y gastos
✔ Categorías
✔ Métodos de pago
✔ Tarjetas
✔ Visualización de datos

🔮 Roadmap

Funciones planeadas para próximas versiones:

📊 Finanzas
presupuestos mensuales
alertas de gasto
objetivos financieros

📱 Experiencia
PWA instalable
notificaciones

📈 Analytics
tendencias financieras
comparativas mensuales
predicciones de gasto

💳 Pagos
integración con bancos
sincronización automática

🤝 Contribuciones

Las contribuciones son bienvenidas.

Si deseas colaborar:
Fork del proyecto
Crear branch
Hacer cambios
Crear Pull Request

📄 Licencia
MIT License

👨‍💻 Autor
Desarrollado por Luis P. Salvador H.

⭐ Si te gusta el proyecto

No olvides dejar una ⭐ en el repositorio.