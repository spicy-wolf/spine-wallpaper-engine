export type Configs = { width: number; height: number; meshes: Array<Config> };

type Config = {
  skeletonFileName: string;
  jsonFileName: string;
  atlasFileName: string;
  animationName: string;
  scale: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  cursorFollow?: {
    animationName: string;
    boneName: string;
    maxFollowDistance: number;
  };
};
