# Configurar Firebase (Firestore) para GoldFunX

La app usa **solo una colección** en Firestore: `distributionLogs` (System Logs del dashboard). Sigue estos pasos.

---

## 1. Crear proyecto en Firebase

1. Entra en [Firebase Console](https://console.firebase.google.com/).
2. **Agregar proyecto** → Pon nombre (ej. `goldfunx`) → Siguiente.
3. Desactiva Google Analytics si no lo quieres → Crear proyecto.

---

## 2. Activar Firestore

1. En el menú lateral: **Build** → **Firestore Database**.
2. **Crear base de datos**.
3. Elige **Empezar en modo de producción** (luego ajustas reglas si quieres).
4. Elige la región (ej. `us-central1` o la más cercana) → **Habilitar**.

---

## 3. Crear la colección `distributionLogs`

En Firestore no hace falta “crear” la colección vacía: se crea al añadir el primer documento. Puedes dejarla vacía; el dashboard mostrará System Logs vacío hasta que añadas documentos.

Cada documento = una línea del **System Logs** en el dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `transaction` | string | Signature de la transacción (ej. `5abc...xyz`) |
| `goldDistributed` | number | Cantidad de GOLD repartida en esa tx |
| `date` | string | Fecha/hora (ISO recomendado, ej. `2025-01-28T12:00:00Z`) |

**Ejemplo de documento:**  
- ID: auto-generado  
- `transaction`: `5abc123...`  
- `goldDistributed`: `100.5`  
- `date`: `2025-01-28T12:00:00.000Z`

Puedes añadir y editar documentos a mano en la consola de Firebase; el dashboard los mostrará ordenados por fecha (más recientes primero).

---

## 4. Obtener credenciales (Service Account)

1. En Firebase: ⚙️ **Configuración del proyecto** → pestaña **Cuentas de servicio**.
2. **Generar nueva clave privada** → Confirmar. Se descarga un JSON.
3. Abre el JSON y usa:
   - **project_id** → variable de entorno `FIREBASE_PROJECT_ID`
   - **client_email** → variable de entorno `FIREBASE_CLIENT_EMAIL`
   - **private_key** → variable de entorno `FIREBASE_PRIVATE_KEY` (la clave entera, con los `\n` reales o como string; en Vercel a veces hay que pegar con `\n` literales)

---

## 5. Variables de entorno

En tu `.env` local o en **Vercel → Project → Settings → Environment Variables** añade:

| Variable | Valor |
|----------|--------|
| `FIREBASE_PROJECT_ID` | `project_id` del JSON |
| `FIREBASE_CLIENT_EMAIL` | `client_email` del JSON |
| `FIREBASE_PRIVATE_KEY` | `private_key` del JSON (entre comillas si tiene saltos de línea) |

**Nota:** Si en Vercel la clave da error, prueba pegando el valor con `\n` como texto (no salto de línea real). La app reemplaza `\\n` por `\n` internamente.

---

## 6. Reglas de seguridad (opcional)

En Firestore → **Reglas**, para que solo el backend (con la service account) escriba y lea:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

La app usa la **Admin SDK** (service account) en el servidor, no el cliente; las reglas anteriores bloquean acceso directo desde el navegador.

---

**Resumen:** Solo necesitas la colección `distributionLogs`. Cada documento tiene `transaction`, `goldDistributed` y `date`. El dashboard lee esta colección y muestra el System Logs.
