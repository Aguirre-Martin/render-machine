export type MachineConfig = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  tag: string;
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

export const MODEL_SRC =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";

export const MODEL_SRC_FALLBACK =
  "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb";
