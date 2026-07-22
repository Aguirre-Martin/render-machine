export type MachineConfig = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  tag: string;
};

export type ChassisOption = {
  id: string;
  label: string;
  /** CSS color for swatch UI */
  swatch: string;
  /** RGB 0–1 for model-viewer material tint (phase 6) */
  baseColor: [number, number, number];
  videoUrl: string;
};

export type FinishOption = {
  id: string;
  label: string;
  description: string;
  videoUrl: string;
  /** PBR surface tweak applied on the live model (no glb reload) */
  metallic: number;
  roughness: number;
  /** Blend chassis color toward this RGB (demo-readable finish cue) */
  tint: [number, number, number];
  /** 0 = keep chassis only, 1 = full finish tint */
  tintStrength: number;
  /** Soft glow baked into the finish look */
  emissive: [number, number, number];
};

export type ModuleOption = {
  id: "thermalVision" | "lidar";
  label: string;
  description: string;
  price: number;
  videoUrl: string;
};

export type BuildStep = "chassis" | "finish" | "modules";

export type BuildModules = {
  thermalVision: boolean;
  lidar: boolean;
};

export type BuildConfig = {
  chassisId: string;
  finishId: string;
  modules: BuildModules;
  activeStep: BuildStep;
  /** Which option's video is currently shown */
  activeMediaId: string;
};

/**
 * Videos públicos de Wikimedia Commons (maquinaria / producción real).
 * Formato webm — compatible con Firefox/Chrome/Brave modernos.
 * CORS: access-control-allow-origin: *
 */
export const MACHINE_CONFIGS: MachineConfig[] = [
  {
    id: "valvulas",
    title: "Sistema de Válvulas Neumáticas",
    description:
      "Control de flujo automatizado con respuesta en milisegundos para alta presión industrial.",
    // Máquina automática de cadena — mecanismo industrial en operación
    videoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/37/Automatic_chain_making_machine.webm",
    tag: "Eficiencia 99%",
  },
  {
    id: "motor",
    title: "Motor de Accionamiento Directo",
    description:
      "Unidad de sellado continuo sin engranajes, reduciendo el desgaste térmico y el ruido operativo.",
    // Torno CNC — husillo / accionamiento en mecanizado
    videoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/CNC_lathe.webm",
    tag: "Bajo Consumo",
  },
  {
    id: "refrigeracion",
    title: "Módulo de Refrigeración Líquida",
    description:
      "Circuito cerrado para disipación de temperatura en jornadas de producción continua 24/7.",
    // Planta / línea de producción en operación continua
    videoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/Elite_Factory_in_Nazareth_Illit_video_2.webm",
    tag: "Carga Continua",
  },
  {
    id: "sensores",
    title: "Telemetría y Sensores Ópticos",
    description:
      "Monitoreo láser en tiempo real para detección de anomalías y parada de emergencia automática.",
    // Inspección de calidad en línea (visión / control de proceso)
    videoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Gigaset_Smartphone_Production_IV_Quality_Inspection.webm",
    tag: "Seguridad IA",
  },
];

const V = {
  valvulas: MACHINE_CONFIGS[0].videoUrl,
  motor: MACHINE_CONFIGS[1].videoUrl,
  refrigeracion: MACHINE_CONFIGS[2].videoUrl,
  sensores: MACHINE_CONFIGS[3].videoUrl,
} as const;

export const BASE_PRICE = 4500;

export const CHASSIS_OPTIONS: ChassisOption[] = [
  {
    id: "blanco-tactico",
    label: "Blanco Táctico",
    swatch: "#E8ECF0",
    // Slightly brighter so it reads white under model-viewer lighting
    baseColor: [0.96, 0.97, 0.98],
    videoUrl: V.valvulas,
  },
  {
    id: "amarillo-industrial",
    label: "Amarillo Industrial",
    swatch: "#E6B800",
    baseColor: [0.9, 0.72, 0],
    videoUrl: V.motor,
  },
  {
    id: "gris-carbono",
    label: "Gris Carbono",
    swatch: "#3A3F46",
    baseColor: [0.23, 0.25, 0.27],
    videoUrl: V.refrigeracion,
  },
];

export const FINISH_OPTIONS: FinishOption[] = [
  {
    // IDs kept stable; labels describe what DamagedHelmet actually shows
    id: "tornilleria-negra",
    label: "Mate Oscuro",
    description:
      "Baja el brillo (roughness alto) y oscurece un poco la superficie. En este demo el casco tiene un solo material.",
    videoUrl: V.valvulas,
    metallic: 0.12,
    roughness: 0.92,
    tint: [0.12, 0.12, 0.14],
    tintStrength: 0.28,
    emissive: [0, 0, 0],
  },
  {
    id: "naranja-hi-vis",
    label: "Tintado Naranja",
    description:
      "Aplica un wash naranja hi-vis sobre el color de chasis y un leve glow. Se nota al instante en el 3D.",
    videoUrl: V.motor,
    metallic: 0.22,
    roughness: 0.42,
    tint: [1, 0.35, 0.05],
    tintStrength: 0.45,
    emissive: [0.28, 0.07, 0],
  },
  {
    id: "plata",
    label: "Metálico Satinado",
    description:
      "Sube el metallic y baja roughness: la superficie se ve más cromada / plateada sobre el chasis.",
    videoUrl: V.sensores,
    metallic: 0.95,
    roughness: 0.16,
    tint: [0.82, 0.84, 0.88],
    tintStrength: 0.35,
    emissive: [0.03, 0.035, 0.04],
  },
];

export const MODULE_OPTIONS: ModuleOption[] = [
  {
    id: "thermalVision",
    label: "Visión Térmica",
    description: "Cámara IR para detección de puntos calientes en operación continua.",
    price: 150,
    videoUrl: V.refrigeracion,
  },
  {
    id: "lidar",
    label: "LIDAR",
    description: "Escaneo láser 360° para telemetría y parada de emergencia.",
    price: 300,
    videoUrl: V.sensores,
  },
];

export const BUILD_STEPS: { id: BuildStep; label: string }[] = [
  { id: "chassis", label: "Chasis" },
  { id: "finish", label: "Acabado" },
  { id: "modules", label: "Módulos" },
];

export const DEFAULT_BUILD: BuildConfig = {
  chassisId: CHASSIS_OPTIONS[0].id,
  finishId: FINISH_OPTIONS[0].id,
  modules: { thermalVision: false, lidar: false },
  activeStep: "chassis",
  activeMediaId: CHASSIS_OPTIONS[0].id,
};

export type ActiveMedia = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  tag: string;
};

export function getChassis(id: string): ChassisOption {
  return CHASSIS_OPTIONS.find((o) => o.id === id) ?? CHASSIS_OPTIONS[0];
}

export function getFinish(id: string): FinishOption {
  return FINISH_OPTIONS.find((o) => o.id === id) ?? FINISH_OPTIONS[0];
}

export function getModule(id: keyof BuildModules): ModuleOption {
  return MODULE_OPTIONS.find((o) => o.id === id) ?? MODULE_OPTIONS[0];
}

/** Resolve which video/title to show from activeMediaId. */
export function resolveActiveMedia(build: BuildConfig): ActiveMedia {
  const chassis = getChassis(build.chassisId);
  if (chassis.id === build.activeMediaId) {
    return {
      id: chassis.id,
      title: chassis.label,
      description: "Color de chasis seleccionado — preview técnico del acabado base.",
      videoUrl: chassis.videoUrl,
      tag: "Chasis",
    };
  }

  const finish = getFinish(build.finishId);
  if (finish.id === build.activeMediaId) {
    return {
      id: finish.id,
      title: finish.label,
      description: finish.description,
      videoUrl: finish.videoUrl,
      tag: "Acabado",
    };
  }

  const mod = MODULE_OPTIONS.find((o) => o.id === build.activeMediaId);
  if (mod) {
    return {
      id: mod.id,
      title: mod.label,
      description: mod.description,
      videoUrl: mod.videoUrl,
      tag: "Módulo",
    };
  }

  return {
    id: chassis.id,
    title: chassis.label,
    description: "Color de chasis seleccionado — preview técnico del acabado base.",
    videoUrl: chassis.videoUrl,
    tag: "Chasis",
  };
}

export function computeBuildPrice(build: BuildConfig): number {
  let total = BASE_PRICE;
  for (const mod of MODULE_OPTIONS) {
    if (build.modules[mod.id]) total += mod.price;
  }
  return total;
}

/** Human-readable summary line for the bottom bar. */
export function formatBuildSummary(build: BuildConfig): string {
  const chassis = getChassis(build.chassisId);
  const finish = getFinish(build.finishId);
  const parts = [`Chasis ${chassis.label}`, `Acabado ${finish.label}`];

  if (build.modules.thermalVision) parts.push("Visión Térmica Activa");
  if (build.modules.lidar) parts.push("LIDAR Activo");

  return parts.join(" | ");
}

export type BomLine = { label: string; price: number };

export function buildBomLines(build: BuildConfig): BomLine[] {
  const lines: BomLine[] = [
    { label: `Chasis — ${getChassis(build.chassisId).label}`, price: BASE_PRICE },
    { label: `Acabado — ${getFinish(build.finishId).label}`, price: 0 },
  ];

  for (const mod of MODULE_OPTIONS) {
    if (build.modules[mod.id]) {
      lines.push({ label: mod.label, price: mod.price });
    }
  }

  return lines;
}

export const MODEL_SRC =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";

export const MODEL_SRC_FALLBACK =
  "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb";
