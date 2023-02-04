export type Configs = Array<Config>;

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
};
