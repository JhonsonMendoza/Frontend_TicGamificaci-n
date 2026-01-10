# Guía de Integración: Misiones y Logros en el Frontend

## Resumen Rápido

Se han implementado nuevos componentes y hooks para consumir las APIs de **Misiones** y **Logros**. Aquí está cómo integrarlos en tu aplicación.

---

## 📁 Estructura de Archivos Nuevos

```
frontend/src/
├── apis/
│   └── missions.api.ts          ✨ API client para misiones
├── hooks/
│   ├── useMissions.ts            ✨ Hook para gestionar misiones
│   └── useAchievements.ts        ✅ Hook para gestionar logros (ya existe)
├── components/
│   ├── missions/
│   │   ├── MissionCard.tsx       ✅ Tarjeta de misión de asignatura
│   │   ├── VulnerabilityMissionCard.tsx  ✨ Tarjeta de vulnerabilidad
│   │   ├── MissionsPanel.tsx     ✨ Panel con todas las misiones
│   │   └── index.ts              ✨ Exports
│   ├── achievements/
│   │   ├── AchievementPanel.tsx  ✅ Ya existe
│   │   ├── AchievementCard.tsx   ✅ Ya existe
│   │   ├── RecentAchievements.tsx ✅ Ya existe
│   │   ├── AchievementStatsCard.tsx ✅ Ya existe
│   │   └── index.ts              ✅ Ya existe
│   └── dashboard/
│       ├── DashboardSummary.tsx  ✨ Widget con resumen de misiones y logros
│       └── index.ts              ✨ Exports
└── app/
    ├── missions/
    │   └── page.tsx              ✨ Página completa de misiones
    └── achievements/
        └── page.tsx              ✅ Página de logros (ya existe)
```

---

## 🚀 APIs Disponibles

### missions.api.ts

```typescript
import { missionsApi } from '@/apis/missions.api';

// Obtener todas las misiones del usuario
await missionsApi.getUserMissions()

// Obtener misiones de un análisis específico
await missionsApi.getMissionsByAnalysis(analysisId)

// Completar una misión
await missionsApi.completeMission(id)

// Omitir una misión
await missionsApi.skipMission(id)

// Obtener estadísticas
await missionsApi.getMissionStats()

// Obtener misiones pendientes
await missionsApi.getPendingMissions()

// Obtener misiones completadas
await missionsApi.getCompletedMissions()

// Obtener por severidad
await missionsApi.getMissionsBySeverity('high')
```

---

## 🎣 Hooks Disponibles

### useMissions

```typescript
import { useMissions } from '@/hooks/useMissions';

// Usar en un componente
const {
  missions,              // Todas las misiones
  pendingMissions,       // Solo pendientes
  completedMissions,     // Solo completadas
  stats,                 // Estadísticas
  loading,              // Estado de carga
  error,                // Mensaje de error
  refetch,              // Función para recargar
  completeMission,      // Función para completar
  skipMission           // Función para omitir
} = useMissions();

// Si necesitas misiones de un análisis específico
const { missions } = useMissions(analysisId);
```

### useAchievements

```typescript
import { useAchievements } from '@/hooks/useAchievements';

const {
  achievements,          // Todos los logros
  stats,                // Estadísticas
  unlockedAchievements, // Solo desbloqueados
  lockedAchievements,   // Solo bloqueados
  loading,
  error,
  refetch,
  checkAndUnlock        // Verificar nuevos logros
} = useAchievements();
```

---

## 📊 Componentes Disponibles

### DashboardSummary

Widget de resumen con misiones pendientes, logros recientes y puntos.

```typescript
import { DashboardSummary } from '@/components/dashboard';

<DashboardSummary
  pendingMissions={missions.filter(m => m.status === 'pending')}
  completedMissions={missions.filter(m => m.status === 'fixed')}
  recentAchievements={unlockedAchievements.slice(0, 3)}
  totalPoints={stats?.totalPoints || 0}
  isLoading={loading}
/>
```

### MissionsPanel

Panel completo de misiones categorizadas por severidad.

```typescript
import { MissionsPanel } from '@/components/missions';

<MissionsPanel
  missions={missions}
  title="Mis Misiones"
  showOnlyPending={false}
  onComplete={completeMission}
  onSkip={skipMission}
  isLoading={loading}
/>
```

### VulnerabilityMissionCard

Tarjeta individual de misión de vulnerabilidad.

```typescript
import { VulnerabilityMissionCard } from '@/components/missions';

<VulnerabilityMissionCard
  mission={mission}
  onComplete={completeMission}
  onSkip={skipMission}
  isLoading={loading}
/>
```

### AchievementPanel

Panel completo de logros categorizados.

```typescript
import { AchievementPanel } from '@/components/achievements';

<AchievementPanel
  achievements={achievements}
  title="Mis Logros"
  showUnlockedOnly={false}
/>
```

### AchievementStatsCard

Card con estadísticas de logros.

```typescript
import { AchievementStatsCard } from '@/components/achievements';

<AchievementStatsCard stats={stats} />
```

### RecentAchievements

Lista de logros desbloqueados recientemente.

```typescript
import { RecentAchievements } from '@/components/achievements';

<RecentAchievements achievements={achievements} limit={3} />
```

---

## 📄 Páginas Disponibles

### /missions

Página completa de misiones con filtros (todas, pendientes, completadas, omitidas).

**URL**: `http://localhost:3000/missions`

### /achievements

Página completa de logros con estadísticas y categorización.

**URL**: `http://localhost:3000/achievements`

---

## 🔧 Ejemplo: Integrar en Dashboard Existente

```typescript
'use client';

import { useMissions } from '@/hooks/useMissions';
import { useAchievements } from '@/hooks/useAchievements';
import { DashboardSummary, RecentAchievements } from '@/components';

export default function Dashboard() {
  const {
    missions,
    pendingMissions,
    completedMissions,
    loading: missionsLoading,
    completeMission,
    skipMission
  } = useMissions();

  const {
    achievements,
    stats,
    loading: achievementsLoading
  } = useAchievements();

  if (missionsLoading || achievementsLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Widget de Resumen */}
      <DashboardSummary
        pendingMissions={pendingMissions}
        completedMissions={completedMissions}
        recentAchievements={achievements.filter(a => a.isUnlocked).slice(0, 3)}
        totalPoints={stats?.totalPoints || 0}
      />

      {/* Misiones Pendientes */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Misiones Pendientes</h2>
        {pendingMissions.length > 0 ? (
          <div className="grid gap-4">
            {pendingMissions.map(mission => (
              <VulnerabilityMissionCard
                key={mission.id}
                mission={mission}
                onComplete={completeMission}
                onSkip={skipMission}
              />
            ))}
          </div>
        ) : (
          <p>No hay misiones pendientes</p>
        )}
      </section>

      {/* Logros Recientes */}
      <RecentAchievements achievements={achievements} />
    </div>
  );
}
```

---

## 🎯 Flujo Completo

1. **Usuario sube un análisis** → Backend analiza código
2. **Se detectan vulnerabilidades** → Se generan misiones automáticamente
3. **Frontend muestra misiones** → Usuario ve tarjetas de VulnerabilityMissionCard
4. **Usuario completa misiones** → Se llama a `completeMission(id)`
5. **Backend verifica condiciones** → Se desbloquean logros automáticamente
6. **Frontend actualiza logros** → Se llama a `checkAndUnlock()` desde achievements
7. **Dashboard muestra progreso** → Misiones completadas, logros desbloqueados, puntos

---

## 📱 Endpoints Esperados en Backend

```
GET  /api/missions/user                    # Todas las misiones del usuario
GET  /api/missions/analysis/:id            # Misiones de un análisis
GET  /api/missions/:id                     # Misión individual
PATCH /api/missions/:id/complete           # Marcar como completada
PATCH /api/missions/:id/skip               # Marcar como omitida
GET  /api/missions/stats                   # Estadísticas
GET  /api/missions/pending                 # Misiones pendientes
GET  /api/missions/completed               # Misiones completadas
GET  /api/missions/severity/:severity      # Por severidad

GET  /api/achievements                     # Todos los logros
GET  /api/achievements/unlocked            # Solo desbloqueados
GET  /api/achievements/locked              # Solo bloqueados
GET  /api/achievements/check               # Verificar y desbloquear
GET  /api/achievements/stats               # Estadísticas
GET  /api/achievements/progress/:type      # Progreso de uno
```

---

## ✅ Checklist de Integración

- [ ] Crear archivos de API en `apis/missions.api.ts`
- [ ] Crear hook en `hooks/useMissions.ts`
- [ ] Crear componentes en `components/missions/`
- [ ] Crear widget en `components/dashboard/DashboardSummary.tsx`
- [ ] Actualizar página de misiones en `/missions`
- [ ] Integrar DashboardSummary en dashboard principal
- [ ] Probar consumo de APIs
- [ ] Verificar desbloqueo automático de logros
- [ ] Probar navegación entre /missions y /achievements

---

## 🐛 Troubleshooting

### Las misiones no carga

- Verifica que el token JWT esté en localStorage
- Revisa la consola del navegador para errores CORS
- Asegúrate que el backend tenga los endpoints implementados

### Los logros no se desbloquean

- Llama a `checkAndUnlock()` después de completar una misión
- Verifica que las condiciones en AchievementsService sean correctas
- Revisa los logs del backend para ver qué condiciones se evalúan

### Los componentes no se cargan

- Verifica que los imports sean correctos (`@/`)
- Usa `'use client'` en componentes que usen hooks
- Asegúrate que los tipos TypeScript existan

---

## 📖 Más Información

Para más detalles sobre:
- **Estructura de datos**: Ver `frontend/src/apis/missions.api.ts`
- **Lógica de backend**: Ver `backend/ACHIEVEMENTS_IMPLEMENTATION.md`
- **Componentes visuales**: Ver archivos individuales `.tsx`
