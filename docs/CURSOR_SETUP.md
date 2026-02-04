# Configuración de Documentación para Cursor

## 📁 Estructura de Archivos

Los archivos de documentación están organizados de la siguiente manera:

```
alpen-gas-demo/
├── .cursorrules                    # Configuración de Cursor (referencia la documentación)
└── docs/
    ├── HANDOVER.md                 # Documentación completa del proyecto
    ├── ARCHITECTURE_RULES.md       # Reglas de arquitectura y patrones
    └── CURSOR_SETUP.md             # Este archivo (guía de uso)
```

## ✅ Configuración Actual

### Archivos en la Carpeta `docs/`

Los archivos markdown están organizados en la carpeta `docs/` para mantener el proyecto ordenado:

- ✅ `docs/HANDOVER.md` - Documentación completa del proyecto
- ✅ `docs/ARCHITECTURE_RULES.md` - Reglas de arquitectura y patrones
- ✅ `.cursorrules` - En la raíz (configuración de Cursor que referencia `docs/`)

### Archivo `.cursorrules`

Este archivo le dice a Cursor:
- Qué documentación leer
- Dónde están los archivos
- Qué principios seguir

Cursor leerá automáticamente este archivo cuando trabajes en el proyecto.

## 🚀 Cómo Usar la Documentación

### Método 1: Automático (Recomendado)

Cursor leerá automáticamente:
- `.cursorrules` al inicio de cada sesión
- Los archivos referenciados cuando sean relevantes

**No necesitas hacer nada** - Cursor usará la documentación automáticamente.

### Método 2: Referencia Manual

Puedes referenciar los archivos manualmente en tus prompts:

```
@docs/HANDOVER.md ¿Cómo implemento el endpoint de eligibility?
```

```
@docs/ARCHITECTURE_RULES.md ¿Cuál es el patrón para crear un nuevo handler?
```

### Método 3: Chat con Documentación

En el chat de Cursor, puedes mencionar:

- "Según docs/HANDOVER.md, necesito implementar..."
- "Siguiendo docs/ARCHITECTURE_RULES.md, debería..."
- "Consulta docs/HANDOVER.md para ver los requisitos del endpoint"

## 📋 Qué Hace Cada Archivo

### `.cursorrules`
- Configuración inicial para Cursor
- Referencias a los otros archivos
- Principios generales del proyecto

### `HANDOVER.md`
- Visión general completa del proyecto
- Requisitos de backend y frontend
- Guía de implementación
- Checklist de producción
- Diagramas de arquitectura

### `ARCHITECTURE_RULES.md`
- Patrones de código específicos
- Ejemplos de implementación
- Reglas de arquitectura (Backend y Frontend)
- Estándares de TypeScript
- Mejores prácticas

## 🔧 Mantenimiento

### Cuando Actualices la Documentación

1. **Actualiza los archivos en la raíz** (no en subdirectorios)
2. **Actualiza `.cursorrules`** si cambias la estructura
3. **Verifica que los nombres de archivos coincidan** con las referencias

### Estructura Recomendada para Monorepos

Para proyectos monorepo como este:

```
proyecto-raiz/
├── .cursorrules              # ✅ Configuración de Cursor
├── HANDOVER.md               # ✅ Documentación principal
├── ARCHITECTURE_RULES.md     # ✅ Reglas de arquitectura
├── README.md                 # ✅ README del proyecto
└── packages/
    ├── ui/                   # Frontend
    └── api/                  # Backend
```

**Ventajas:**
- Cursor encuentra los archivos automáticamente
- Una sola fuente de verdad para todo el monorepo
- Fácil de mantener y actualizar

## 🎯 Mejores Prácticas

1. **Mantén los archivos actualizados** - Cuando cambies la arquitectura, actualiza la documentación
2. **Usa referencias específicas** - En tus prompts, menciona qué sección de la documentación necesitas
3. **Sigue los patrones** - La documentación define patrones claros, síguelos consistentemente
4. **Revisa antes de implementar** - Consulta `ARCHITECTURE_RULES.md` antes de crear nuevos archivos

## ❓ Troubleshooting

### Cursor no está usando la documentación

1. Verifica que los archivos estén en la raíz del proyecto
2. Verifica que `.cursorrules` exista y tenga las referencias correctas
3. Reinicia Cursor o recarga la ventana
4. Referencia manualmente con `@HANDOVER.md` o `@ARCHITECTURE_RULES.md`

### Los archivos están en un subdirectorio

Si los archivos están en `packages/AlpGasDemo-main/`, muévelos a la raíz:

```bash
# Desde la raíz del proyecto
cp packages/AlpGasDemo-main/HANDOVER.md .
cp packages/AlpGasDemo-main/ARCHITECTURE_RULES.md .
```

### Cursor no encuentra los archivos

- Asegúrate de que los nombres sean exactos: `HANDOVER.md` y `ARCHITECTURE_RULES.md`
- Verifica que no haya espacios extra en los nombres
- Usa referencias manuales con `@` si es necesario

## 📚 Recursos Adicionales

- [Cursor Documentation](https://docs.cursor.com)
- [Cursor Rules Guide](https://docs.cursor.com/context/rules)
